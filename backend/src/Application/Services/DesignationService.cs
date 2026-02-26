using HRManagement.Application.DTOs.Departments;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class DesignationService : IDesignationService
{
    private readonly IApplicationDbContext _context;

    public DesignationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<DesignationListDto>> GetAllAsync(
        Guid? departmentId,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Designations.AsQueryable();

        if (departmentId.HasValue)
            query = query.Where(d => d.DepartmentId == departmentId.Value);

        return await query
            .OrderBy(d => d.Department.Name)
            .ThenBy(d => d.Level)
            .Select(d => new DesignationListDto
            {
                Id             = d.Id,
                Title          = d.Title,
                DepartmentId   = d.DepartmentId,
                DepartmentName = d.Department.Name,
                Level          = d.Level,
                LevelLabel = d.Level == 1 ? "Level 1 — Junior"
                           : d.Level == 2 ? "Level 2 — Mid"
                           : d.Level == 3 ? "Level 3 — Senior"
                           : d.Level == 4 ? "Level 4 — Lead"
                           :                "Level 5 — Manager",
                EmployeeCount = d.Employees.Count(e =>
                    e.Status != EmployeeStatus.Inactive &&
                    e.Status != EmployeeStatus.Terminated),
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<DesignationListDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var dto = await _context.Designations
            .Where(d => d.Id == id)
            .Select(d => new DesignationListDto
            {
                Id             = d.Id,
                Title          = d.Title,
                DepartmentId   = d.DepartmentId,
                DepartmentName = d.Department.Name,
                Level          = d.Level,
                LevelLabel = d.Level == 1 ? "Level 1 — Junior"
                           : d.Level == 2 ? "Level 2 — Mid"
                           : d.Level == 3 ? "Level 3 — Senior"
                           : d.Level == 4 ? "Level 4 — Lead"
                           :                "Level 5 — Manager",
                EmployeeCount = d.Employees.Count(e =>
                    e.Status != EmployeeStatus.Inactive &&
                    e.Status != EmployeeStatus.Terminated),
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (dto is null)
            throw new KeyNotFoundException($"Designation with id '{id}' was not found.");

        return dto;
    }

    public async Task<DesignationListDto> CreateAsync(CreateDesignationDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Level < 1 || dto.Level > 5)
            throw new InvalidOperationException("Level must be between 1 and 5.");

        var title = dto.Title.Trim();

        var exists = await _context.Designations
            .AnyAsync(d =>
                d.DepartmentId == dto.DepartmentId &&
                d.Title.ToLower() == title.ToLower(),
                cancellationToken);

        if (exists)
            throw new InvalidOperationException(
                $"A designation titled '{title}' already exists in this department.");

        var entity = new Designation
        {
            Title        = title,
            DepartmentId = dto.DepartmentId,
            Level        = dto.Level,
        };

        _context.Designations.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.Id, cancellationToken);
    }

    public async Task<DesignationListDto> UpdateAsync(Guid id, UpdateDesignationDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Designations
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (entity is null)
            throw new KeyNotFoundException($"Designation with id '{id}' was not found.");

        if (dto.Level < 1 || dto.Level > 5)
            throw new InvalidOperationException("Level must be between 1 and 5.");

        var title = dto.Title.Trim();

        var exists = await _context.Designations
            .AnyAsync(d =>
                d.DepartmentId == dto.DepartmentId &&
                d.Title.ToLower() == title.ToLower() &&
                d.Id != id,
                cancellationToken);

        if (exists)
            throw new InvalidOperationException(
                $"A designation titled '{title}' already exists in this department.");

        entity.Title        = title;
        entity.DepartmentId = dto.DepartmentId;
        entity.Level        = dto.Level;
        entity.UpdatedAt    = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Designations
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (entity is null)
            throw new KeyNotFoundException($"Designation with id '{id}' was not found.");

        var activeCount = await _context.Employees
            .CountAsync(e =>
                e.DesignationId == id &&
                e.Status != EmployeeStatus.Inactive &&
                e.Status != EmployeeStatus.Terminated,
                cancellationToken);

        if (activeCount > 0)
            throw new InvalidOperationException(
                $"Cannot delete designation '{entity.Title}' because it has {activeCount} active employee(s). Reassign them first.");

        _context.Designations.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
