namespace HRManagement.Application.DTOs.Departments;

public class CreateDepartmentDto
{
    public string Name           { get; set; } = string.Empty;
    public Guid?  HeadEmployeeId { get; set; }
}
