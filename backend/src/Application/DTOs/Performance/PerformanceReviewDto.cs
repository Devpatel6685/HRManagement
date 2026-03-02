namespace HRManagement.Application.DTOs.Performance;

public class PerformanceReviewDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comments { get; set; } = string.Empty;
    public string? Strengths { get; set; }
    public string? Improvements { get; set; }
    public DateTime ReviewDate { get; set; }
}

public class AddReviewDto
{
    public Guid EmployeeId { get; set; }
    public Guid ReviewerId { get; set; }
    public string Period { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comments { get; set; } = string.Empty;
    public string? Strengths { get; set; }
    public string? Improvements { get; set; }
}

public class AverageRatingDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}
