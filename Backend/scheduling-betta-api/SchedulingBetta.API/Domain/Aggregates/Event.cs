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
    public Guid PublicId { get; private set; } = Guid.NewGuid();
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
        CreatedAt = DateTime.UtcNow;

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

    public void AddBreakWindow(DateTime start, DateTime end)
    {
        if (HasBreak)
            throw new DomainException("Break window already exists.");
        BreakWindow = BreakWindow.Create(start, end);
    }

    public void SetId(int id)
    {
        Id = id;
    }

    internal void SetPublicId(Guid publicId)
    {
        PublicId = publicId;
    }

    internal void SetCreatedAt(DateTime createdAt)
    {
        CreatedAt = createdAt;
    }

    public void SetBreakWindow(BreakWindow breakWindow)
    {
        if (HasBreak)
            throw new DomainException("Break window already exists.");
        BreakWindow = breakWindow;
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