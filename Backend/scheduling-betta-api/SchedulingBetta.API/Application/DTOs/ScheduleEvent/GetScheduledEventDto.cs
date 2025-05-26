using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Enum;

namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent;

public class GetScheduledEventDto
{
    public int Id { get; set; }
    public string UserId { get; init; } = null!;
    public DateTime SelectedSlot { get; init; }
    public GetEventDto? Event { get; init; }
    public ScheduleStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
}