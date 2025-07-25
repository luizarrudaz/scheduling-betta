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
        _logger.LogInformation("UpdateEventUseCase|Execute :: Iniciando atualização para o evento ID {EventId}", id);
        var eventToUpdate = await _eventRepository.GetEventById(id);
        if (eventToUpdate == null)
        {
            _logger.LogWarning("UpdateEventUseCase|Execute :: Evento ID {EventId} não encontrado para atualização.", id);
            return null;
        }

        var existingSchedules = await _eventRepository.GetSchedulesByEventId(id);

        await _eventValidator.ValidateAndThrowAsync(command);
        var sessionDuration = TimeSpan.FromMinutes(command.SessionDuration);
        var availableSlots = _slotCalculator.CalculateSlots(command.StartTime, command.EndTime, sessionDuration);

        eventToUpdate.Update(
            command.Title, sessionDuration, command.Location,
            DateTimeHelper.ConvertToUtc(command.StartTime), DateTimeHelper.ConvertToUtc(command.EndTime), availableSlots
        );

        if (command.BreakWindow is not null)
        {
            await _breakWindowValidator.ValidateAndThrowAsync(command.BreakWindow);
            if (eventToUpdate.HasBreak) eventToUpdate.RemoveBreakWindow();
            eventToUpdate.AddBreakWindow(
                DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakStart),
                DateTimeHelper.ConvertToUtc(command.BreakWindow.BreakEnd)
            );
        }
        else if (eventToUpdate.HasBreak)
        {
            eventToUpdate.RemoveBreakWindow();
        }

        if (existingSchedules.Any())
        {
            _logger.LogInformation("UpdateEventUseCase|Execute :: Removendo {Count} agendamentos existentes para o evento ID {EventId} devido à atualização.", existingSchedules.Count, id);
            _eventRepository.RemoveScheduleRange(existingSchedules);
        }

        await _eventRepository.UpdateEvent(eventToUpdate);
        await _unitOfWork.Commit();
        _logger.LogInformation("UpdateEventUseCase|Execute :: Evento ID {EventId} atualizado com sucesso no banco de dados.", id);

        await _eventNotificationService.NotifyEventUpdated(eventToUpdate);
        _logger.LogInformation("UpdateEventUseCase|Execute :: Notificação de atualização enviada para o evento ID {EventId}", id);

        return new UpdateEventDto
        {
            Title = eventToUpdate.Title,
            SessionDuration = (int)sessionDuration.TotalMinutes,
            Location = eventToUpdate.Location,
            StartTime = DateTimeHelper.ConvertFromUtc(eventToUpdate.StartTime),
            EndTime = DateTimeHelper.ConvertFromUtc(eventToUpdate.EndTime),
            BreakWindow = eventToUpdate.HasBreak && eventToUpdate.BreakWindow != null
                ? new BreakWindowDto
                {
                    BreakStart = DateTimeHelper.ConvertFromUtc(eventToUpdate.BreakWindow.Start),
                    BreakEnd = DateTimeHelper.ConvertFromUtc(eventToUpdate.BreakWindow.End)
                }
                : null
        };
    }
}