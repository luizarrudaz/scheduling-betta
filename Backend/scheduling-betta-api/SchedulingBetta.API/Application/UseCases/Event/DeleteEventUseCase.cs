using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IEventUseCases;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;

namespace SchedulingBetta.API.Application.UseCases.Event;

public class DeleteEventUseCase : IDeleteEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventNotificationService _eventNotificationService;
    private readonly ILogger<DeleteEventUseCase> _logger;

    public DeleteEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IEventNotificationService eventNotificationService,
        ILogger<DeleteEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _eventNotificationService = eventNotificationService;
        _logger = logger;
    }

    public async Task<bool> Execute(int id)
    {
        _logger.LogInformation("DeleteEventUseCase|Execute :: Iniciando exclusão do evento ID {EventId}", id);
        var eventToDelete = await _eventRepository.GetEventById(id);
        if (eventToDelete == null)
        {
            _logger.LogWarning("DeleteEventUseCase|Execute :: Evento ID {EventId} não encontrado.", id);
            return false;
        }

        var existingSchedules = await _eventRepository.GetSchedulesByEventId(id);

        if (existingSchedules.Any())
        {
            _logger.LogInformation("DeleteEventUseCase|Execute :: Removendo {Count} agendamentos associados ao evento ID {EventId}", existingSchedules.Count, id);
            _eventRepository.RemoveScheduleRange(existingSchedules);
        }

        await _eventRepository.DeleteEvent(eventToDelete);
        await _unitOfWork.Commit();
        _logger.LogInformation("DeleteEventUseCase|Execute :: Evento ID {EventId} e agendamentos associados removidos com sucesso.", id);

        await _eventNotificationService.NotifyEventCancelled(eventToDelete);
        _logger.LogInformation("DeleteEventUseCase|Execute :: Notificação de cancelamento de evento enviada para o evento ID {EventId}", id);

        return true;
    }
}