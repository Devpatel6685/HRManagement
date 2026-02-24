using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class LeaveTypeConfiguration : IEntityTypeConfiguration<LeaveType>
{
    public void Configure(EntityTypeBuilder<LeaveType> builder)
    {
        builder.ToTable("LeaveTypes");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(e => e.Name).IsUnique();
    }
}
