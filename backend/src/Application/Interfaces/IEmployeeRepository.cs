using HRManagement.Application.Common;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;

namespace HRManagement.Application.Interfaces;

public interface IEmployeeRepository
{
    Task<PagedResult<Employee>> GetAllAsync(
        string? search,
        Guid? departmentId,
        EmployeeStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Includes Department, Designation, Manager, User.</summary>
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Lookup by linked User account — used for the /me endpoint.</summary>
    Task<Employee?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>Generates the next sequential code in EMP-XXXX format.</summary>
    Task<string> GenerateEmployeeCodeAsync(CancellationToken cancellationToken = default);

    Task CreateAsync(Employee employee, CancellationToken cancellationToken = default);
    Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default);

    /// <summary>Soft delete — sets Status=Inactive and User.IsActive=false. Never hard deletes.</summary>
    Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
