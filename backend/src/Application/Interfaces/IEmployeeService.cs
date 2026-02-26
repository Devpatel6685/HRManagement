using HRManagement.Application.Common;
using HRManagement.Application.DTOs.Employees;

namespace HRManagement.Application.Interfaces;

public interface IEmployeeService
{
    Task<PagedResult<EmployeeListDto>> GetEmployeesAsync(
        EmployeeFilterParams filter,
        CancellationToken cancellationToken = default);

    Task<EmployeeDetailDto> GetEmployeeByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>Returns the profile of the currently-authenticated employee (by User ID from JWT).</summary>
    Task<EmployeeDetailDto> GetMyProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<EmployeeDetailDto> CreateEmployeeAsync(
        CreateEmployeeDto dto,
        CancellationToken cancellationToken = default);

    Task<EmployeeDetailDto> UpdateEmployeeAsync(
        Guid id,
        UpdateEmployeeDto dto,
        CancellationToken cancellationToken = default);

    /// <summary>Soft delete — delegates to IEmployeeRepository.SoftDeleteAsync.</summary>
    Task DeleteEmployeeAsync(Guid id, CancellationToken cancellationToken = default);
}
