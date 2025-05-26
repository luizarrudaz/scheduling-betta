using FluentValidation;
using Microsoft.Extensions.Logging;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.ValueObjects;

public class CreateEventUseCase : ICreateEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<EventDto> _eventValidator;
    private readonly IValidator<BreakWindowDto> _breakWindowValidator;
    private readonly ISlotCalculator _slotCalculator;
    private readonly ILogger<CreateEventUseCase> _logger;

    public CreateEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IValidator<EventDto> eventValidator,
        IValidator<BreakWindowDto> breakWindowValidator,
        ISlotCalculator slotCalculator,
        ILogger<CreateEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _eventValidator = eventValidator;
        _breakWindowValidator = breakWindowValidator;
        _slotCalculator = slotCalculator;
        _logger = logger;
    }

    public async Task<int> Execute(EventDto command)
    {
        _logger.LogInformation("Starting event creation: Title = {Title}, Start = {StartTime:O}, End = {EndTime:O}",
            command.Title ?? "NULL", command.StartTime, command.EndTime);

        await _eventValidator.ValidateAndThrowAsync(command);
        _logger.LogInformation("EventDto validation succeeded for Title = {Title}", command.Title ?? "NULL");

        var sessionDuration = TimeSpan.FromMinutes(command.SessionDuration);
        _logger.LogInformation("Session duration set to {SessionDuration} minutes for event Title = {Title}",
            command.SessionDuration, command.Title ?? "NULL");

        try
        {
            var availableSlots = _slotCalculator.CalculateSlots(
                command.StartTime,
                command.EndTime,
                sessionDuration);

            _logger.LogInformation("Calculated {SlotCount} available slots for event Title = {Title}", availableSlots, command.Title ?? "NULL");

            var eventAggregate = Event.Create(
                command.Title,
                sessionDuration,
                command.Location,
                DateTimeHelper.ConvertToUtc(command.StartTime),
                DateTimeHelper.ConvertToUtc(command.EndTime),
                availableSlots);

            _logger.LogInformation("Event aggregate created for Title = {Title}", command.Title ?? "NULL");

            if (command.BreakWindow is not null)
            {
                await _breakWindowValidator.ValidateAndThrowAsync(command.BreakWindow);
                _logger.LogInformation("BreakWindow validation succeeded for event Title = {Title}", command.Title ?? "NULL");

                eventAggregate.AddBreakWindow(
                    DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakStart),
                    DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakEnd));

                _logger.LogInformation("BreakWindow added to event Title = {Title}, BreakStart = {BreakStart:O}, BreakEnd = {BreakEnd:O}",
                    command.Title ?? "NULL", command.BreakWindow.BreakStart, command.BreakWindow.BreakEnd);
            }

            var eventEntity = await _eventRepository.AddEvent(eventAggregate);
            _logger.LogInformation("Event persisted with Id {EventId} for Title = {Title}", eventEntity.Id, command.Title ?? "NULL");

            await _unitOfWork.Commit();
            _logger.LogInformation("UnitOfWork committed for event Id {EventId}", eventEntity.Id);

            eventAggregate.SetId(eventEntity.Id);

            _logger.LogInformation("Event creation completed successfully for Id {EventId}, Title = {Title}", eventAggregate.Id, command.Title ?? "NULL");

            return eventAggregate.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Slot calculation failed for event Title = {Title}", command.Title ?? "NULL");
            throw new Exception("Invalid event timing configuration", ex);
        }
    }

}