namespace SchedulingBetta.API.Application.DTOs.ScheduleEvent
{
    public class UnscheduleEventDtoWithUserIdDto : UnscheduleEventDto
    {
        public new string? UserId { get; set; }
    }
}
