namespace HRManagement.Application.DTOs.Payroll;

public class GeneratePayrollDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public List<EmployeePayrollInput> Employees { get; set; } = new();
}

public class EmployeePayrollInput
{
    public Guid EmployeeId { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal HRA { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
}
