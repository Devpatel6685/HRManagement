namespace HRManagement.Application.DTOs.Departments;

public class DepartmentListDto
{
    public Guid    Id               { get; set; }
    public string  Name             { get; set; } = string.Empty;
    public string? HeadEmployeeName { get; set; }
    public int     EmployeeCount    { get; set; }
}
