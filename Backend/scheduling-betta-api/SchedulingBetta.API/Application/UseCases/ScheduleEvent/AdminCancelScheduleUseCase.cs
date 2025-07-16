using SchedulingBetta.API.Domain.Enum;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
{
    public class AdminCancelScheduleUseCase : IAdminCancelScheduleUseCase
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILdapAuthService _ldapAuthService;
        private readonly IEventNotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AdminCancelScheduleUseCase> _logger;

        public AdminCancelScheduleUseCase(
            IEventRepository eventRepository,
            ILdapAuthService ldapAuthService,
            IEventNotificationService notificationService,
            IUnitOfWork unitOfWork,
            ILogger<AdminCancelScheduleUseCase> logger)
        {
            _eventRepository = eventRepository;
            _ldapAuthService = ldapAuthService;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<bool> Execute(int scheduleId)
        {
            var schedule = await _eventRepository.GetScheduleById(scheduleId);
            if (schedule == null)
            {
                _logger.LogWarning("Admin cancellation failed: Schedule with ID {ScheduleId} not found.", scheduleId);
                throw new KeyNotFoundException("Agendamento não encontrado.");
            }

            if (schedule.Status == ScheduleStatus.Cancelled)
            {
                _logger.LogInformation("Admin cancellation skipped: Schedule {ScheduleId} is already cancelled.", scheduleId);
                return true;
            }

            _eventRepository.RemoveUserSchedule(schedule);
            await _unitOfWork.Commit();

            try
            {
                var userInfo = _ldapAuthService.GetUserInfoBySid(schedule.UserId);
                var eventDetails = await _eventRepository.GetEventById(schedule.EventId);
                if (userInfo != null && eventDetails != null)
                {
                    await _notificationService.NotifyAdminCancelled(userInfo, eventDetails, schedule.ScheduleTime);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cancellation for schedule {ScheduleId} succeeded, but notification email failed for user SID {UserSID}.", scheduleId, schedule.UserId);
            }

            return true;
        }
    }
}