using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Entities;

namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

public interface IGetAllSchedulesByUserUseCase
{
    Task<List<GetScheduledEventDto>> Execute(string userId);
}
