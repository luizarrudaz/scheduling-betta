using Microsoft.EntityFrameworkCore;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Infrastructure.Mapper;
using System.Linq.Expressions;

namespace SchedulingBetta.API.Infraestructure.Repositories;

public class EventRepository(SchedulingDbContext dbContext) : IEventRepository
{
    private readonly SchedulingDbContext _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));

    public async Task<List<EventEntity>> GetAllEvents(GetAllEventsRequestDto request)
    {
        var query = _dbContext.Events.AsQueryable();

        if (request.Filter?.ToLower() == "upcoming")
        {
            query = query.Where(e => e.EndTime > DateTime.UtcNow);
        }

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(e => e.Title.ToLower().Contains(term) || e.Location.ToLower().Contains(term));
        }

        if (!string.IsNullOrEmpty(request.SortKey))
        {
            var isDescending = request.SortDirection?.ToLower() == "descending";

            Expression<Func<EventEntity, object>> keySelector = request.SortKey.ToLower() switch
            {
                "title" => e => e.Title,
                "location" => e => e.Location,
                "starttime" => e => e.StartTime,
                "sessionduration" => e => e.SessionDuration,
                _ => e => e.Id
            };

            query = isDescending ? query.OrderByDescending(keySelector) : query.OrderBy(keySelector);
        }
        else
        {
            query = query.OrderByDescending(e => e.StartTime);
        }

        return await query.ToListAsync();
    }

    public async Task<Event?> GetEventById(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (entity == null)
            return null;

        return EventMapper.ToDomain(entity);
    }

    public async Task<EventSchedule?> GetScheduleById(int scheduleId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EventSchedules
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);
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

    public async Task<bool> IsSlotInUse(int eventId, DateTime slot, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EventSchedules
            .AnyAsync(s => s.EventId == eventId && s.ScheduleTime == slot, cancellationToken);
    }

    public async Task<bool> HasUserScheduledEvent(int eventId, string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EventSchedules
            .AnyAsync(es => es.EventId == eventId && es.UserId == userId, cancellationToken);
    }

    public async Task<bool> HasUserScheduledAnyEventOnDay(string userId, DateTime day, CancellationToken cancellationToken = default)
    {
        var startOfDay = day.Date;
        var endOfDay = startOfDay.AddDays(1);

        return await _dbContext.EventSchedules
            .Where(es => es.UserId == userId && es.ScheduleTime >= startOfDay && es.ScheduleTime < endOfDay)
            .AnyAsync(cancellationToken);
    }

    public async Task<bool> HasUserScheduledAtTime(string userId, DateTime slot, CancellationToken cancellationToken = default)
    {
        return await _dbContext.EventSchedules
            .AnyAsync(s => s.UserId == userId && s.ScheduleTime == slot, cancellationToken);
    }

    public async Task<EventEntity> AddEvent(Event eventAggregate, CancellationToken cancellationToken = default)
    {
        var eventEntity = EventMapper.ToEntity(eventAggregate);

        await _dbContext.Events.AddAsync(eventEntity, cancellationToken);

        return eventEntity;
    }

    public async Task AddEventRange(IEnumerable<EventEntity> events, CancellationToken cancellationToken = default)
    {
        await _dbContext.Events.AddRangeAsync(events, cancellationToken);
    }

    public Task UpdateEvent(Event eventToUpdate, CancellationToken cancellationToken = default)
    {
        var eventEntity = EventMapper.ToEntity(eventToUpdate);

        _dbContext.Events.Update(eventEntity);
        return Task.CompletedTask;
    }

    public Task DeleteEvent(Event eventToDelete, CancellationToken cancellationToken = default)
    {
        var eventEntity = EventMapper.ToEntity(eventToDelete);

        _dbContext.Events.Remove(eventEntity);
        return Task.CompletedTask;
    }

    public async Task AddSchedule(EventSchedule schedule, CancellationToken cancellationToken = default)
    {
        await _dbContext.EventSchedules.AddAsync(schedule, cancellationToken);
    }

    public async Task<EventSchedule?> GetUserSchedule(int eventId, string userId)
    {
        return await _dbContext.EventSchedules
            .FirstOrDefaultAsync(i => i.EventId == eventId && i.UserId == userId);
    }

    public async Task<List<EventSchedule>> GetSchedulesByEventId(int eventId)
    {
        return await _dbContext.EventSchedules
            .Where(s => s.EventId == eventId)
            .ToListAsync();
    }

    public async Task<List<EventSchedule>> GetAllSchedules(GetAllSchedulesEventRequestDto request)
    {
        var query = _dbContext.EventSchedules.Include(e => e.Event).AsQueryable();
        var now = DateTime.UtcNow;

        if (request.TimeFilter?.ToLower() == "future")
        {
            query = query.Where(s => s.ScheduleTime > now);
        }
        else if (request.TimeFilter?.ToLower() == "past")
        {
            query = query.Where(s => s.ScheduleTime <= now);
        }

        if (!string.IsNullOrEmpty(request.DateRangeFilter) && request.TimeFilter?.ToLower() == "past")
        {
            switch (request.DateRangeFilter.ToLower())
            {
                case "last3months":
                    query = query.Where(s => s.ScheduleTime >= now.AddMonths(-3));
                    break;
                case "last6months":
                    query = query.Where(s => s.ScheduleTime >= now.AddMonths(-6));
                    break;
                case "thisyear":
                    query = query.Where(s => s.ScheduleTime.Year == now.Year);
                    break;
                default:
                    if (int.TryParse(request.DateRangeFilter, out int year))
                    {
                        query = query.Where(s => s.ScheduleTime.Year == year);
                    }
                    break;
            }
        }

        if (!string.IsNullOrEmpty(request.SortKey))
        {
            var isDescending = request.SortDirection?.ToLower() == "descending";
            Expression<Func<EventSchedule, object>> keySelector = request.SortKey.ToLower() switch
            {
                "event.title" => s => s.Event.Title,
                "event.sessionduration" => s => s.Event.SessionDuration,
                "selectedslot" => s => s.ScheduleTime,
                "displayname" => s => s.UserId,
                "email" => s => s.UserId,
                "createdat" => s => s.CreatedAt,
                _ => s => s.Id
            };

            query = isDescending ? query.OrderByDescending(keySelector) : query.OrderBy(keySelector);
        }
        else
        {
            query = query.OrderByDescending(s => s.ScheduleTime);
        }

        return await query.ToListAsync();
    }

    public async Task<List<EventSchedule>> GetAllSchedulesByUser(string userId)
    {
        return await _dbContext.EventSchedules
            .Where(es => es.UserId == userId)
            .Include(e => e.Event)
            .ToListAsync();
    }

    public async Task RemoveUserSchedule(EventSchedule schedule)
    {
        _dbContext.EventSchedules.Remove(schedule);
        await Task.CompletedTask;
    }


    public void RemoveScheduleRange(IEnumerable<EventSchedule> schedules)
    {
        _dbContext.EventSchedules.RemoveRange(schedules);
    }

    public async Task<List<int>> GetDistinctScheduleYears()
    {
        return await _dbContext.EventSchedules
            .Select(s => s.ScheduleTime.Year)
            .Distinct()
            .OrderByDescending(year => year)
            .ToListAsync();
    }
}