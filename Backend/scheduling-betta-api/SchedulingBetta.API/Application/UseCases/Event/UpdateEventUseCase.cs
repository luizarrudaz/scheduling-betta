using FluentValidation;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IEventUseCases;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.Event;

public class UpdateEventUseCase : IUpdateEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<EventDto> _eventValidator;
    private readonly IValidator<BreakWindowDto> _breakWindowValidator;
    private readonly ISlotCalculator _slotCalculator;
    private readonly IEventNotificationService _eventNotificationService;
    private readonly ILogger<UpdateEventUseCase> _logger;

    public UpdateEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IValidator<EventDto> eventValidator,
        IValidator<BreakWindowDto> breakWindowValidator,
        ISlotCalculator slotCalculator,
        IEventNotificationService eventNotificationService,
        ILogger<UpdateEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _eventValidator = eventValidator;
        _breakWindowValidator = breakWindowValidator;
        _slotCalculator = slotCalculator;
        _eventNotificationService = eventNotificationService;
        _logger = logger;
    }

    public async Task<UpdateEventDto?> Execute(int id, EventDto command)
    {
        _logger.LogInformation("Starting event update: Id = {EventId}, Title = {Title}", id, command.Title ?? "NULL");

        var eventToUpdate = await _eventRepository.GetEventById(id);
        if (eventToUpdate == null)
        {
            _logger.LogWarning("Event with ID: {EventId} not found.", id);
            return null;
        }

        await _eventValidator.ValidateAndThrowAsync(command);
        _logger.LogInformation("EventDto validation succeeded for Title = {Title}", command.Title ?? "NULL");

        var sessionDuration = TimeSpan.FromMinutes(command.SessionDuration);
        _logger.LogInformation("Session duration set to {SessionDuration} minutes for event Id = {EventId}", command.SessionDuration, id);

        try
        {
            var availableSlots = _slotCalculator.CalculateSlots(
                command.StartTime,
                command.EndTime,
                sessionDuration);

            _logger.LogInformation("Calculated {SlotCount} available slots for event Id = {EventId}", availableSlots, id);

            eventToUpdate.Update(
                command.Title,
                sessionDuration,
                command.Location,
                DateTimeHelper.ConvertToUtc(command.StartTime),
                DateTimeHelper.ConvertToUtc(command.EndTime),
                availableSlots
            );

            _logger.LogInformation("Event aggregate updated for Id = {EventId}", id);

            if (command.BreakWindow is not null)
            {
                await _breakWindowValidator.ValidateAndThrowAsync(command.BreakWindow);
                _logger.LogInformation("BreakWindow validation succeeded for event Id = {EventId}", id);

                if (eventToUpdate.HasBreak)
                {
                    eventToUpdate.RemoveBreakWindow();
                    _logger.LogInformation("Existing BreakWindow removed for event Id = {EventId}", id);
                }

                eventToUpdate.AddBreakWindow(
                    DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakStart),
                    DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakEnd));

                _logger.LogInformation("BreakWindow added to event Id = {EventId}, BreakStart = {BreakStart:O}, BreakEnd = {BreakEnd:O}",
                    id, command.BreakWindow.BreakStart, command.BreakWindow.BreakEnd);
            }
            else
            {
                if (eventToUpdate.HasBreak)
                {
                    eventToUpdate.RemoveBreakWindow();
                    _logger.LogInformation("BreakWindow removed from event Id = {EventId}", id);
                }
            }

            await _eventRepository.UpdateEvent(eventToUpdate);
            await _unitOfWork.Commit();
            _logger.LogInformation("UnitOfWork committed for event Id = {EventId}", id);

            await _eventNotificationService.NotifyEventUpdated(eventToUpdate);

            _logger.LogInformation("Event update completed successfully for Id = {EventId}, Title = {Title}", id, command.Title ?? "NULL");

            return new UpdateEventDto
            {
                Title = eventToUpdate.Title,
                SessionDuration = (int)sessionDuration.TotalMinutes,
                Location = eventToUpdate.Location,
                StartTime = DateTimeHelper.ConvertFromUtc(eventToUpdate.StartTime),
                EndTime = DateTimeHelper.ConvertFromUtc(eventToUpdate.EndTime),
                BreakWindow = eventToUpdate.HasBreak
                    ? new BreakWindowDto
                    {
                        BreakStart = DateTimeHelper.ConvertFromUtc(eventToUpdate.BreakWindow!.Start),
                        BreakEnd = DateTimeHelper.ConvertFromUtc(eventToUpdate.BreakWindow!.End)
                    }
                    : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating event with ID: {EventId}", id);
            throw new ApplicationException("Failed to update event", ex);
        }
    }
}