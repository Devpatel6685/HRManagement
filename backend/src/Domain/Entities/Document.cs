using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class Document : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public string DocType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public DateTime UploadedOn { get; set; } = DateTime.UtcNow;

    public Employee Employee { get; set; } = null!;
}
