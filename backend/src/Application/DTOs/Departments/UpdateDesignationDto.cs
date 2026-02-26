namespace HRManagement.Application.DTOs.Departments;

public class UpdateDesignationDto
{
    public string Title        { get; set; } = string.Empty;
    public Guid   DepartmentId { get; set; }
    public int    Level        { get; set; }
}
