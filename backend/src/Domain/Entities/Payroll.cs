using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class Payroll : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal HRA { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    public DateTime? PaidOn { get; set; }

    public Employee Employee { get; set; } = null!;
}
