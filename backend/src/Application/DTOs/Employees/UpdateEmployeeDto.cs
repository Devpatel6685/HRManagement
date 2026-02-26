using HRManagement.Domain.Enums;

namespace HRManagement.Application.DTOs.Employees;

public class UpdateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateOnly DOB { get; set; }
    public Gender Gender { get; set; }
    public DateOnly JoinDate { get; set; }
    public EmployeeStatus Status { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? DesignationId { get; set; }
    public Guid? ManagerId { get; set; }
}
