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
        var eventToDelete = await _eventRepository.GetEventById(id);
        if (eventToDelete == null) return false;

        var existingSchedules = await _eventRepository.GetSchedulesByEventId(id);

        if (existingSchedules.Any())
        {
            _eventRepository.RemoveScheduleRange(existingSchedules);
        }

        await _eventRepository.DeleteEvent(eventToDelete);
        await _unitOfWork.Commit();

        await _eventNotificationService.NotifyEventCancelled(eventToDelete);

        return true;
    }
}