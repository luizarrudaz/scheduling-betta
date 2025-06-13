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
        var loggedInUser = _ldapAuthService.GetUserInfo(unscheduleEventDto.UserId ?? string.Empty);
        Event? eventDetailsForEmail;

        await _unitOfWork.BeginTransaction();
        try
        {
            var schedule = await _eventRepository.GetScheduleById(unscheduleEventDto.ScheduleId);
            if (schedule is null)
            {
                throw new InvalidOperationException("Agendamento não encontrado.");
            }

            if (schedule.UserId != loggedInUser.Sid)
            {
                throw new UnauthorizedAccessException("Você não tem permissão para cancelar este agendamento.");
            }

            eventDetailsForEmail = await _eventRepository.GetEventById(schedule.EventId);

            await _eventRepository.RemoveUserSchedule(schedule);
            await _unitOfWork.Commit();
        }
        catch (Exception)
        {
            await _unitOfWork.Rollback();
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
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cancellation for schedule {ScheduleId} SUCCEEDED, but notification email FAILED.", unscheduleEventDto.ScheduleId);
        }

        return new UnscheduleResponseDto
        {
            Success = true,
            Message = $"Agendamento cancelado com sucesso."
        };
    }
}