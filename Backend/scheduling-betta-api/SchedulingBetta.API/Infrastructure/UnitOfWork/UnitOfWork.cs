using Microsoft.EntityFrameworkCore.Storage;
using SchedulingBetta.API.Domain.Interfaces;

namespace SchedulingBetta.API.Infraestructure.UnitOfWork;

public class UnitOfWork(SchedulingDbContext dbContext) : IUnitOfWork
{
    private readonly SchedulingDbContext _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    private IDbContextTransaction? _transaction;

    public async Task BeginTransaction()
    {
        _transaction = await _dbContext.Database.BeginTransactionAsync();
    }

    public async Task Commit()
    {
        await _dbContext.SaveChangesAsync();
        if (_transaction is not null)
        {
            await _transaction.CommitAsync();
        }
    }

    public async Task Rollback()
    {
        if (_transaction is not null)
        {
            await _transaction.RollbackAsync();
        }
    }
}