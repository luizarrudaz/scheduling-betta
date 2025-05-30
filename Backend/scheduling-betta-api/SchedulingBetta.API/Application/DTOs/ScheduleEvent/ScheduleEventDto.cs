using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Enum;

namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent;

public class ScheduleEventDto
{
    public int EventId { get; init; }
    public DateTime SelectedSlot { get; init; }
}
