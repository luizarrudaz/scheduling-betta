using FluentValidation;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;

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

    public async Task<Guid> Execute(EventDto command)
    {
        await _eventValidator.ValidateAndThrowAsync(command);

        var sessionDuration = TimeSpan.FromMinutes(command.SessionDuration);

        try
        {
            var availableSlots = _slotCalculator.CalculateSlots(
                command.StartTime,
                command.EndTime,
                sessionDuration);

            var eventAggregate = Event.Create(
                command.Title,
                sessionDuration,
                command.Location,
                command.StartTime,
                command.EndTime,
                availableSlots);

            if (command.BreakWindow is not null)
            {
                await _breakWindowValidator.ValidateAndThrowAsync(command.BreakWindow);
                eventAggregate.AddBreakWindow(command.BreakWindow.BreakStart, command.BreakWindow.BreakEnd);
            }

            await _eventRepository.AddEvent(eventAggregate);
            await _unitOfWork.Commit();

            return eventAggregate.PublicId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Slot calculation failed for {Title}", command.Title);
            throw new Exception("Invalid event timing configuration", ex);
        }
    }
}