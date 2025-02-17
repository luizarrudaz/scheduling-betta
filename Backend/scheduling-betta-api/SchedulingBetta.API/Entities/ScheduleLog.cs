namespace SchedulingBetta.API.Entitites;

public class ScheduleLog
{
    public int Id { get; set; }
    public int ScheduleId { get; set; }
    public string Action { get; set; } 
    public DateTime Timestamp { get; set; }
}
