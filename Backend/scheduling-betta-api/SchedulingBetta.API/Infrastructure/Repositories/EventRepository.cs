using Microsoft.EntityFrameworkCore;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Infraestructure.Mapper;

namespace SchedulingBetta.API.Infraestructure.Repositories;

public class EventRepository(SchedulingDbContext dbContext) : IEventRepository
{
    private readonly SchedulingDbContext _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));

    // Query methods
    public async Task<List<GetEventDto>> GetAllEvents()
    {
        return await _dbContext.Set<EventEntity>()
            .Select(events => new GetEventDto
            {
                Id = events.Id,
                Title = events.Title,
                SessionDuration = events.SessionDuration,
                Location = events.Location,
                StartTime = events.StartTime,
                EndTime = events.EndTime,
                BreakWindow = events.BreakStart.HasValue && events.BreakEnd.HasValue
                ? new BreakWindowDto
                {
                    BreakStart = events.BreakStart.Value,
                    BreakEnd = events.BreakEnd.Value
                }
                : null,
                AvailableSlots = events.AvailableSlots
            })
            .ToListAsync();
    }

    public async Task<EventEntity?> GetEventById(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<EventEntity?> GetEventByName(string name, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Title == name, cancellationToken);
    }

    public async Task<IEnumerable<EventEntity>> GetEventByDateRange(DateTime start, DateTime end, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Events
            .AsNoTracking()
            .Where(e => e.StartTime >= start && e.EndTime <= end)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetAvailableSlots(int eventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Events
            .Where(e => e.Id == eventId)
            .Select(e => e.AvailableSlots)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> HasUserScheduledEvent(int eventId, string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EventSchedules
            .AnyAsync(es => es.EventId == eventId && es.UserId == userId, cancellationToken);
    }

    public async Task<InterestedUserEntity?> GetNextInterestedUser(int eventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.InterestedUsers
            .Where(i => i.EventId == eventId)
            .OrderBy(i => i.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetWaitlistCount(int eventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.InterestedUsers
            .CountAsync(i => i.EventId == eventId, cancellationToken);
    }

    public async Task<bool> IsUserInWaitlist(int eventId, string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.InterestedUsers
            .AnyAsync(i => i.EventId == eventId && i.UserId == userId, cancellationToken);
    }

    public async Task<bool> EventExists(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Events.AnyAsync(e => e.Id == id, cancellationToken);
    }

    // Command methods
    public async Task AddEvent(Event eventAggregate, CancellationToken cancellationToken = default)
    {
        var eventEntity = EventMapper.ToEntity(eventAggregate);

        await _dbContext.Events.AddAsync(eventEntity, cancellationToken);

        eventAggregate.SetId(eventEntity.Id);
        eventAggregate.SetPublicId(eventEntity.PublicId);
    }

    public async Task AddEventRange(IEnumerable<EventEntity> events, CancellationToken cancellationToken = default)
    {
        await _dbContext.Events.AddRangeAsync(events, cancellationToken);
    }

    public Task UpdateEvent(EventEntity eventToUpdate, CancellationToken cancellationToken = default)
    {
        _dbContext.Events.Update(eventToUpdate);
        return Task.CompletedTask;
    }

    public Task DeleteEvent(EventEntity eventToDelete, CancellationToken cancellationToken = default)
    {
        _dbContext.Events.Remove(eventToDelete);
        return Task.CompletedTask;
    }

    public async Task AddInterestedUser(InterestedUserEntity user, CancellationToken cancellationToken = default)
    {
        await _dbContext.InterestedUsers.AddAsync(user, cancellationToken);
    }

    public Task RemoveInterestedUser(InterestedUserEntity user, CancellationToken cancellationToken = default)
    {
        _dbContext.InterestedUsers.Remove(user);
        return Task.CompletedTask;
    }
}