using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Employee> Employees { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
