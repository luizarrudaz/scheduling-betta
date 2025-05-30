using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Domain.Interfaces;

public interface IEventRepository
{
    Task<List<GetEventDto>> GetAllEvents();
    Task<Event?> GetEventById(int id, CancellationToken cancellationToken = default);
    Task<EventEntity?> GetEventByName(string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventEntity>> GetEventByDateRange(DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<int> GetAvailableSlots(int eventId, CancellationToken cancellationToken = default);
    Task<bool> IsSlotInUse(int eventId, DateTime slot, CancellationToken cancellationToken = default);
    Task<bool> HasUserScheduledEvent(int eventId, string userId, CancellationToken cancellationToken = default);
    Task<bool> HasUserScheduledAnyEventOnSameDay(int eventId, string userId, CancellationToken cancellationToken = default);
    //Task<InterestedUserEntity?> GetNextInterestedUser(int eventId, CancellationToken cancellationToken = default);
    //Task<int> GetWaitlistCount(int eventId, CancellationToken cancellationToken = default);
    //Task<bool> IsUserInWaitlist(int eventId, string userId, CancellationToken cancellationToken = default);
    Task<EventEntity> AddEvent(Event @event, CancellationToken cancellationToken = default);
    Task AddEventRange(IEnumerable<EventEntity> events, CancellationToken cancellationToken = default);
    Task UpdateEvent(Event @event, CancellationToken cancellationToken = default);
    Task DeleteEvent(Event @event, CancellationToken cancellationToken = default);
    Task AddInterestedUser(EventSchedule schedule, CancellationToken cancellationToken = default);
    Task<EventSchedule?> GetInterestedUser(int eventId, string userId);
    Task<List<EventSchedule>> GetAllSchedules();
    Task<List<EventSchedule>> GetAllSchedulesByUser(string userId);
    Task RemoveUserSchedule(EventSchedule schedule);
}