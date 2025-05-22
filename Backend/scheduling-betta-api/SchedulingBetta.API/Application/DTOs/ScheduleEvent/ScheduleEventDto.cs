using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Enum;

namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent;

public class ScheduleEventDto
{
    public int Id { get; set; }
    public int EventId { get; init; }
    public string UserId { get; init; } = null!;
    public DateTime SelectedSlot { get; init; }
    public EventDto? Event { get; init; }
    public ScheduleStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
}
