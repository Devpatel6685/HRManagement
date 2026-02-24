using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class LeaveBalanceConfiguration : IEntityTypeConfiguration<LeaveBalance>
{
    public void Configure(EntityTypeBuilder<LeaveBalance> builder)
    {
        builder.ToTable("LeaveBalances");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => new { e.EmployeeId, e.LeaveTypeId, e.Year }).IsUnique();

        builder.HasOne(e => e.Employee)
               .WithMany(emp => emp.LeaveBalances)
               .HasForeignKey(e => e.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.LeaveType)
               .WithMany(lt => lt.LeaveBalances)
               .HasForeignKey(e => e.LeaveTypeId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
