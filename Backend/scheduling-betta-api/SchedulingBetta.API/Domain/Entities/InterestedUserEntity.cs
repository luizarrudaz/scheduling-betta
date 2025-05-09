using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SchedulingBetta.API.Domain.Entities;

public class InterestedUserEntity
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

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
