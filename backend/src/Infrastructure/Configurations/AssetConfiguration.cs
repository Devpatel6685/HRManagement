using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("Assets");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.AssetName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.AssetCode).IsRequired().HasMaxLength(50);
        builder.HasIndex(e => e.AssetCode).IsUnique();
        builder.Property(e => e.Category).HasMaxLength(100);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);

        builder.HasOne(e => e.AssignedToEmployee)
               .WithMany(emp => emp.Assets)
               .HasForeignKey(e => e.AssignedToEmployeeId)
               .OnDelete(DeleteBehavior.SetNull)
               .IsRequired(false);
    }
}
