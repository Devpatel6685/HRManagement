using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.ToTable("LeaveRequests");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Reason).HasMaxLength(500);
        builder.Property(e => e.RejectionReason).HasMaxLength(500).IsRequired(false);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(e => e.Employee)
               .WithMany(emp => emp.LeaveRequests)
               .HasForeignKey(e => e.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.LeaveType)
               .WithMany(lt => lt.LeaveRequests)
               .HasForeignKey(e => e.LeaveTypeId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ApprovedBy)
               .WithMany(emp => emp.ApprovedLeaveRequests)
               .HasForeignKey(e => e.ApprovedById)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);
    }
}
