using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SchedulingBetta.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "events",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    session_duration = table.Column<int>(type: "integer", nullable: false),
                    has_break = table.Column<bool>(type: "boolean", nullable: false),
                    break_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    break_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    available_slots = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events", x => x.id);
                    table.CheckConstraint("CK_Event_BreakTimes", "(has_break = false) OR (has_break = true AND break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start)");
                    table.CheckConstraint("CK_Event_Period", "\"end_time\" > \"start_time\"");
                });

            migrationBuilder.CreateTable(
                name: "event_interested_users",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    event_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_interested_users", x => x.id);
                    table.ForeignKey(
                        name: "FK_event_interested_users_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "event_schedules",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    event_id = table.Column<int>(type: "integer", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    schedule_time = table.Column<DateTime>(type: "timestamp", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_schedules", x => x.id);
                    table.ForeignKey(
                        name: "FK_event_schedules_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Event_User",
                table: "event_interested_users",
                columns: new[] { "event_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_event_schedules_event_id",
                table: "event_schedules",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_User_ScheduleTime",
                table: "event_schedules",
                columns: new[] { "user_id", "schedule_time" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "event_interested_users");

            migrationBuilder.DropTable(
                name: "event_schedules");

            migrationBuilder.DropTable(
                name: "events");
        }
    }
}
