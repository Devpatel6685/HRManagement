using HRManagement.Application.DTOs.Departments;

namespace HRManagement.Application.Interfaces;

public interface IDesignationService
{
    Task<IReadOnlyList<DesignationListDto>> GetAllAsync(Guid? departmentId, CancellationToken cancellationToken = default);

    Task<DesignationListDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<DesignationListDto> CreateAsync(CreateDesignationDto dto, CancellationToken cancellationToken = default);

    Task<DesignationListDto> UpdateAsync(Guid id, UpdateDesignationDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
