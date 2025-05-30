using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Entities;

namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

public interface IGetAllSchedulesEventUseCase 
{
    Task<List<GetScheduledEventDto>> Execute();
}
