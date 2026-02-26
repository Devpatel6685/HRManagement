using HRManagement.Domain.Enums;

namespace HRManagement.Application.DTOs.Employees;

public class EmployeeFilterParams
{
    public string? Search { get; set; }
    public Guid? DepartmentId { get; set; }
    public EmployeeStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
