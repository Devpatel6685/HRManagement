namespace HRManagement.Application.DTOs.Departments;

public class DepartmentDetailDto
{
    public Guid      Id               { get; set; }
    public string    Name             { get; set; } = string.Empty;
    public Guid?     HeadEmployeeId   { get; set; }
    public string?   HeadEmployeeName { get; set; }
    public int       EmployeeCount    { get; set; }
    public DateTime  CreatedAt        { get; set; }
    public DateTime? UpdatedAt        { get; set; }
}
