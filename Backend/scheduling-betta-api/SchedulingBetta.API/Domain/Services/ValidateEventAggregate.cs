using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Exceptions;

namespace SchedulingBetta.API.Domain.Services;

public static class ValidateEventAggregate
{
    public static void Validate(
        string title,
        int sessionDuration,
        string location,
        DateTime startTime,
        DateTime endTime,
        int availableSlots)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Title cannot be null or empty.");

        if (sessionDuration <= 0)
            throw new DomainException("Session duration must be greater than zero.");

        if (string.IsNullOrWhiteSpace(location))
            throw new DomainException("Location cannot be null or empty.");

        if (startTime >= endTime)
            throw new DomainException("Start time must be before end time.");

        if (availableSlots < 0)
            throw new DomainException("Available slots cannot be negative.");
    }
}
