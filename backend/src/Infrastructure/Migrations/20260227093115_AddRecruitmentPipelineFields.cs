using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecruitmentPipelineFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedOn",
                table: "JobPostings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Requirements",
                table: "JobPostings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AppliedOn",
                table: "Applicants",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Applicants",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Applicants",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResumeFileName",
                table: "Applicants",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClosedOn",
                table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "Requirements",
                table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "AppliedOn",
                table: "Applicants");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Applicants");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Applicants");

            migrationBuilder.DropColumn(
                name: "ResumeFileName",
                table: "Applicants");
        }
    }
}
