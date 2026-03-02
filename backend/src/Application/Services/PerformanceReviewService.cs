using HRManagement.Application.DTOs.Performance;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class PerformanceReviewService : IPerformanceReviewService
{
    private readonly IApplicationDbContext _context;

    public PerformanceReviewService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PerformanceReviewDto> AddReviewAsync(
        AddReviewDto dto, string reviewerRole, CancellationToken ct = default)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == dto.EmployeeId, ct)
            ?? throw new KeyNotFoundException("Employee not found.");

        var reviewer = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == dto.ReviewerId, ct)
            ?? throw new KeyNotFoundException("Reviewer not found.");

        // Managers can only review their direct reports
        if (reviewerRole == "Manager")
        {
            var isDirect = employee.ManagerId == dto.ReviewerId;
            if (!isDirect)
                throw new UnauthorizedAccessException(
                    "Managers can only review their direct reports.");
        }

        var review = new PerformanceReview
        {
            EmployeeId   = dto.EmployeeId,
            ReviewerId   = dto.ReviewerId,
            Period       = dto.Period,
            Rating       = dto.Rating,
            Comments     = dto.Comments,
            Strengths    = dto.Strengths,
            Improvements = dto.Improvements,
            ReviewDate   = DateTime.UtcNow,
        };

        _context.PerformanceReviews.Add(review);
        await _context.SaveChangesAsync(ct);

        review.Employee = employee;
        review.Reviewer = reviewer;
        return MapToDto(review);
    }

    public async Task<IReadOnlyList<PerformanceReviewDto>> GetEmployeeReviewsAsync(
        Guid employeeId, CancellationToken ct = default)
    {
        var list = await _context.PerformanceReviews
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.ReviewDate)
            .ToListAsync(ct);

        return list.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<PerformanceReviewDto>> GetAllReviewsAsync(
        CancellationToken ct = default)
    {
        var list = await _context.PerformanceReviews
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .OrderByDescending(r => r.ReviewDate)
            .ToListAsync(ct);

        return list.Select(MapToDto).ToList();
    }

    public async Task<AverageRatingDto> GetAverageRatingAsync(
        Guid employeeId, CancellationToken ct = default)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId, ct)
            ?? throw new KeyNotFoundException("Employee not found.");

        var reviews = await _context.PerformanceReviews
            .Where(r => r.EmployeeId == employeeId)
            .ToListAsync(ct);

        return new AverageRatingDto
        {
            EmployeeId    = employeeId,
            EmployeeName  = $"{employee.FirstName} {employee.LastName}",
            AverageRating = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0,
            ReviewCount   = reviews.Count,
        };
    }

    public async Task DeleteReviewAsync(Guid id, CancellationToken ct = default)
    {
        var review = await _context.PerformanceReviews.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Review '{id}' not found.");

        _context.PerformanceReviews.Remove(review);
        await _context.SaveChangesAsync(ct);
    }

    private static PerformanceReviewDto MapToDto(PerformanceReview r) => new()
    {
        Id           = r.Id,
        EmployeeId   = r.EmployeeId,
        EmployeeName = $"{r.Employee.FirstName} {r.Employee.LastName}",
        ReviewerId   = r.ReviewerId,
        ReviewerName = $"{r.Reviewer.FirstName} {r.Reviewer.LastName}",
        Period       = r.Period,
        Rating       = r.Rating,
        Comments     = r.Comments,
        Strengths    = r.Strengths,
        Improvements = r.Improvements,
        ReviewDate   = r.ReviewDate,
    };
}
