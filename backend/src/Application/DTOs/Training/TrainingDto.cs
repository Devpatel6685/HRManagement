namespace HRManagement.Application.DTOs.Training;

public class TrainingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Trainer { get; set; } = string.Empty;
    public int MaxParticipants { get; set; }
    public int EnrolledCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTrainingDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Trainer { get; set; } = string.Empty;
    public int MaxParticipants { get; set; }
}

public class AssignEmployeesDto
{
    public List<Guid> EmployeeIds { get; set; } = new();
}

public class MarkCompletedDto
{
    public decimal? Score { get; set; }
}

public class EmployeeTrainingDto
{
    public Guid Id { get; set; }
    public Guid TrainingId { get; set; }
    public string TrainingTitle { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Trainer { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? CompletionDate { get; set; }
    public decimal? Score { get; set; }
}
