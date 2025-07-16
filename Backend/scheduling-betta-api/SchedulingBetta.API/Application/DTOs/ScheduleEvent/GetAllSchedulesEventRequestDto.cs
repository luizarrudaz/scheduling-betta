namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent
{
    public class GetAllSchedulesEventRequestDto
    {
        public string? SearchTerm { get; set; }
        public string? SortKey { get; set; }
        public string? SortDirection { get; set; }
        public string? TimeFilter { get; set; } // "past", "future"
        public string? DateRangeFilter { get; set; } // "last3months", "last6months", "thisyear", "2024", etc.
    }
}