namespace SchedulingBetta.API.Application.DTOs.Event;

public class GetEventDto
{
    public int Id { get; set; }
    public string? Title { get; init; } = null!;
    public int SessionDuration { get; init; }
    public string? Location { get; init; } = null!;
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public BreakWindowDto? BreakWindow { get; init; }
    public int AvailableSlots { get; init; }
}
