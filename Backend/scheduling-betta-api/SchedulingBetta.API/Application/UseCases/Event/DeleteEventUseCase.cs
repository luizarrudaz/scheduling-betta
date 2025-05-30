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
        _logger.LogInformation("Starting deletion of event with ID {EventId}", id);

        var eventToDelete = await _eventRepository.GetEventById(id);
        if (eventToDelete == null)
        {
            _logger.LogWarning("Event with ID {EventId} not found for deletion", id);
            return false;
        }

        try
        {
            await _eventRepository.DeleteEvent(eventToDelete);
            _logger.LogInformation("Event with ID {EventId} marked for deletion in repository", id);

            await _unitOfWork.Commit();
            _logger.LogInformation("UnitOfWork committed successfully for event deletion with ID {EventId}", id);

            await _eventNotificationService.NotifyEventCancelled(eventToDelete);
            _logger.LogInformation("Notification sent for event cancellation with ID {EventId}", id);

            _logger.LogInformation("Event with ID {EventId} deleted successfully", id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting event with ID {EventId}", id);
            throw;
        }
    }
}