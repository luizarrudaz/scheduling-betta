namespace SchedulingBetta.API.Domain.Interfaces;

public interface ISlotCalculator
{
    int CalculateSlots(DateTime startTime, DateTime endTime, TimeSpan sessionDuration);
}
