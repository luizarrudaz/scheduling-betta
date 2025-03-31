using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SchedulingBetta.API.Entities;

public class EventSchedule
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [ForeignKey("Event")]
    public int EventId { get; set; }
    public Event Event { get; set; }

    [Required]
    public string UserId { get; set; } // AD user identifier

    [Required]
    [Column(TypeName = "timestamp")]
    public DateTime ScheduleTime { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "active"; // active, canceled

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
