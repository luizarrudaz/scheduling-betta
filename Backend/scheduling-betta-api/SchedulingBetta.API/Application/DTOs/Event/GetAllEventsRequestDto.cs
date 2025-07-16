namespace SchedulingBetta.API.Application.DTOs.Event
{
    public class GetAllEventsRequestDto
    {
        public string? SearchTerm { get; set; }
        public string? SortKey { get; set; }
        public string? SortDirection { get; set; }
        public string? Filter { get; set; } // "upcoming"
    }
}