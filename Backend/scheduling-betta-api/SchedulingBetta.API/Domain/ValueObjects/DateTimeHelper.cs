namespace SchedulingBetta.API.Domain.ValueObjects
{
    public static class DateTimeHelper
    {
        private static readonly TimeZoneInfo BrazilTimeZone = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");

        public static DateTime ConvertFromUtc(DateTime dateTime)
        {
            if (dateTime.Kind == DateTimeKind.Local && BrazilTimeZone.IsInvalidTime(dateTime))
                return dateTime;

            if (dateTime.Kind != DateTimeKind.Utc)
                dateTime = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);

            return TimeZoneInfo.ConvertTimeFromUtc(dateTime, BrazilTimeZone);
        }

        public static DateTime ConvertToUtc(DateTime inputDateTime)
        {
            if (inputDateTime.Kind == DateTimeKind.Utc)
                return inputDateTime;

            if (inputDateTime.Kind == DateTimeKind.Unspecified)
                return TimeZoneInfo.ConvertTimeToUtc(inputDateTime, BrazilTimeZone);

            var localOffset = TimeZoneInfo.Local.GetUtcOffset(inputDateTime);
            var brazilOffset = BrazilTimeZone.GetUtcOffset(inputDateTime);

            return localOffset == brazilOffset
                ? inputDateTime.ToUniversalTime() 
                : TimeZoneInfo.ConvertTimeToUtc(inputDateTime, BrazilTimeZone);
        }
    }
}
