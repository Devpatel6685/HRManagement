using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class DesignationConfiguration : IEntityTypeConfiguration<Designation>
{
    public void Configure(EntityTypeBuilder<Designation> builder)
    {
        builder.ToTable("Designations");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(100);

        builder.HasOne(e => e.Department)
               .WithMany(d => d.Designations)
               .HasForeignKey(e => e.DepartmentId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
