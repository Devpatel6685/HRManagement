namespace HRManagement.Application.DTOs.Recruitment;

public class ApplicantDto
{
    public Guid Id { get; set; }
    public Guid JobPostingId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? ResumeFileName { get; set; }
    public bool HasResume { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedOn { get; set; }
    public string? Notes { get; set; }
}

public class AddApplicantDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Notes { get; set; }
    // resume file handled via IFormFile in controller
}

public class UpdateApplicantStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class KanbanBoardDto
{
    public List<ApplicantDto> Applied { get; set; } = new();
    public List<ApplicantDto> Shortlisted { get; set; } = new();
    public List<ApplicantDto> Interviewed { get; set; } = new();
    public List<ApplicantDto> Offered { get; set; } = new();
    public List<ApplicantDto> Hired { get; set; } = new();
    public List<ApplicantDto> Rejected { get; set; } = new();
}
