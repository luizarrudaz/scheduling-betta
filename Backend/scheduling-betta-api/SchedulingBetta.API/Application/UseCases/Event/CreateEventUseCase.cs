using FluentValidation;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;
using SchedulingBetta.API.Domain.ValueObjects;

public class CreateEventUseCase : ICreateEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<EventDto> _eventValidator;
    private readonly IValidator<BreakWindowDto> _breakWindowValidator;
    private readonly ISlotCalculator _slotCalculator;
    private readonly IEventNotificationService _eventNotificationService;
    private readonly ILogger<CreateEventUseCase> _logger;

    public CreateEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IValidator<EventDto> eventValidator,
        IValidator<BreakWindowDto> breakWindowValidator,
        ISlotCalculator slotCalculator,
        IEventNotificationService eventNotificationService,
        ILogger<CreateEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _eventValidator = eventValidator;
        _breakWindowValidator = breakWindowValidator;
        _slotCalculator = slotCalculator;
        _eventNotificationService = eventNotificationService;
        _logger = logger;
    }

    public async Task<int> Execute(EventDto command)
    {
        _logger.LogInformation("Starting event creation: Title = {Title}, Start = {StartTime:O}, End = {EndTime:O}",
            command.Title ?? "NULL", command.StartTime, command.EndTime);

        await _unitOfWork.BeginTransaction();

        try
        {
            await _eventValidator.ValidateAndThrowAsync(command);
            var sessionDuration = TimeSpan.FromMinutes(command.SessionDuration);
            var availableSlots = _slotCalculator.CalculateSlots(
                command.StartTime,
                command.EndTime,
                sessionDuration);

            var eventAggregate = Event.Create(
                command.Title,
                sessionDuration,
                command.Location,
                DateTimeHelper.ConvertToUtc(command.StartTime),
                DateTimeHelper.ConvertToUtc(command.EndTime),
                availableSlots);

            if (command.BreakWindow is not null)
            {
                await _breakWindowValidator.ValidateAndThrowAsync(command.BreakWindow);
                eventAggregate.AddBreakWindow(
                    DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakStart),
                    DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakEnd));
            }

            var eventEntity = await _eventRepository.AddEvent(eventAggregate);
            await _unitOfWork.Commit();

            eventAggregate.SetId(eventEntity.Id);

            try
            {
                await _eventNotificationService.NotifyEventCreated(eventAggregate);
                _logger.LogInformation("Event creation notification sent successfully for Id {EventId}", eventAggregate.Id);
            }
            catch (Exception emailEx)
            {
                _logger.LogWarning(emailEx, "Event Id {EventId} was created successfully, but the notification email failed to send.", eventAggregate.Id);
            }

            return eventAggregate.Id;
        }
        catch (Exception ex)
        {
            await _unitOfWork.Rollback();
            _logger.LogError(ex, "Transaction rolled back during event creation for Title = {Title}", command.Title ?? "NULL");
            throw;
        }
    }
}