using SchedulingBetta.API.Domain.Exceptions;
using SchedulingBetta.API.Domain.Services;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Domain.Aggregates;

public class Event
{
    private readonly List<InterestedUser> _interestedUsers = [];
    public IReadOnlyCollection<InterestedUser> InterestedUsers => _interestedUsers.AsReadOnly();
    public static int MaxWaitlistCapacity =>
        int.TryParse(Environment.GetEnvironmentVariable("MAX_WAITLIST_CAPACITY"), out var val) ? val : 4;

    public int Id { get; private set; } = 0;
    public string? Title { get; private set; }
    public int SessionDuration { get; private set; }
    public BreakWindow? BreakWindow { get; private set; }
    public bool HasBreak => BreakWindow != null;
    public string? Location { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public int AvailableSlots { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Event(
        string title,
        TimeSpan sessionDuration,
        string location,
        DateTime startTime,
        DateTime endTime,
        int availableSlots)
    {
        Title = title;
        SessionDuration = (int)sessionDuration.TotalMinutes;
        Location = location;
        StartTime = startTime;
        EndTime = endTime;
        AvailableSlots = availableSlots;
        CreatedAt = DateTimeHelper.ConvertToUtc(DateTime.UtcNow);

        ValidateEventAggregate.Validate(
            title,
            SessionDuration,
            location,
            startTime,
            endTime,
            availableSlots);
    }

    public static Event Create(
        string title,
        TimeSpan sessionDuration,
        string location,
        DateTime startTime,
        DateTime endTime,
        int availableSlots)
    {
        return new Event(title, sessionDuration, location, startTime, endTime, availableSlots);
    }

    public void Update(string title, TimeSpan sessionDuration, string location, DateTime startTime, DateTime endTime, int availableSlots)
    {
        Title = title;
        SessionDuration = (int)sessionDuration.TotalMinutes;
        Location = location;
        StartTime = startTime;
        EndTime = endTime;
        AvailableSlots = availableSlots;
    }

    public void AddBreakWindow(DateTime start, DateTime end)
    {
        if (HasBreak)
            throw new DomainException("Break window already exists.");
        BreakWindow = BreakWindow.Create(start, end);
    }

    public void RemoveBreakWindow()
    {
        if (!HasBreak)
            throw new DomainException("No break window to remove.");
        BreakWindow = null;
    }

    public List<DateTime> GetValidSlots()
    {
        var slots = new List<DateTime>();
        for (int i = 0; i < AvailableSlots; i++)
        {
            slots.Add(StartTime.AddMinutes(i * SessionDuration));
        }
        return slots;
    }

    public void SetId(int id)
    {
        Id = id;
    }

    internal void SetCreatedAt(DateTime createdAt)
    {
        CreatedAt = createdAt;
    }

    public void AddInterestedUser(InterestedUser user)
    {
        if (_interestedUsers.Count >= MaxWaitlistCapacity)
            throw new DomainException("Waitlist capacity reached.");

        if (_interestedUsers.Any(u => u.UserId == user.UserId))
            throw new DomainException("User already interested in this event.");

        _interestedUsers.Add(user);
    }
}
