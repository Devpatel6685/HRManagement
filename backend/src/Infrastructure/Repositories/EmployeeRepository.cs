using HRManagement.Application.Common;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using HRManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<Employee>> GetAllAsync(
        string? search,
        Guid? departmentId,
        EmployeeStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Include(e => e.User)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(e =>
                EF.Functions.ILike(e.FirstName, term) ||
                EF.Functions.ILike(e.LastName, term) ||
                EF.Functions.ILike(e.EmployeeCode, term) ||
                (e.User != null && EF.Functions.ILike(e.User.Email, term)));
        }

        if (departmentId.HasValue)
            query = query.Where(e => e.DepartmentId == departmentId);

        if (status.HasValue)
            query = query.Where(e => e.Status == status);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(e => e.FirstName)
            .ThenBy(e => e.LastName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Employee>
        {
            Items      = items,
            TotalCount = totalCount,
            Page       = page,
            PageSize   = pageSize,
        };
    }

    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Include(e => e.Manager)
            .Include(e => e.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<Employee?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Include(e => e.Manager)
            .Include(e => e.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId, cancellationToken);
    }

    public async Task<string> GenerateEmployeeCodeAsync(CancellationToken cancellationToken = default)
    {
        // Load all codes matching "EMP-XXXX" pattern (max 4-digit sequential codes)
        var existingCodes = await _context.Employees
            .Where(e => e.EmployeeCode.StartsWith("EMP-") && e.EmployeeCode.Length == 8)
            .Select(e => e.EmployeeCode)
            .ToListAsync(cancellationToken);

        var highest = existingCodes
            .Select(c => int.TryParse(c[4..], out var n) ? n : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"EMP-{(highest + 1):D4}";
    }

    public async Task CreateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        employee.EmployeeCode = await GenerateEmployeeCodeAsync(cancellationToken);
        _context.Employees.Add(employee);
        // Saves both the pending User (added by service) and this Employee in one transaction
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        _context.Employees.Update(employee);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with ID '{id}' was not found.");

        employee.Status = EmployeeStatus.Inactive;

        if (employee.User != null)
            employee.User.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
