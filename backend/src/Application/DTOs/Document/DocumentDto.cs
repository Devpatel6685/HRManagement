namespace HRManagement.Application.DTOs.Document;

public class DocumentDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string DocType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? EmployeeName { get; set; }
    public string? UploadedByName { get; set; }
    public DateTime UploadedOn { get; set; }
}

public class FileUploadDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Length { get; set; }
    public Stream OpenStream { get; set; } = Stream.Null;
}
