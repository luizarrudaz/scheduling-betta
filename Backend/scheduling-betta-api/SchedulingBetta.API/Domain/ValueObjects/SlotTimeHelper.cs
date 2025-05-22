namespace SchedulingBetta.API.Domain.ValueObjects;

public record SlotTimeHelper
{
    public static DateTime Normalize(DateTime inputTime, int slotSizeInMinutes)
    {
        var totalMinutes = inputTime.Hour * 60 + inputTime.Minute;
        var roundedMinutes = (int)Math.Round(totalMinutes / (double)slotSizeInMinutes) * slotSizeInMinutes;

        var normalized = new DateTime(inputTime.Year, inputTime.Month, inputTime.Day,
                                      roundedMinutes / 60, roundedMinutes % 60, 0);

        return DateTime.SpecifyKind(normalized, inputTime.Kind);
    }
}
