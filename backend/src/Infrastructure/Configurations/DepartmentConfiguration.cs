using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(e => e.Name).IsUnique();

        builder.HasOne(e => e.HeadEmployee)
               .WithMany()
               .HasForeignKey(e => e.HeadEmployeeId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);
    }
}
