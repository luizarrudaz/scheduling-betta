using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IEventUseCases;

namespace SchedulingBetta.API.Application.UseCases.Event;

public class DeleteEventUseCase : IDeleteEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteEventUseCase> _logger;

    public DeleteEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<bool> Execute(int id)
    {
        _logger.LogInformation("Deleting event with ID {EventId}", id);
        var eventToDelete = await _eventRepository.GetEventById(id);
        if (eventToDelete == null)
        {
            _logger.LogWarning("Event with ID {EventId} not found", id);
            return false;
        }

        await _eventRepository.DeleteEvent(eventToDelete);
        await _unitOfWork.Commit();

        _logger.LogInformation("Event with ID {EventId} deleted successfully", id);
        return true;
    }
}
