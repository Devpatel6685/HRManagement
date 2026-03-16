using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class Document : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public string DocType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public Guid? UploadedById { get; set; }
    public DateTime UploadedOn { get; set; } = DateTime.UtcNow;

    public Employee Employee { get; set; } = null!;
    public User? UploadedBy { get; set; }
}
