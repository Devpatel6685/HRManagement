using AutoMapper;
using HRManagement.Application.Common;
using HRManagement.Application.DTOs.Employees;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public EmployeeService(
        IEmployeeRepository employeeRepository,
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _context = context;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<PagedResult<EmployeeListDto>> GetEmployeesAsync(
        EmployeeFilterParams filter,
        CancellationToken cancellationToken = default)
    {
        var paged = await _employeeRepository.GetAllAsync(
            filter.Search,
            filter.DepartmentId,
            filter.Status,
            filter.Page,
            filter.PageSize,
            cancellationToken);

        return new PagedResult<EmployeeListDto>
        {
            Items      = _mapper.Map<IReadOnlyList<EmployeeListDto>>(paged.Items),
            TotalCount = paged.TotalCount,
            Page       = paged.Page,
            PageSize   = paged.PageSize,
        };
    }

    public async Task<EmployeeDetailDto> GetEmployeeByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var employee = await _employeeRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with ID '{id}' was not found.");

        return _mapper.Map<EmployeeDetailDto>(employee);
    }

    public async Task<EmployeeDetailDto> GetMyProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var employee = await _employeeRepository.GetByUserIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("No employee profile is linked to this account.");

        return _mapper.Map<EmployeeDetailDto>(employee);
    }

    public async Task<EmployeeDetailDto> CreateEmployeeAsync(
        CreateEmployeeDto dto,
        CancellationToken cancellationToken = default)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email, cancellationToken))
            throw new InvalidOperationException("An account with this email already exists.");

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == dto.Role, cancellationToken)
            ?? throw new InvalidOperationException($"Role '{dto.Role}' does not exist.");

        // Create the login account
        var user = new User
        {
            Email        = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            RoleId       = role.Id,
            IsActive     = true,
        };

        _context.Users.Add(user);

        // Build the employee record — code will be generated inside CreateAsync
        var employee = new Employee
        {
            UserId        = user.Id,
            FirstName     = dto.FirstName,
            LastName      = dto.LastName,
            DOB           = dto.DOB,
            Gender        = dto.Gender,
            Phone         = dto.Phone,
            JoinDate      = dto.JoinDate,
            DepartmentId  = dto.DepartmentId,
            DesignationId = dto.DesignationId,
            ManagerId     = dto.ManagerId,
            Status        = EmployeeStatus.Active,
        };

        // Saves both User and Employee in one transaction
        await _employeeRepository.CreateAsync(employee, cancellationToken);

        var created = await _employeeRepository.GetByIdAsync(employee.Id, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve the created employee.");

        return _mapper.Map<EmployeeDetailDto>(created);
    }

    public async Task<EmployeeDetailDto> UpdateEmployeeAsync(
        Guid id,
        UpdateEmployeeDto dto,
        CancellationToken cancellationToken = default)
    {
        // Fetch as tracked — EF change detection handles the UPDATE
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with ID '{id}' was not found.");

        employee.FirstName     = dto.FirstName;
        employee.LastName      = dto.LastName;
        employee.Phone         = dto.Phone;
        employee.DOB           = dto.DOB;
        employee.Gender        = dto.Gender;
        employee.JoinDate      = dto.JoinDate;
        employee.Status        = dto.Status;
        employee.DepartmentId  = dto.DepartmentId;
        employee.DesignationId = dto.DesignationId;
        employee.ManagerId     = dto.ManagerId;

        await _employeeRepository.UpdateAsync(employee, cancellationToken);

        var updated = await _employeeRepository.GetByIdAsync(id, cancellationToken)!;
        return _mapper.Map<EmployeeDetailDto>(updated);
    }

    public async Task DeleteEmployeeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _employeeRepository.SoftDeleteAsync(id, cancellationToken);
    }
}
