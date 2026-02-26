namespace HRManagement.Application.DTOs.Departments;

public class UpdateDepartmentDto
{
    public string Name           { get; set; } = string.Empty;
    public Guid?  HeadEmployeeId { get; set; }
}
