using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "Documents",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedById",
                table: "Documents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UploadedById",
                table: "Documents",
                column: "UploadedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Users_UploadedById",
                table: "Documents",
                column: "UploadedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Users_UploadedById",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_UploadedById",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "UploadedById",
                table: "Documents");
        }
    }
}
