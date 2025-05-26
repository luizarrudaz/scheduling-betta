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
        _logger.LogInformation("Starting scheduling process for User {UserId} on Event {EventId}", scheduleEventDto.UserId, scheduleEventDto.EventId);

        await _unitOfWork.BeginTransaction();

        try
        {
            _logger.LogInformation("Fetching event details for EventId {EventId}", scheduleEventDto.EventId);
            var eventDetails = await _eventRepository.GetEventById(scheduleEventDto.EventId);

            if (eventDetails is null)
            {
                _logger.LogWarning("Event {EventId} does not exist", scheduleEventDto.EventId);
                throw new InvalidOperationException("Event does not exist.");
            }

            _logger.LogInformation("Event found: {Title} with duration {Duration} minutes", eventDetails.Title, eventDetails.SessionDuration);

            var validSlots = eventDetails.GetValidSlots();
            var referenceStart = validSlots.Min().TimeOfDay;

            _logger.LogInformation("Normalizing selected slot {SelectedSlot} based on reference start {ReferenceStart} and session duration {SessionDuration}",
                scheduleEventDto.SelectedSlot, referenceStart, eventDetails.SessionDuration);

            var selectedSlotNormalized = SlotTimeHelper.Normalize(
                scheduleEventDto.SelectedSlot,
                eventDetails.SessionDuration,
                referenceStart);

            if (selectedSlotNormalized < eventDetails.StartTime || selectedSlotNormalized >= eventDetails.EndTime)
            {
                _logger.LogWarning("Slot {Slot} is out of event time bounds (Start: {StartTime}, End: {EndTime})", selectedSlotNormalized, eventDetails.StartTime, eventDetails.EndTime);
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
                _logger.LogWarning("Selected slot {Slot} is invalid for event {EventId}", selectedSlotNormalized, scheduleEventDto.EventId);
                throw new InvalidOperationException("Invalid slot selected.");
            }

            _logger.LogInformation("Checking if slot {Slot} is already in use for Event {EventId}", selectedSlotNormalized, scheduleEventDto.EventId);
            var slotInUse = await _eventRepository.IsSlotInUse(scheduleEventDto.EventId, selectedSlotNormalized);

            if (slotInUse)
            {
                _logger.LogWarning("Slot {Slot} is already in use for event {EventId}", selectedSlotNormalized, scheduleEventDto.EventId);
                throw new InvalidOperationException("Slot is already in use.");
            }

            _logger.LogInformation("Checking if User {UserId} has already scheduled this event {EventId}", scheduleEventDto.UserId, scheduleEventDto.EventId);
            var alreadyScheduledInThisEvent = await _eventRepository.HasUserScheduledEvent(scheduleEventDto.EventId, scheduleEventDto.UserId);

            if (alreadyScheduledInThisEvent)
            {
                _logger.LogWarning("User {UserId} has already scheduled event {EventId}", scheduleEventDto.UserId, scheduleEventDto.EventId);
                throw new InvalidOperationException("User has already scheduled this event.");
            }

            _logger.LogInformation("Checking if User {UserId} has already scheduled another event on the same day as Event {EventId}", scheduleEventDto.UserId, scheduleEventDto.EventId);
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

            _logger.LogInformation("Adding new schedule for User {UserId} on Event {EventId} at {ScheduleTime}", schedule.UserId, schedule.EventId, schedule.ScheduleTime);
            await _eventRepository.AddInterestedUser(schedule);

            await _unitOfWork.Commit();
            _logger.LogInformation("Transaction committed successfully for scheduling User {UserId} on Event {EventId}", schedule.UserId, schedule.EventId);

            return new ScheduleResponseDto
            {
                ScheduleId = schedule.Id,
                Message = $"User {scheduleEventDto.UserId} successfully scheduled for event {scheduleEventDto.EventId} at {scheduleEventDto.SelectedSlot:dd/MM/yyyy HH:mm}."
            };

        }
        catch (Exception ex)
        {
            await _unitOfWork.Rollback();
            _logger.LogError(ex,
                "Error scheduling event. EventId: {EventId}, UserId: {UserId}, SelectedSlot: {SelectedSlot:O}, ErrorMessage: {ErrorMessage}",
                scheduleEventDto.EventId,
                scheduleEventDto.UserId ?? "NULL",
                scheduleEventDto.SelectedSlot,
                ex.Message);
            throw;
        }
    }
}