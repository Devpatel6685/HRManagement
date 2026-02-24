using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Email).IsRequired().HasMaxLength(200);
        builder.HasIndex(e => e.Email).IsUnique();
        builder.Property(e => e.PasswordHash).IsRequired();
        builder.Property(e => e.PasswordResetToken).HasMaxLength(256);

        builder.HasOne(e => e.Role)
               .WithMany(r => r.Users)
               .HasForeignKey(e => e.RoleId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
