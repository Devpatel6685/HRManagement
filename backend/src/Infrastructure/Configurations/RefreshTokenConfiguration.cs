using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Token).IsRequired().HasMaxLength(256);
        builder.HasIndex(e => e.Token).IsUnique();
        builder.HasIndex(e => new { e.UserId, e.IsRevoked });

        builder.HasOne(e => e.User)
               .WithMany(u => u.RefreshTokens)
               .HasForeignKey(e => e.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
