using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Enum;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent;

public class ScheduleEventUseCase : IScheduleEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ScheduleEventUseCase> _logger;

    public ScheduleEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        ILogger<ScheduleEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ScheduleResponseDto> Execute(ScheduleEventDto scheduleEventDto)
    {
        await _unitOfWork.BeginTransaction();

        try
        {
            var eventDetails = await _eventRepository.GetEventById(scheduleEventDto.EventId);

            if (eventDetails is null)
            {
                _logger.LogWarning("Event {EventId} does not exist", scheduleEventDto.EventId);
                throw new InvalidOperationException("Event does not exist.");
            }

            var validSlots = eventDetails.GetValidSlots();
            var selectedSlotNormalized = SlotTimeHelper.Normalize(scheduleEventDto.SelectedSlot, eventDetails.SessionDuration);

            if (selectedSlotNormalized < eventDetails.StartTime || selectedSlotNormalized >= eventDetails.EndTime)
            {
                _logger.LogWarning("Slot {Slot} is out of event time bounds", selectedSlotNormalized);
                throw new InvalidOperationException("Slot is out of allowed event time range.");
            }

            if (!validSlots.Any(slot =>
                slot.Year == selectedSlotNormalized.Year &&
                slot.Month == selectedSlotNormalized.Month &&
                slot.Day == selectedSlotNormalized.Day &&
                slot.Hour == selectedSlotNormalized.Hour &&
                slot.Minute == selectedSlotNormalized.Minute
            ))
            {
                throw new InvalidOperationException("Invalid slot selected.");
            }

            var slotInUse = await _eventRepository.IsSlotInUse(scheduleEventDto.EventId, selectedSlotNormalized);

            if (slotInUse)
            {
                _logger.LogWarning("Slot {Slot} is already in use for event {EventId}", selectedSlotNormalized, scheduleEventDto.EventId);
                throw new InvalidOperationException("Slot is already in use.");
            }

            var alreadyScheduledInThisEvent = await _eventRepository.HasUserScheduledEvent(scheduleEventDto.EventId, scheduleEventDto.UserId);

            if (alreadyScheduledInThisEvent)
            {
                _logger.LogWarning("User {UserId} has already scheduled event {EventId}", scheduleEventDto.UserId, scheduleEventDto.EventId);
                throw new InvalidOperationException("User has already scheduled this event.");
            }

            var alreadyScheduledInAnyEvent = await _eventRepository.HasUserScheduledAnyEventOnSameDay(scheduleEventDto.EventId, scheduleEventDto.UserId);

            if (alreadyScheduledInAnyEvent)
            {
                _logger.LogWarning("User {UserId} has already scheduled another event on the same day", scheduleEventDto.UserId);
                throw new InvalidOperationException("User has already scheduled another event on the same day.");
            }

            var schedule = new EventSchedule
            {
                EventId = scheduleEventDto.EventId,
                UserId = scheduleEventDto.UserId,
                ScheduleTime = selectedSlotNormalized,
                Status = ScheduleStatus.Active,
            };

            await _eventRepository.AddInterestedUser(schedule);
            await _unitOfWork.Commit();

            return new ScheduleResponseDto
            {
                ScheduleId = schedule.Id,
                Message = $"User {scheduleEventDto.UserId} successfully scheduled for event {scheduleEventDto.EventId} at {selectedSlotNormalized}."
            };
        }
        catch (Exception ex)
        {
            await _unitOfWork.Rollback();
            _logger.LogError(ex, "Error scheduling event {EventId} for user {UserId}", scheduleEventDto.EventId, scheduleEventDto.UserId);
            throw;
        }
    }
}