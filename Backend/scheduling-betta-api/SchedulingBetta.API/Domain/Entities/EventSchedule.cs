using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using SchedulingBetta.API.Domain.Enum;

namespace SchedulingBetta.API.Domain.Entities;

public class EventSchedule
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [ForeignKey("Event")]
    public int EventId { get; set; }
    public EventEntity? Event { get; set; }

    [Required]
    public string? UserId { get; set; } // AD user identifier

    [Required]
    [Column(TypeName = "timestamp")]
    public DateTime ScheduleTime { get; set; }

    [Required]
    [StringLength(20)]
    public ScheduleStatus Status { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
