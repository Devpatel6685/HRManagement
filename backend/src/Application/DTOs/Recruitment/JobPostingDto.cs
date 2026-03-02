namespace HRManagement.Application.DTOs.Recruitment;

public class JobPostingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public int Openings { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime PostedOn { get; set; }
    public DateTime? ClosedOn { get; set; }
    public int ApplicantCount { get; set; }
}

public class CreateJobPostingDto
{
    public string Title { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public int Openings { get; set; }
}

public class UpdateJobPostingDto
{
    public string Title { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public int Openings { get; set; }
    public string Status { get; set; } = string.Empty;
}
