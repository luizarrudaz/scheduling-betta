namespace SchedulingBetta.API.Domain.Interfaces;

public interface IUnitOfWork
{
    Task BeginTransaction();
    Task Commit();
    Task Rollback();
}
