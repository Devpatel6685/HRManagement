using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.EmployeeCode).IsRequired().HasMaxLength(20);
        builder.HasIndex(e => e.EmployeeCode).IsUnique();
        builder.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.LastName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Phone).HasMaxLength(20);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Gender).HasConversion<string>().HasMaxLength(10);

        builder.HasOne(e => e.User)
               .WithOne(u => u.Employee)
               .HasForeignKey<Employee>(e => e.UserId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);

        builder.HasOne(e => e.Department)
               .WithMany(d => d.Employees)
               .HasForeignKey(e => e.DepartmentId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);

        builder.HasOne(e => e.Designation)
               .WithMany(d => d.Employees)
               .HasForeignKey(e => e.DesignationId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);

        builder.HasOne(e => e.Manager)
               .WithMany(e => e.Subordinates)
               .HasForeignKey(e => e.ManagerId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);
    }
}
