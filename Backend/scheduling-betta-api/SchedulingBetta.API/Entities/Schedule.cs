namespace SchedulingBetta.API.Entitites;

public class Schedule
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime? DateTime { get; set; }
    public string Service { get; set; }
    public bool Canceled { get; set; }
}
