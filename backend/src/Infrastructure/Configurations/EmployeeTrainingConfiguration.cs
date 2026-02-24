using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class EmployeeTrainingConfiguration : IEntityTypeConfiguration<EmployeeTraining>
{
    public void Configure(EntityTypeBuilder<EmployeeTraining> builder)
    {
        builder.ToTable("EmployeeTrainings");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => new { e.EmployeeId, e.TrainingId }).IsUnique();
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(e => e.Employee)
               .WithMany(emp => emp.EmployeeTrainings)
               .HasForeignKey(e => e.EmployeeId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Training)
               .WithMany(t => t.EmployeeTrainings)
               .HasForeignKey(e => e.TrainingId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
