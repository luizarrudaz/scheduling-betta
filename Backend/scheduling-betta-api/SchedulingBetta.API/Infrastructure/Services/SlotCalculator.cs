using SchedulingBetta.API.Domain.Interfaces;

public class SlotCalculator : ISlotCalculator
{
    public int CalculateSlots(DateTime startTime, DateTime endTime, TimeSpan sessionDuration)
    {
        if (startTime >= endTime)
            throw new Exception("Start time must be before end time.");

        if (sessionDuration <= TimeSpan.Zero)
            throw new Exception("Session duration must be positive.");

        var totalEventDuration = endTime - startTime;
        return (int)(totalEventDuration.TotalMinutes / sessionDuration.TotalMinutes);
    }
}