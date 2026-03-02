using HRManagement.Application.DTOs.Recruitment;

namespace HRManagement.Application.Interfaces;

public interface IJobPostingService
{
    Task<IReadOnlyList<JobPostingDto>> GetAllAsync(string? status, Guid? departmentId, CancellationToken ct = default);
    Task<JobPostingDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<JobPostingDto> CreateAsync(CreateJobPostingDto dto, CancellationToken ct = default);
    Task<JobPostingDto> UpdateAsync(Guid id, UpdateJobPostingDto dto, CancellationToken ct = default);
    Task CloseAsync(Guid id, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
