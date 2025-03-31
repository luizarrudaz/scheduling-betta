namespace SchedulingBetta.API.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Event
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    [Required]
    [Column(TypeName = "integer")]
    public int SessionDuration { get; set; } // In minutes

    [Required]
    public bool HasBreak { get; set; } = false;

    [Column(TypeName = "time without time zone")]
    public TimeSpan? BreakStart { get; set; }

    [Column(TypeName = "time without time zone")]
    public TimeSpan? BreakEnd { get; set; }

    [Required]
    [StringLength(100)]
    public string Location { get; set; }

    [Required]
    [Column(TypeName = "timestamp")]
    public DateTime StartTime { get; set; }

    [Required]
    [Column(TypeName = "timestamp")]
    public DateTime EndTime { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int AvailableSlots { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<EventSchedule> Schedules { get; set; }
    public ICollection<InterestedUser> InterestedUsers { get; set; }
}
