namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases
{
    public interface IGetDistinctScheduleYearsUseCase
    {
        Task<List<int>> Execute();
    }
}