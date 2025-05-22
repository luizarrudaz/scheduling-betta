namespace SchedulingBetta.API.Domain.ValueObjects;

public record SlotTimeHelper
{
    public static DateTime Normalize(DateTime inputTime, int AvailableSlots)
    {
        var totalMinutes = inputTime.Hour * 60 + inputTime.Minute;
        var roundedMinutes = (totalMinutes / AvailableSlots) * AvailableSlots;
        return new DateTime(inputTime.Year, inputTime.Month, inputTime.Day, roundedMinutes / 60, roundedMinutes % 60, 0);
    }
}
