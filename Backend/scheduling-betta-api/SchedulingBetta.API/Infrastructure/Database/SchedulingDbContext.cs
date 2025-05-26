using Microsoft.EntityFrameworkCore;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Enum;

public class SchedulingDbContext : DbContext
{
    public SchedulingDbContext(DbContextOptions<SchedulingDbContext> options)
        : base(options) { }

    public DbSet<EventEntity> Events { get; set; }
    public DbSet<EventSchedule> EventSchedules { get; set; }
    public DbSet<InterestedUserEntity> InterestedUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EventEntity>(entity =>
        {
            entity.ToTable("events", t =>
            {
                t.HasCheckConstraint("CK_Event_Period", "\"end_time\" > \"start_time\"");
                t.HasCheckConstraint("CK_Event_BreakTimes",
                    "(has_break = false) OR " +
                    "(has_break = true AND break_start IS NOT NULL AND " +
                    "break_end IS NOT NULL AND break_end > break_start)");
            });

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Title)
                .HasColumnName("title")
                .HasMaxLength(100);
            entity.Property(e => e.SessionDuration)
                .HasColumnName("session_duration");
            entity.Property(e => e.HasBreak)
                .HasColumnName("has_break");
            entity.Property(e => e.BreakStart)
                .HasColumnName("break_start");
            entity.Property(e => e.BreakEnd)
                .HasColumnName("break_end");
            entity.Property(e => e.Location)
                .HasColumnName("location")
                .HasMaxLength(100);
            entity.Property(e => e.StartTime)
                .HasColumnName("start_time");
            entity.Property(e => e.EndTime)
                .HasColumnName("end_time");
            entity.Property(e => e.AvailableSlots)
                .HasColumnName("available_slots");
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<EventSchedule>(entity =>
        {
            entity.ToTable("event_schedules");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.ScheduleTime).HasColumnName("schedule_time");
            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasDefaultValue(ScheduleStatus.Active);
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()");

            entity.HasIndex(e => new { e.UserId, e.ScheduleTime })
                .IsUnique()
                .HasDatabaseName("IX_User_ScheduleTime");
        });

        modelBuilder.Entity<InterestedUserEntity>(entity =>
        {
            entity.ToTable("event_interested_users");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()");

            entity.HasIndex(e => new { e.EventId, e.UserId })
                .IsUnique()
                .HasDatabaseName("IX_Event_User");
        });
    }
}