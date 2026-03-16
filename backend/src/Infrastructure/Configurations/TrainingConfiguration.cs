using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class TrainingConfiguration : IEntityTypeConfiguration<Training>
{
    public void Configure(EntityTypeBuilder<Training> builder)
    {
        builder.ToTable("Trainings");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Trainer).HasMaxLength(200);
        builder.Property(e => e.MaxParticipants).IsRequired();
    }
}
