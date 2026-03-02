using HRManagement.Application.DTOs.Leave;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using HRManagement.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class LeaveService : ILeaveService
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public LeaveService(IApplicationDbContext context, IEmailService emailService)
    {
        _context      = context;
        _emailService = emailService;
    }

    public async Task<LeaveRequestDto> ApplyLeaveAsync(
        Guid employeeId, ApplyLeaveDto dto,
        CancellationToken cancellationToken = default)
    {
        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == employeeId, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with id '{employeeId}' was not found.");

        var leaveType = await _context.LeaveTypes
            .FirstOrDefaultAsync(lt => lt.Id == dto.LeaveTypeId, cancellationToken)
            ?? throw new KeyNotFoundException($"Leave type with id '{dto.LeaveTypeId}' was not found.");

        if (dto.ToDate < dto.FromDate)
            throw new ArgumentException("ToDate must be on or after FromDate.");

        var totalDays = dto.ToDate.DayNumber - dto.FromDate.DayNumber + 1;

        // Validate no overlapping pending/approved requests
        var overlap = await _context.LeaveRequests
            .AnyAsync(r =>
                r.EmployeeId == employeeId &&
                r.Status != LeaveRequestStatus.Rejected &&
                r.Status != LeaveRequestStatus.Cancelled &&
                r.FromDate <= dto.ToDate &&
                r.ToDate >= dto.FromDate,
                cancellationToken);

        if (overlap)
            throw new InvalidOperationException(
                "An overlapping leave request already exists for this period.");

        // Check remaining balance
        var balance = await _context.LeaveBalances
            .FirstOrDefaultAsync(b =>
                b.EmployeeId  == employeeId &&
                b.LeaveTypeId == dto.LeaveTypeId &&
                b.Year        == dto.FromDate.Year,
                cancellationToken);

        if (balance is null || balance.RemainingDays < totalDays)
            throw new InsufficientLeaveBalanceException(
                $"Insufficient leave balance. Requested: {totalDays} day(s). Remaining: {balance?.RemainingDays ?? 0} day(s).");

        var request = new LeaveRequest
        {
            EmployeeId        = employeeId,
            LeaveTypeId       = dto.LeaveTypeId,
            FromDate          = dto.FromDate,
            ToDate            = dto.ToDate,
            TotalDays         = totalDays,
            Reason            = dto.Reason,
            AvailableOnPhone  = dto.AvailableOnPhone,
            AlternativePhone  = dto.AlternativePhone,
            Status            = LeaveRequestStatus.Pending,
        };

        _context.LeaveRequests.Add(request);
        await _context.SaveChangesAsync(cancellationToken);

        // Notify manager (fire-and-forget, non-blocking)
        if (employee.ManagerId.HasValue)
        {
            var manager = await _context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == employee.ManagerId.Value, cancellationToken);

            if (manager?.User is not null)
            {
                try
                {
                    await _emailService.SendLeaveRequestNotificationAsync(
                        manager.User.Email,
                        $"{manager.FirstName} {manager.LastName}",
                        $"{employee.FirstName} {employee.LastName}",
                        leaveType.Name,
                        dto.FromDate.ToString("MMM d, yyyy"),
                        dto.ToDate.ToString("MMM d, yyyy"),
                        totalDays);
                }
                catch { /* email is best-effort */ }
            }
        }

        return await GetRequestByIdAsync(request.Id, cancellationToken);
    }

    public async Task<LeaveRequestDto> ApproveLeaveAsync(
        Guid requestId, Guid approverId,
        CancellationToken cancellationToken = default)
    {
        var request = await _context.LeaveRequests
            .Include(r => r.Employee).ThenInclude(e => e.User)
            .Include(r => r.LeaveType)
            .FirstOrDefaultAsync(r => r.Id == requestId, cancellationToken)
            ?? throw new KeyNotFoundException($"Leave request with id '{requestId}' was not found.");

        if (request.Status != LeaveRequestStatus.Pending)
            throw new InvalidOperationException(
                $"Cannot approve a request with status '{request.Status}'.");

        var balance = await _context.LeaveBalances
            .FirstOrDefaultAsync(b =>
                b.EmployeeId  == request.EmployeeId &&
                b.LeaveTypeId == request.LeaveTypeId &&
                b.Year        == request.FromDate.Year,
                cancellationToken)
            ?? throw new InvalidOperationException("Leave balance record not found for this employee and leave type.");

        if (balance.RemainingDays < request.TotalDays)
            throw new InsufficientLeaveBalanceException(
                $"Insufficient leave balance. Requested: {request.TotalDays} day(s). Remaining: {balance.RemainingDays} day(s).");

        request.Status       = LeaveRequestStatus.Approved;
        request.ApprovedById = approverId;
        request.ApprovedAt   = DateTime.UtcNow;

        balance.UsedDays += request.TotalDays;

        await _context.SaveChangesAsync(cancellationToken);

        if (request.Employee.User is not null)
        {
            try
            {
                await _emailService.SendLeaveApprovedEmailAsync(
                    request.Employee.User.Email,
                    $"{request.Employee.FirstName} {request.Employee.LastName}",
                    request.LeaveType.Name,
                    request.FromDate.ToString("MMM d, yyyy"),
                    request.ToDate.ToString("MMM d, yyyy"));
            }
            catch { /* email is best-effort */ }
        }

        return await GetRequestByIdAsync(requestId, cancellationToken);
    }

    public async Task<LeaveRequestDto> RejectLeaveAsync(
        Guid requestId, Guid approverId, string reason,
        CancellationToken cancellationToken = default)
    {
        var request = await _context.LeaveRequests
            .Include(r => r.Employee).ThenInclude(e => e.User)
            .Include(r => r.LeaveType)
            .FirstOrDefaultAsync(r => r.Id == requestId, cancellationToken)
            ?? throw new KeyNotFoundException($"Leave request with id '{requestId}' was not found.");

        if (request.Status != LeaveRequestStatus.Pending)
            throw new InvalidOperationException(
                $"Cannot reject a request with status '{request.Status}'.");

        request.Status          = LeaveRequestStatus.Rejected;
        request.ApprovedById    = approverId;
        request.ApprovedAt      = DateTime.UtcNow;
        request.RejectionReason = reason;

        await _context.SaveChangesAsync(cancellationToken);

        if (request.Employee.User is not null)
        {
            try
            {
                await _emailService.SendLeaveRejectedEmailAsync(
                    request.Employee.User.Email,
                    $"{request.Employee.FirstName} {request.Employee.LastName}",
                    request.LeaveType.Name,
                    request.FromDate.ToString("MMM d, yyyy"),
                    request.ToDate.ToString("MMM d, yyyy"),
                    reason);
            }
            catch { /* email is best-effort */ }
        }

        return await GetRequestByIdAsync(requestId, cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveBalanceDto>> GetBalanceAsync(
        Guid employeeId, int year,
        CancellationToken cancellationToken = default)
    {
        return await _context.LeaveBalances
            .Where(b => b.EmployeeId == employeeId && b.Year == year)
            .OrderBy(b => b.LeaveType.Name)
            .Select(b => new LeaveBalanceDto
            {
                Id            = b.Id,
                LeaveTypeId   = b.LeaveTypeId,
                LeaveType     = b.LeaveType.Name,
                Year          = b.Year,
                TotalDays     = b.TotalDays,
                UsedDays      = b.UsedDays,
                RemainingDays = b.RemainingDays,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LeaveRequestDto>> GetRequestsAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        var list = await _context.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovedBy)
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return list.Select(ProjectToDto).ToList();
    }

    public async Task<IReadOnlyList<LeaveRequestDto>> GetPendingRequestsAsync(
        Guid approverId, bool isHrOrAdmin,
        CancellationToken cancellationToken = default)
    {
        IQueryable<LeaveRequest> query = _context.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovedBy)
            .Where(r => r.Status == LeaveRequestStatus.Pending);

        query = isHrOrAdmin
            // HR / Admin see everyone's requests except their own
            ? query.Where(r => r.EmployeeId != approverId)
            // Manager sees only direct reports' requests
            : query.Where(r => r.Employee.ManagerId == approverId);

        var list = await query.OrderBy(r => r.CreatedAt).ToListAsync(cancellationToken);
        return list.Select(ProjectToDto).ToList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private async Task<LeaveRequestDto> GetRequestByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var request = await _context.LeaveRequests
            .Include(r => r.Employee)
            .Include(r => r.LeaveType)
            .Include(r => r.ApprovedBy)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Leave request with id '{id}' was not found.");

        return ProjectToDto(request);
    }

    private static LeaveRequestDto ProjectToDto(LeaveRequest r) => new()
    {
        Id              = r.Id,
        EmployeeId      = r.EmployeeId,
        EmployeeName    = r.Employee.FirstName + " " + r.Employee.LastName,
        LeaveTypeId     = r.LeaveTypeId,
        LeaveType       = r.LeaveType.Name,
        FromDate        = r.FromDate,
        ToDate          = r.ToDate,
        TotalDays       = r.TotalDays,
        Reason           = r.Reason,
        AvailableOnPhone = r.AvailableOnPhone,
        AlternativePhone = r.AlternativePhone,
        RejectionReason  = r.RejectionReason,
        Status          = r.Status.ToString(),
        ApprovedAt      = r.ApprovedAt,
        ApprovedByName  = r.ApprovedBy != null
            ? r.ApprovedBy.FirstName + " " + r.ApprovedBy.LastName
            : null,
        CreatedAt       = r.CreatedAt,
    };
}
