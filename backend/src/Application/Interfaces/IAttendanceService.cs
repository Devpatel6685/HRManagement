using HRManagement.Application.DTOs.Attendance;

namespace HRManagement.Application.Interfaces;

public interface IAttendanceService
{
    Task<AttendanceDto> CheckInAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<AttendanceDto> CheckOutAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<AttendanceDto> StartBreakAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<AttendanceDto> EndBreakAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<MonthlyReportDto> GetMonthlyReportAsync(Guid employeeId, int month, int year, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TeamSummaryDto>> GetTeamSummaryAsync(Guid departmentId, DateOnly date, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TeamSummaryDto>> GetManagerTeamDailyAsync(Guid managerId, DateOnly date, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TeamSummaryDto>> GetCompanyDailyAsync(DateOnly date, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EmployeeMonthlySummaryDto>> GetManagerTeamMonthlyAsync(Guid managerId, int month, int year, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EmployeeMonthlySummaryDto>> GetCompanyMonthlyAsync(int month, int year, CancellationToken cancellationToken = default);
}
