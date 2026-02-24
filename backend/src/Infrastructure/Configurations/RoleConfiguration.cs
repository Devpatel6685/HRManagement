using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRManagement.Infrastructure.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public static readonly Guid AdminRoleId    = new("00000000-0000-0000-0000-000000000001");
    public static readonly Guid HrRoleId       = new("00000000-0000-0000-0000-000000000002");
    public static readonly Guid ManagerRoleId  = new("00000000-0000-0000-0000-000000000003");
    public static readonly Guid EmployeeRoleId = new("00000000-0000-0000-0000-000000000004");

    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(e => e.Name).IsRequired().HasMaxLength(50);
        builder.HasIndex(e => e.Name).IsUnique();

        builder.HasData(
            new Role { Id = AdminRoleId,    Name = "Admin",    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Role { Id = HrRoleId,       Name = "HR",       CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Role { Id = ManagerRoleId,  Name = "Manager",  CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Role { Id = EmployeeRoleId, Name = "Employee", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
