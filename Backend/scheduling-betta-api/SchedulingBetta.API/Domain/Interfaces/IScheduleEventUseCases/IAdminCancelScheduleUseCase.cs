namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases
{
    public interface IAdminCancelScheduleUseCase
    {
        Task<bool> Execute(int scheduleId);
    }
}
