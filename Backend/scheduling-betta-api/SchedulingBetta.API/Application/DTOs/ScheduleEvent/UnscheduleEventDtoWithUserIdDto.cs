namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent
{
    public class UnscheduleEventDtoWithUserIdDto
    {
        public int EventId { get; set; }
        public new string? UserId { get; set; }
    }
}
