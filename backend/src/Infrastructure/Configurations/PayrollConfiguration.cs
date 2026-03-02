using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class PayrollConfiguration : IEntityTypeConfiguration<Payroll>
{
    public void Configure(EntityTypeBuilder<Payroll> builder)
    {
        builder.ToTable("Payrolls");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => new { e.EmployeeId, e.Month, e.Year }).IsUnique();
        builder.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)");
        builder.Property(e => e.HRA).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Allowances).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Deductions).HasColumnType("decimal(18,2)");
        builder.Property(e => e.NetSalary).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(e => e.Employee)
               .WithMany(emp => emp.Payrolls)
               .HasForeignKey(e => e.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
