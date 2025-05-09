using SchedulingBetta.API.Domain.Interfaces;

namespace SchedulingBetta.API.Infraestructure.UnitOfWork;

public class UnitOfWork(SchedulingDbContext dbContext) : IUnitOfWork
{
    private readonly SchedulingDbContext _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));

    public async Task Commit()
    {
        await _dbContext.SaveChangesAsync();
    }
}
