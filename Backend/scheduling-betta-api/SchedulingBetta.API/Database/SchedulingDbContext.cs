using Microsoft.EntityFrameworkCore;
using SchedulingBetta.API.Entities;

public class SchedulingDbContext : DbContext
{
    public SchedulingDbContext(DbContextOptions<SchedulingDbContext> options)
        : base(options) { }

    public DbSet<Event> Events { get; set; }
    public DbSet<EventSchedule> EventSchedules { get; set; }
    public DbSet<InterestedUser> InterestedUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Event>(entity =>
        {
            entity.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Event_Period", "\"EndTime\" > \"StartTime\"");
                t.HasCheckConstraint("CK_Event_BreakTimes",
                    "(\"HasBreak\" = false) OR " +
                    "(\"HasBreak\" = true AND \"BreakStart\" IS NOT NULL AND " +
                    "\"BreakEnd\" IS NOT NULL AND \"BreakEnd\" > \"BreakStart\")");
            });

            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<EventSchedule>(entity =>
        {
            entity.HasIndex(es => new { es.UserId, es.ScheduleTime }).IsUnique();
            entity.Property(es => es.Status).HasDefaultValue("active");
            entity.Property(es => es.CreatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<InterestedUser>(entity =>
        {
            entity.HasIndex(iu => new { iu.EventId, iu.UserId }).IsUnique();
            entity.Property(iu => iu.CreatedAt).HasDefaultValueSql("NOW()");
        });
    }
}