namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent
{
    public class UnscheduleEventDtoWithUserIdDto
    {
        public int ScheduleId { get; set; }
        public string? UserId { get; set; }
    }
}
