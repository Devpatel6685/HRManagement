using HRManagement.Application.DTOs.Departments;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IApplicationDbContext _context;

    public DepartmentService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Departments
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto { Id = d.Id, Name = d.Name })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DesignationDto>> GetDesignationsAsync(
        Guid departmentId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Designations
            .Where(d => d.DepartmentId == departmentId)
            .OrderBy(d => d.Level)
            .Select(d => new DesignationDto
            {
                Id           = d.Id,
                Title        = d.Title,
                DepartmentId = d.DepartmentId,
                Level        = d.Level,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DepartmentListDto>> GetAllWithCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Departments
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentListDto
            {
                Id               = d.Id,
                Name             = d.Name,
                HeadEmployeeName = d.HeadEmployee != null
                    ? d.HeadEmployee.FirstName + " " + d.HeadEmployee.LastName
                    : null,
                EmployeeCount = d.Employees.Count(e =>
                    e.Status != EmployeeStatus.Inactive &&
                    e.Status != EmployeeStatus.Terminated),
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<DepartmentDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var dto = await _context.Departments
            .Where(d => d.Id == id)
            .Select(d => new DepartmentDetailDto
            {
                Id               = d.Id,
                Name             = d.Name,
                HeadEmployeeId   = d.HeadEmployeeId,
                HeadEmployeeName = d.HeadEmployee != null
                    ? d.HeadEmployee.FirstName + " " + d.HeadEmployee.LastName
                    : null,
                EmployeeCount = d.Employees.Count(e =>
                    e.Status != EmployeeStatus.Inactive &&
                    e.Status != EmployeeStatus.Terminated),
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (dto is null)
            throw new KeyNotFoundException($"Department with id '{id}' was not found.");

        return dto;
    }

    public async Task<DepartmentDetailDto> CreateAsync(CreateDepartmentDto dto, CancellationToken cancellationToken = default)
    {
        var name = dto.Name.Trim();

        var exists = await _context.Departments
            .AnyAsync(d => d.Name.ToLower() == name.ToLower(), cancellationToken);

        if (exists)
            throw new InvalidOperationException($"A department named '{name}' already exists.");

        var entity = new Department
        {
            Name           = name,
            HeadEmployeeId = dto.HeadEmployeeId,
        };

        _context.Departments.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.Id, cancellationToken);
    }

    public async Task<DepartmentDetailDto> UpdateAsync(Guid id, UpdateDepartmentDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (entity is null)
            throw new KeyNotFoundException($"Department with id '{id}' was not found.");

        var name = dto.Name.Trim();

        var exists = await _context.Departments
            .AnyAsync(d => d.Name.ToLower() == name.ToLower() && d.Id != id, cancellationToken);

        if (exists)
            throw new InvalidOperationException($"A department named '{name}' already exists.");

        entity.Name           = name;
        entity.HeadEmployeeId = dto.HeadEmployeeId;
        entity.UpdatedAt      = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (entity is null)
            throw new KeyNotFoundException($"Department with id '{id}' was not found.");

        var activeCount = await _context.Employees
            .CountAsync(e =>
                e.DepartmentId == id &&
                e.Status != EmployeeStatus.Inactive &&
                e.Status != EmployeeStatus.Terminated,
                cancellationToken);

        if (activeCount > 0)
            throw new InvalidOperationException(
                $"Cannot delete department '{entity.Name}' because it has {activeCount} active employee(s). Reassign them first.");

        _context.Departments.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
