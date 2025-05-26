namespace SchedulingBetta.API.Domain.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class EventEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string? Title { get; set; }

    [Required]
    [Range(1, 1440)]
    [Column(TypeName = "integer")]
    public int SessionDuration { get; set; } // In minutes

    [Required]
    public bool HasBreak { get; set; } = false;

    [Column(TypeName = "timestamp with time zone")]
    public DateTime? BreakStart { get; set; }

    [Column(TypeName = "timestamp with time zone")]
    public DateTime? BreakEnd { get; set; }

    [Required]
    [StringLength(100)]
    public string? Location { get; set; }

    [Required]
    [Column(TypeName = "timestamp with time zone")]
    public DateTime StartTime { get; set; }

    [Required]
    [Column(TypeName = "timestamp with time zone")]
    public DateTime EndTime { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int AvailableSlots { get; set; }

    public List<DateTime> GetValidSlots()
    {
        var slots = new List<DateTime>();
        for (int i = 0; i < AvailableSlots; i++)
        {
            slots.Add(StartTime.AddMinutes(i * SessionDuration));
        }
        return slots;
    }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<EventSchedule>? Schedules { get; set; }
    public ICollection<InterestedUserEntity>? InterestedUsers { get; set; }
}