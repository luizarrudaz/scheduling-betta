using SchedulingBetta.API.Application.DTOs.Auth;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.ValueObjects;
using System.Linq.Expressions;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
{
    public class GetAllSchedulesEventUseCase : IGetAllSchedulesEventUseCase
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILogger<GetAllSchedulesEventUseCase> _logger;
        private readonly ILdapAuthService _ldapAuthService;

        public GetAllSchedulesEventUseCase(
            IEventRepository eventRepository,
            ILogger<GetAllSchedulesEventUseCase> logger,
            ILdapAuthService ldapAuthService)
        {
            _eventRepository = eventRepository;
            _logger = logger;
            _ldapAuthService = ldapAuthService;
        }

        public async Task<List<GetScheduledEventDto>> Execute(GetAllSchedulesEventRequestDto request)
        {
            _logger.LogInformation("Fetching event schedules with date/sort filters from repository.");
            var schedulesFromDb = await _eventRepository.GetAllSchedules(request);

            var result = new List<GetScheduledEventDto>();

            var uniqueUserSids = schedulesFromDb.Select(s => s.UserId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
            var userInfoCache = new Dictionary<string, LdapUserInfoDto>();
            if (uniqueUserSids.Any())
            {
                foreach (var sid in uniqueUserSids)
                {
                    try
                    {
                        if (!userInfoCache.ContainsKey(sid))
                        {
                            userInfoCache[sid] = _ldapAuthService.GetUserInfoBySid(sid);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Could not fetch LDAP info for SID {SID}", sid);
                        userInfoCache[sid] = new LdapUserInfoDto { DisplayName = "Usuário não encontrado", Email = "N/A" };
                    }
                }
            }

            foreach (var schedule in schedulesFromDb)
            {
                try
                {
                    if (schedule.Event == null)
                    {
                        _logger.LogWarning("Schedule with ID {ScheduleId} has a null Event reference and will be skipped.", schedule.Id);
                        continue;
                    }

                    userInfoCache.TryGetValue(schedule.UserId, out var userInfo);

                    result.Add(new GetScheduledEventDto
                    {
                        Id = schedule.Id,
                        UserId = schedule.UserId,
                        DisplayName = userInfo?.DisplayName ?? schedule.UserId,
                        Email = userInfo?.Email ?? "N/A",
                        SelectedSlot = DateTimeHelper.ConvertFromUtc(schedule.ScheduleTime),
                        Status = (Domain.Enum.ScheduleStatus)(int)schedule.Status,
                        CreatedAt = DateTimeHelper.ConvertFromUtc(schedule.CreatedAt),
                        Event = new GetEventDto
                        {
                            Id = schedule.Event.Id,
                            Title = schedule.Event.Title,
                            SessionDuration = schedule.Event.SessionDuration,
                            Location = schedule.Event.Location,
                            StartTime = DateTimeHelper.ConvertFromUtc(schedule.Event.StartTime),
                            EndTime = DateTimeHelper.ConvertFromUtc(schedule.Event.EndTime),
                            BreakWindow = schedule.Event.HasBreak && schedule.Event.BreakStart.HasValue && schedule.Event.BreakEnd.HasValue ? new BreakWindowDto
                            {
                                BreakStart = DateTimeHelper.ConvertFromUtc(schedule.Event.BreakStart.Value),
                                BreakEnd = DateTimeHelper.ConvertFromUtc(schedule.Event.BreakEnd.Value)
                            } : null,
                            AvailableSlots = schedule.Event.AvailableSlots
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process schedule with ID {ScheduleId}. It will be skipped.", schedule.Id);
                }
            }

            var filteredResult = result;
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                var term = request.SearchTerm.ToLowerInvariant();
                filteredResult = result.Where(dto =>
                    (dto.Event?.Title?.ToLowerInvariant().Contains(term) ?? false) ||
                    (dto.DisplayName?.ToLowerInvariant().Contains(term) ?? false) ||
                    (dto.Email?.ToLowerInvariant().Contains(term) ?? false)
                ).ToList();
            }

            if (!string.IsNullOrEmpty(request.SortKey))
            {
                var isDescending = request.SortDirection?.ToLower() == "descending";

                Expression<Func<GetScheduledEventDto, object>> keySelector = request.SortKey.ToLower() switch
                {
                    "event.title" => s => s.Event.Title,
                    "displayname" => s => s.DisplayName,
                    "email" => s => s.Email,
                    "event.sessionduration" => s => s.Event.SessionDuration,
                    "selectedslot" => s => s.SelectedSlot,
                    "createdat" => s => s.CreatedAt,
                    _ => s => s.Id
                };

                if (isDescending)
                {
                    return filteredResult.OrderByDescending(keySelector.Compile()).ToList();
                }
                return filteredResult.OrderBy(keySelector.Compile()).ToList();
            }

            return filteredResult;
        }
    }
}