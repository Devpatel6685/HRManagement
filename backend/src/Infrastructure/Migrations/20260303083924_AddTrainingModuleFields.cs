using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingModuleFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxParticipants",
                table: "Trainings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Score",
                table: "EmployeeTrainings",
                type: "numeric(5,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxParticipants",
                table: "Trainings");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "EmployeeTrainings");
        }
    }
}
