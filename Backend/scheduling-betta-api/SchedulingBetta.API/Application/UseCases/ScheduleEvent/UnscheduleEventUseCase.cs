using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent;

public class UnscheduleEventUseCase : IUnscheduleEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventNotificationService _eventNotificationService;
    private readonly ILdapAuthService _ldapAuthService;
    private readonly ILogger<UnscheduleEventUseCase> _logger;

    public UnscheduleEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IEventNotificationService eventNotificationService,
        ILdapAuthService ldapAuthService,
        ILogger<UnscheduleEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _eventNotificationService = eventNotificationService;
        _ldapAuthService = ldapAuthService;
        _logger = logger;
    }

    public async Task<UnscheduleResponseDto> Execute(UnscheduleEventDtoWithUserIdDto unscheduleEventDto)
    {
        await _unitOfWork.BeginTransaction();

        try
        {
            var userInfo = _ldapAuthService.GetUserInfo(unscheduleEventDto.UserId ?? string.Empty);
            var userId = userInfo.Sid;

            var schedule = await _eventRepository.GetInterestedUser(
                unscheduleEventDto.EventId,
                userId
            );

            if (schedule is null)
            {
                _logger.LogWarning("No active schedule found for user {UserId} in event {EventId}", unscheduleEventDto.UserId, unscheduleEventDto.EventId);
                throw new InvalidOperationException("Schedule not found.");
            }

            await _eventRepository.RemoveUserSchedule(schedule);

            await _unitOfWork.Commit();

            _logger.LogInformation("User {UserId} successfully unscheduled from event {EventId}", unscheduleEventDto.UserId, unscheduleEventDto.EventId);

            var eventDetails = await _eventRepository.GetEventById(unscheduleEventDto.EventId);
            if (eventDetails != null)
            {
                await _eventNotificationService.NotifyUserCancelled(
                    eventDetails,
                    userInfo.Email
                );
            }

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
