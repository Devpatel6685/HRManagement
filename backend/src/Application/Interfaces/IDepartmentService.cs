using HRManagement.Application.DTOs.Departments;

namespace HRManagement.Application.Interfaces;

public interface IDepartmentService
{
    Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DesignationDto>> GetDesignationsAsync(
        Guid departmentId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DepartmentListDto>> GetAllWithCountAsync(CancellationToken cancellationToken = default);

    Task<DepartmentDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<DepartmentDetailDto> CreateAsync(CreateDepartmentDto dto, CancellationToken cancellationToken = default);

    Task<DepartmentDetailDto> UpdateAsync(Guid id, UpdateDepartmentDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
