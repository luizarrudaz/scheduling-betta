namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent;

public class GetOccupiedSlotDto
{
    public int ScheduleId { get; set; }
    public int EventId { get; set; }
    public DateTime ScheduleTime { get; set; }
    public string UserId { get; set; } = string.Empty;
}