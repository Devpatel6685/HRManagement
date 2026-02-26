using HRManagement.Domain.Enums;

namespace HRManagement.Application.DTOs.Employees;

public class EmployeeListDto
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? DesignationTitle { get; set; }
    public EmployeeStatus Status { get; set; }
    public DateOnly JoinDate { get; set; }
}
