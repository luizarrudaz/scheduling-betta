using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
{
    public class GetAllSchedulesByUserUseCase : IGetAllSchedulesByUserUseCase
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILogger<GetAllSchedulesByUserUseCase> _logger;

        public GetAllSchedulesByUserUseCase(IEventRepository eventRepository, ILogger<GetAllSchedulesByUserUseCase> logger)
        {
            _eventRepository = eventRepository;
            _logger = logger;
        }

        public async Task<List<GetScheduledEventDto>> Execute(string userId)
        {
            _logger.LogInformation("Fetching event schedules for user {UserId}", userId);

            var schedules = await _eventRepository.GetAllSchedulesByUser(userId);

            var result = schedules.Select(schedule => new GetScheduledEventDto
            {
                Id = schedule.Id,
                //EventId = schedule.EventId,
                UserId = schedule.UserId,
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
                    BreakWindow = schedule.Event.HasBreak != null ? new BreakWindowDto
                    {
                        BreakStart = schedule.Event.BreakStart != default
                            ? DateTimeHelper.ConvertFromUtc(schedule.Event.BreakStart.Value)
                            : default,
                        BreakEnd = schedule.Event.BreakEnd != default
                            ? DateTimeHelper.ConvertFromUtc(schedule.Event.BreakEnd.Value)
                            : default
                    } : null,
                    AvailableSlots = schedule.Event.AvailableSlots
                }
            }).ToList();

            return result;
        }
    }
}
