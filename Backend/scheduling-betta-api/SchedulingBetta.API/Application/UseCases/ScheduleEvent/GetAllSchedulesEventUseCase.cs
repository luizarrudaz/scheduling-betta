using SchedulingBetta.API.Application.DTOs.Auth;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
{
    public class GetAllSchedulesEventUseCase : IGetAllSchedulesEventUseCase
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILogger<GetAllSchedulesEventUseCase> _logger;
        // Adicione o ILdapAuthService se precisar buscar DisplayName e Email
        private readonly ILdapAuthService _ldapAuthService;

        public GetAllSchedulesEventUseCase(
            IEventRepository eventRepository,
            ILogger<GetAllSchedulesEventUseCase> logger,
            ILdapAuthService ldapAuthService) // Adicione aqui
        {
            _eventRepository = eventRepository;
            _logger = logger;
            _ldapAuthService = ldapAuthService; // Adicione aqui
        }

        public async Task<List<GetScheduledEventDto>> Execute()
        {
            _logger.LogInformation("Fetching all event schedules");
            var schedules = await _eventRepository.GetAllSchedules();
            var result = new List<GetScheduledEventDto>();

            // Otimização para buscar dados do LDAP
            var uniqueUserSids = schedules.Select(s => s.UserId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
            var userInfoCache = new Dictionary<string, LdapUserInfoDto>();
            foreach (var sid in uniqueUserSids)
            {
                try
                {
                    userInfoCache[sid] = _ldapAuthService.GetUserInfoBySid(sid);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not fetch LDAP info for SID {SID}", sid);
                }
            }

            foreach (var schedule in schedules)
            {
                try
                {
                    // Pula o registro se o evento associado for nulo, evitando o crash
                    if (schedule.Event == null)
                    {
                        _logger.LogWarning("Schedule with ID {ScheduleId} has a null Event reference and will be skipped.", schedule.Id);
                        continue;
                    }

                    LdapUserInfoDto userInfo = null;
                    if (!string.IsNullOrEmpty(schedule.UserId))
                    {
                        userInfoCache.TryGetValue(schedule.UserId, out userInfo);
                    }

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
                    // Se qualquer outro erro ocorrer, ele é registrado e o sistema continua.
                    _logger.LogError(ex, "Failed to process schedule with ID {ScheduleId}. It will be skipped.", schedule.Id);
                }
            }
            return result;
        }
    }
}