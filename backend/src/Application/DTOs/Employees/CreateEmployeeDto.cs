using HRManagement.Domain.Enums;

namespace HRManagement.Application.DTOs.Employees;

public class CreateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Employee";
    public DateOnly DOB { get; set; }
    public Gender Gender { get; set; }
    public string Phone { get; set; } = string.Empty;
    public DateOnly JoinDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? DesignationId { get; set; }
    public Guid? ManagerId { get; set; }
}
