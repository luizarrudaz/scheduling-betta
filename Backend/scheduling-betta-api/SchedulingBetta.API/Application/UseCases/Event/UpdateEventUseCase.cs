using FluentValidation;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IEventUseCases;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.Event;

public class UpdateEventUseCase : IUpdateEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<EventDto> _eventValidator;
    private readonly IValidator<BreakWindowDto> _breakWindowValidator;
    private readonly ISlotCalculator _slotCalculator;
    private readonly ILogger<UpdateEventUseCase> _logger;

    public UpdateEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IValidator<EventDto> eventValidator,
        IValidator<BreakWindowDto> breakWindowValidator,
        ISlotCalculator slotCalculator,
        ILogger<UpdateEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _eventValidator = eventValidator;
        _breakWindowValidator = breakWindowValidator;
        _slotCalculator = slotCalculator;
        _logger = logger;
    }

    public async Task<UpdateEventDto?> Execute(int id, EventDto command)
    {
        _logger.LogInformation("Attempting to update event with ID: {EventId}", id);

        var eventToUpdate = await _eventRepository.GetEventById(id);
        if (eventToUpdate == null)
        {
            _logger.LogWarning("Event with ID: {EventId} not found.", id);
            return null;
        }

        try
        {
            _logger.LogInformation("Validating input data for event update.");
            await _eventValidator.ValidateAndThrowAsync(command);

            if (command.BreakWindow != null)
            {
                _logger.LogInformation("Validating break window.");
                await _breakWindowValidator.ValidateAndThrowAsync(command.BreakWindow);
            }

            _logger.LogInformation("Updating event details.");
            eventToUpdate.Title = command.Title;
            eventToUpdate.SessionDuration = command.SessionDuration;
            eventToUpdate.Location = command.Location;
            eventToUpdate.StartTime = DateTimeHelper.ConvertToUtc(command.StartTime);
            eventToUpdate.EndTime = DateTimeHelper.ConvertToUtc(command.EndTime);

            if (command.BreakWindow != null)
            {
                eventToUpdate.HasBreak = true;
                eventToUpdate.BreakStart = DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakStart);
                eventToUpdate.BreakEnd = DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakEnd);
            }
            else
            {
                eventToUpdate.HasBreak = false;
                eventToUpdate.BreakStart = null;
                eventToUpdate.BreakEnd = null;
            }

            _logger.LogInformation("Calculating available slots for the event.");
            var sessionDuration = TimeSpan.FromMinutes(command.SessionDuration);
            var availableSlots = _slotCalculator.CalculateSlots(command.StartTime, command.EndTime, sessionDuration);
            eventToUpdate.AvailableSlots = availableSlots;

            _logger.LogInformation("Saving updated event to repository.");
            await _eventRepository.UpdateEvent(eventToUpdate);
            await _unitOfWork.Commit();

            _logger.LogInformation("Successfully updated event with ID: {EventId}", id);

            return new UpdateEventDto
            {
                Title = eventToUpdate.Title,
                SessionDuration = eventToUpdate.SessionDuration,
                Location = eventToUpdate.Location,
                StartTime = DateTimeHelper.ConvertFromUtc(eventToUpdate.StartTime),
                EndTime = DateTimeHelper.ConvertFromUtc(eventToUpdate.EndTime),
                BreakWindow = eventToUpdate.BreakStart.HasValue && eventToUpdate.BreakEnd.HasValue
                ? new BreakWindowDto
                {
                    BreakStart = DateTimeHelper.ConvertFromUtc(eventToUpdate.BreakStart.Value),
                    BreakEnd = DateTimeHelper.ConvertFromUtc(eventToUpdate.BreakEnd.Value)
                }
                : null,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating event with ID: {EventId}", id);
            throw new Exception("Failed to update event", ex);
        }
    }
}