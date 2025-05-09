namespace SchedulingBetta.API.Domain.Interfaces.IEventUseCases
{
    public interface IDeleteEventUseCase
    {
        Task<bool> Execute(int id);
    }
}
