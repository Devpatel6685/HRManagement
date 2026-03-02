using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class AttendanceBreakConfiguration : IEntityTypeConfiguration<AttendanceBreak>
{
    public void Configure(EntityTypeBuilder<AttendanceBreak> builder)
    {
        builder.ToTable("AttendanceBreaks");
        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Attendance)
               .WithMany(a => a.Breaks)
               .HasForeignKey(e => e.AttendanceId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
