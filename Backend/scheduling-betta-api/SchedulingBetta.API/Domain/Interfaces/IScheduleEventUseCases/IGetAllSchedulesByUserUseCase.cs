using SchedulingBetta.API.Domain.Entities;

namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

public interface IGetAllSchedulesByUserUseCase
{
    Task<List<EventSchedule>> Execute(string userId);
}
