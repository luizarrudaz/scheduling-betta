using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent;

public class UnscheduleEventUseCase : IUnscheduleEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UnscheduleEventUseCase> _logger;

    public UnscheduleEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        ILogger<UnscheduleEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UnscheduleResponseDto> Execute(UnscheduleEventDto unscheduleEventDto)
    {
        await _unitOfWork.BeginTransaction();

        try
        {
            var schedule = await _eventRepository.GetInterestedUser(
            unscheduleEventDto.EventId,
            unscheduleEventDto.UserId
        );

            if (schedule is null)
            {
                _logger.LogWarning("No active schedule found for user {UserId} in event {EventId}", unscheduleEventDto.UserId, unscheduleEventDto.EventId);
                throw new InvalidOperationException("Schedule not found.");
            }

            await _eventRepository.RemoveUserSchedule(schedule);

            // Comment for future implementation:
            // If you want to allow the cancellation of users who are only interested (in the queue),
            // you will need to find the InterestedUserEntity and call the RemoveInterestedUser method.
            // This is not yet implemented because currently the flow only considers scheduled users.

            await _unitOfWork.Commit();

            return new UnscheduleResponseDto
            {
                Success = true,
                Message = $"User {unscheduleEventDto.UserId} unscheduled from event {unscheduleEventDto.EventId}."
            };
        }
        catch (Exception ex)
        {
            await _unitOfWork.Rollback();
            _logger.LogError(ex, "Error unscheduling user {UserId} from event {EventId}", unscheduleEventDto.UserId, unscheduleEventDto.EventId);
            throw;
        }
    }
}
