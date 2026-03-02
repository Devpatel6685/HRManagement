using HRManagement.Application.DTOs.Recruitment;

namespace HRManagement.Application.Interfaces;

public interface IApplicantService
{
    Task<ApplicantDto> AddApplicantAsync(Guid jobId, AddApplicantDto dto, Stream? resumeStream, string? resumeFileName, CancellationToken ct = default);
    Task<KanbanBoardDto> GetKanbanAsync(Guid jobId, CancellationToken ct = default);
    Task<IReadOnlyList<ApplicantDto>> GetByJobAsync(Guid jobId, CancellationToken ct = default);
    Task<ApplicantDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ApplicantDto> UpdateStatusAsync(Guid id, UpdateApplicantStatusDto dto, CancellationToken ct = default);
    Task<(byte[] FileBytes, string FileName, string ContentType)> GetResumeAsync(Guid id, CancellationToken ct = default);
}
