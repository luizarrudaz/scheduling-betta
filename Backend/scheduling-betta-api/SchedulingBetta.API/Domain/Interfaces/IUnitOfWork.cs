namespace SchedulingBetta.API.Domain.Interfaces;

public interface IUnitOfWork
{
    Task Commit();
}
