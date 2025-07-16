using SchedulingBetta.API.Application.DTOs.ScheduleEvent;

namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

public interface IGetAllSchedulesEventUseCase
{
    Task<List<GetScheduledEventDto>> Execute(GetAllSchedulesEventRequestDto request);
}