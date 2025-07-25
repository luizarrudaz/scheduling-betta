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
            _logger.LogInformation("AdminCancelScheduleUseCase|Execute :: Iniciando cancelamento administrativo para o agendamento ID {ScheduleId}", scheduleId);
            var schedule = await _eventRepository.GetScheduleById(scheduleId);
            if (schedule == null)
            {
                _logger.LogWarning("AdminCancelScheduleUseCase|Execute :: Agendamento com ID {ScheduleId} não encontrado.", scheduleId);
                throw new KeyNotFoundException("Agendamento não encontrado.");
            }

            if (schedule.Status == ScheduleStatus.Cancelled)
            {
                _logger.LogInformation("AdminCancelScheduleUseCase|Execute :: Agendamento {ScheduleId} já está cancelado.", scheduleId);
                return true;
            }

            _eventRepository.RemoveUserSchedule(schedule);
            await _unitOfWork.Commit();
            _logger.LogInformation("AdminCancelScheduleUseCase|Execute :: Agendamento {ScheduleId} removido do banco de dados com sucesso.", scheduleId);

            try
            {
                var userInfo = _ldapAuthService.GetUserInfoBySid(schedule.UserId);
                var eventDetails = await _eventRepository.GetEventById(schedule.EventId);
                if (userInfo != null && eventDetails != null)
                {
                    await _notificationService.NotifyAdminCancelled(userInfo, eventDetails, schedule.ScheduleTime);
                    _logger.LogInformation("AdminCancelScheduleUseCase|Execute :: Notificação de cancelamento enviada para o usuário {UserSID}.", schedule.UserId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AdminCancelScheduleUseCase|Execute :: Cancelamento do agendamento {ScheduleId} bem-sucedido, mas o e-mail de notificação falhou para o usuário SID {UserSID}.", scheduleId, schedule.UserId);
            }

            return true;
        }
    }
}