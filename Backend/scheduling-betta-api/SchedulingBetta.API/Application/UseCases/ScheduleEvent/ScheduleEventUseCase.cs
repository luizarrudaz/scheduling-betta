using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Enum;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent;

public class ScheduleEventUseCase : IScheduleEventUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventNotificationService _eventNotificationService;
    private readonly ILdapAuthService _ldapAuthService;
    private readonly ILogger<ScheduleEventUseCase> _logger;

    public ScheduleEventUseCase(
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IEventNotificationService eventNotificationService,
        ILdapAuthService ldapAuthService,
        ILogger<ScheduleEventUseCase> logger)
    {
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _eventNotificationService = eventNotificationService;
        _ldapAuthService = ldapAuthService;
        _logger = logger;
    }

    public async Task<ScheduleResponseDto> Execute(ScheduleEventDtoWithUserIdDto scheduleEventDto)
    {
        _logger.LogInformation("Starting scheduling process for User {UserId} on Event {EventId}", scheduleEventDto.UserId, scheduleEventDto.EventId);

        await _unitOfWork.BeginTransaction();
        bool transactionCommitted = false;

        try
        {
            var userInfo = _ldapAuthService.GetUserInfo(scheduleEventDto.UserId ?? string.Empty);
            var userId = userInfo.Sid;

            var eventDetails = await _eventRepository.GetEventById(scheduleEventDto.EventId);

            if (eventDetails is null)
            {
                throw new InvalidOperationException("O evento selecionado não existe.");
            }

            var validSlots = eventDetails.GetValidSlots();
            if (!validSlots.Any())
            {
                throw new InvalidOperationException("Este evento não possui horários disponíveis.");
            }

            var selectedSlotUtc = DateTime.SpecifyKind(scheduleEventDto.SelectedSlot, DateTimeKind.Utc);

            if (selectedSlotUtc < eventDetails.StartTime || selectedSlotUtc >= eventDetails.EndTime)
            {
                throw new InvalidOperationException("O horário selecionado está fora do período do evento.");
            }

            var userHasBookingOnDay = await _eventRepository.HasUserScheduledAnyEventOnDay(userId, selectedSlotUtc);
            if (userHasBookingOnDay)
            {
                _logger.LogWarning("User {UserId} already has an appointment on {Day}", userId, selectedSlotUtc.ToShortDateString());
                throw new InvalidOperationException("Você já possui um agendamento para este dia. Só é permitido um por dia.");
            }

            var slotInUse = await _eventRepository.IsSlotInUse(scheduleEventDto.EventId, selectedSlotUtc);
            if (slotInUse)
            {
                throw new InvalidOperationException("Este horário não está mais disponível.");
            }

            var schedule = new EventSchedule
            {
                EventId = scheduleEventDto.EventId,
                UserId = userId,
                ScheduleTime = selectedSlotUtc,
                Status = ScheduleStatus.Active,
            };

            await _eventRepository.AddSchedule(schedule);

            await _unitOfWork.Commit();
            transactionCommitted = true;
            _logger.LogInformation("Transaction committed successfully for scheduling User {UserId}", schedule.UserId);

            await _eventNotificationService.NotifyUserScheduled(
                 eventDetails,
                 userInfo.Email,
                 schedule.ScheduleTime);

            return new ScheduleResponseDto
            {
                ScheduleId = schedule.Id,
                Message = $"User {scheduleEventDto.UserId} successfully scheduled for event {scheduleEventDto.EventId} at {scheduleEventDto.SelectedSlot:dd/MM/yyyy HH:mm}."
            };
        }
        catch (Exception ex)
        {
            if (!transactionCommitted)
            {
                await _unitOfWork.Rollback();
                _logger.LogWarning("Transaction rolled back due to error for User {UserId} on Event {EventId}", scheduleEventDto.UserId, scheduleEventDto.EventId);
            }

            _logger.LogError(ex,
                "Error scheduling event. EventId: {EventId}, UserId: {UserId}, SelectedSlot: {SelectedSlot:O}, ErrorMessage: {ErrorMessage}",
                scheduleEventDto.EventId,
                scheduleEventDto.UserId ?? "NULL",
                scheduleEventDto.SelectedSlot,
                ex.Message);

            throw;
        }
    }
}