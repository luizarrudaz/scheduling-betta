namespace SchedulingBetta.API.Domain.ValueObjects;

public record SlotTimeHelper
{
    public static DateTime Normalize(DateTime inputTime, int slotSizeInMinutes, TimeSpan referenceStart)
    {
        var reference = new DateTime(inputTime.Year, inputTime.Month, inputTime.Day,
                                     referenceStart.Hours, referenceStart.Minutes, 0, DateTimeKind.Unspecified);

        var diff = inputTime - reference;
        var diffMinutes = diff.TotalMinutes;

        var roundedSlots = (int)Math.Round(diffMinutes / slotSizeInMinutes);
        var normalizedLocal = reference.AddMinutes(roundedSlots * slotSizeInMinutes);

        var normalizedUtc = DateTimeHelper.ConvertToUtc(normalizedLocal);

        return normalizedUtc;
    }
}
