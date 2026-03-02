using HRManagement.Application.DTOs.Performance;

namespace HRManagement.Application.Interfaces;

public interface IPerformanceReviewService
{
    Task<PerformanceReviewDto> AddReviewAsync(AddReviewDto dto, string reviewerRole, CancellationToken ct = default);
    Task<IReadOnlyList<PerformanceReviewDto>> GetEmployeeReviewsAsync(Guid employeeId, CancellationToken ct = default);
    Task<IReadOnlyList<PerformanceReviewDto>> GetAllReviewsAsync(CancellationToken ct = default);
    Task<AverageRatingDto> GetAverageRatingAsync(Guid employeeId, CancellationToken ct = default);
    Task DeleteReviewAsync(Guid id, CancellationToken ct = default);
}
