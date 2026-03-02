using HRManagement.Application.DTOs.Leave;

namespace HRManagement.Application.Interfaces;

public interface ILeaveService
{
    Task<LeaveRequestDto> ApplyLeaveAsync(Guid employeeId, ApplyLeaveDto dto, CancellationToken cancellationToken = default);
    Task<LeaveRequestDto> ApproveLeaveAsync(Guid requestId, Guid approverId, CancellationToken cancellationToken = default);
    Task<LeaveRequestDto> RejectLeaveAsync(Guid requestId, Guid approverId, string reason, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LeaveBalanceDto>> GetBalanceAsync(Guid employeeId, int year, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LeaveRequestDto>> GetRequestsAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LeaveRequestDto>> GetPendingRequestsAsync(Guid approverId, bool isHrOrAdmin, CancellationToken cancellationToken = default);
}
