using SchedulingBetta.API.Application.DTOs.ScheduleEvent;

namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

public interface IScheduleEventUseCase
{
    Task<ScheduleResponseDto> Execute(ScheduleEventDtoWithUserIdDto scheduleEventDto);
}
