using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class Training : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Trainer { get; set; } = string.Empty;
    public int MaxParticipants { get; set; }

    public ICollection<EmployeeTraining> EmployeeTrainings { get; set; } = new List<EmployeeTraining>();
}
