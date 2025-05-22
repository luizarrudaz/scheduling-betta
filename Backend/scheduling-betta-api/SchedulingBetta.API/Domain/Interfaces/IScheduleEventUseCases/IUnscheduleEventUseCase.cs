using SchedulingBetta.API.Application.DTOs.ScheduleEvent;

namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

public interface IUnscheduleEventUseCase
{
    Task<UnscheduleResponseDto> Execute(UnscheduleEventDto unscheduleEventDto);
}
