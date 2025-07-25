using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;

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
        _logger.LogInformation("UnscheduleEventUseCase|Execute :: Usuário {Username} está tentando cancelar o agendamento {ScheduleId}", unscheduleEventDto.UserId, unscheduleEventDto.ScheduleId);
        var loggedInUser = _ldapAuthService.GetUserInfo(unscheduleEventDto.UserId ?? string.Empty);
        Event? eventDetailsForEmail = null;

        await _unitOfWork.BeginTransaction();
        try
        {
            var schedule = await _eventRepository.GetScheduleById(unscheduleEventDto.ScheduleId);
            if (schedule is null)
            {
                _logger.LogWarning("UnscheduleEventUseCase|Execute :: Agendamento {ScheduleId} não encontrado.", unscheduleEventDto.ScheduleId);
                throw new InvalidOperationException("Agendamento não encontrado.");
            }

            if (schedule.UserId != loggedInUser.Sid)
            {
                _logger.LogWarning("UnscheduleEventUseCase|Execute :: Tentativa não autorizada do usuário {Username} de cancelar o agendamento {ScheduleId} pertencente a {OwnerSid}.", unscheduleEventDto.UserId, unscheduleEventDto.ScheduleId, schedule.UserId);
                throw new UnauthorizedAccessException("Você não tem permissão para cancelar este agendamento.");
            }

            eventDetailsForEmail = await _eventRepository.GetEventById(schedule.EventId);

            await _eventRepository.RemoveUserSchedule(schedule);
            await _unitOfWork.Commit();
            _logger.LogInformation("UnscheduleEventUseCase|Execute :: Agendamento {ScheduleId} cancelado com sucesso pelo usuário {Username}.", unscheduleEventDto.ScheduleId, unscheduleEventDto.UserId);
        }
        catch (Exception)
        {
            await _unitOfWork.Rollback();
            _logger.LogError("UnscheduleEventUseCase|Execute :: Falha ao cancelar o agendamento {ScheduleId} para o usuário {UserId}.", unscheduleEventDto.ScheduleId, loggedInUser.Sid);
            throw;
        }

        try
        {
            if (eventDetailsForEmail != null && !string.IsNullOrEmpty(loggedInUser.Email))
            {
                await _eventNotificationService.NotifyUserCancelled(
                    eventDetailsForEmail,
                    loggedInUser.Email
                );
                _logger.LogInformation("UnscheduleEventUseCase|Execute :: E-mail de notificação de cancelamento enviado com sucesso para o usuário {Username}.", unscheduleEventDto.UserId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "UnscheduleEventUseCase|Execute :: Cancelamento do agendamento {ScheduleId} BEM-SUCEDIDO, mas o e-mail de notificação FALHOU.", unscheduleEventDto.ScheduleId);
        }

        return new UnscheduleResponseDto
        {
            Success = true,
            Message = $"Agendamento cancelado com sucesso."
        };
    }
}