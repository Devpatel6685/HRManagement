namespace HRManagement.Application.DTOs.Payroll;

public class GeneratePayrollResultDto
{
    public int Generated { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = new();
}
