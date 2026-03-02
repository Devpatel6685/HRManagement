using HRManagement.Application.DTOs.Payroll;

namespace HRManagement.Application.Interfaces;

public interface IPayrollService
{
    Task<GeneratePayrollResultDto> GeneratePayrollAsync(GeneratePayrollDto dto, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PayrollDto>> GetPayrollHistoryAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PayrollDto>> GetAllPayrollAsync(CancellationToken cancellationToken = default);
    Task<PayrollDto> MarkAsPaidAsync(Guid id, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfPayslipAsync(Guid payrollId, CancellationToken cancellationToken = default);
}
