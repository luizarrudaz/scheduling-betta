using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Application.DTOs.ScheduleEvent;

namespace SchedulingBetta.API.Domain.Interfaces;

public interface IEventRepository
{
    Task<List<EventEntity>> GetAllEvents(GetAllEventsRequestDto request);
    Task<Event?> GetEventById(int id, CancellationToken cancellationToken = default);
    Task<EventSchedule?> GetScheduleById(int scheduleId, CancellationToken cancellationToken = default);
    Task<EventEntity?> GetEventByName(string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventEntity>> GetEventByDateRange(DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<int> GetAvailableSlots(int eventId, CancellationToken cancellationToken = default);
    Task<bool> IsSlotInUse(int eventId, DateTime slot, CancellationToken cancellationToken = default);
    Task<bool> HasUserScheduledAnyEventOnDay(string userId, DateTime day, CancellationToken cancellationToken = default);
    Task<bool> HasUserScheduledAtTime(string userId, DateTime slot, CancellationToken cancellationToken = default);
    Task<EventEntity> AddEvent(Event @event, CancellationToken cancellationToken = default);
    Task AddEventRange(IEnumerable<EventEntity> events, CancellationToken cancellationToken = default);
    Task UpdateEvent(Event @event, CancellationToken cancellationToken = default);
    Task DeleteEvent(Event @event, CancellationToken cancellationToken = default);
    Task AddSchedule(EventSchedule schedule, CancellationToken cancellationToken = default);
    Task<EventSchedule?> GetUserSchedule(int eventId, string userId);
    Task<List<EventSchedule>> GetSchedulesByEventId(int eventId);
    Task<List<EventSchedule>> GetAllSchedules(GetAllSchedulesEventRequestDto request);
    Task<List<EventSchedule>> GetAllSchedulesByUser(string userId);
    Task RemoveUserSchedule(EventSchedule schedule);
    void RemoveScheduleRange(IEnumerable<EventSchedule> schedules);
    Task<List<int>> GetDistinctScheduleYears();
}