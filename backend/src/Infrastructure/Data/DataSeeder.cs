using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HRManagement.Infrastructure.Data;

public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(ApplicationDbContext context, ILogger<DataSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await _context.Database.MigrateAsync();

        await SeedRolesAsync();
        await SeedDepartmentsAsync();
        await SeedDesignationsAsync();
        await SeedLeaveTypesAsync();
        await SeedAdminUserAsync();
        await SeedLeaveBalancesAsync();
    }

    private async Task SeedRolesAsync()
    {
        if (await _context.Roles.AnyAsync()) return;

        var roles = new[]
        {
            new Role { Id = new Guid("00000000-0000-0000-0000-000000000001"), Name = "Admin",    CreatedAt = DateTime.UtcNow },
            new Role { Id = new Guid("00000000-0000-0000-0000-000000000002"), Name = "HR",       CreatedAt = DateTime.UtcNow },
            new Role { Id = new Guid("00000000-0000-0000-0000-000000000003"), Name = "Manager",  CreatedAt = DateTime.UtcNow },
            new Role { Id = new Guid("00000000-0000-0000-0000-000000000004"), Name = "Employee", CreatedAt = DateTime.UtcNow },
        };

        await _context.Roles.AddRangeAsync(roles);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} roles", roles.Length);
    }

    private async Task SeedDepartmentsAsync()
    {
        if (await _context.Departments.AnyAsync()) return;

        var departments = new[]
        {
            new Department { Name = "Engineering" },
            new Department { Name = "HR" },
            new Department { Name = "Finance" },
        };

        await _context.Departments.AddRangeAsync(departments);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} departments", departments.Length);
    }

    private async Task SeedDesignationsAsync()
    {
        if (await _context.Designations.AnyAsync()) return;

        var engineering = await _context.Departments.FirstAsync(d => d.Name == "Engineering");
        var hr          = await _context.Departments.FirstAsync(d => d.Name == "HR");
        var finance     = await _context.Departments.FirstAsync(d => d.Name == "Finance");

        var designations = new[]
        {
            new Designation { Title = "Software Engineer", DepartmentId = engineering.Id, Level = 1 },
            new Designation { Title = "Team Lead",         DepartmentId = engineering.Id, Level = 2 },
            new Designation { Title = "HR Manager",        DepartmentId = hr.Id,          Level = 2 },
            new Designation { Title = "Accountant",        DepartmentId = finance.Id,     Level = 1 },
            new Designation { Title = "Director",          DepartmentId = finance.Id,     Level = 3 },
        };

        await _context.Designations.AddRangeAsync(designations);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} designations", designations.Length);
    }

    private async Task SeedLeaveTypesAsync()
    {
        if (await _context.LeaveTypes.AnyAsync()) return;

        var leaveTypes = new[]
        {
            new LeaveType { Name = "Annual", MaxDaysPerYear = 15 },
            new LeaveType { Name = "Sick",   MaxDaysPerYear = 10 },
            new LeaveType { Name = "Casual", MaxDaysPerYear = 7  },
        };

        await _context.LeaveTypes.AddRangeAsync(leaveTypes);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} leave types", leaveTypes.Length);
    }

    private async Task SeedAdminUserAsync()
    {
        if (await _context.Users.AnyAsync()) return;

        var adminRole = await _context.Roles.FirstAsync(r => r.Name == "Admin");

        var adminUser = new User
        {
            Email        = "admin@hrms.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            RoleId       = adminRole.Id,
            IsActive     = true,
        };

        _context.Users.Add(adminUser);

        _context.Employees.Add(new Employee
        {
            UserId       = adminUser.Id,
            EmployeeCode = "EMP001",
            FirstName    = "System",
            LastName     = "Admin",
            JoinDate     = DateOnly.FromDateTime(DateTime.UtcNow),
            Status       = EmployeeStatus.Active,
        });

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded admin user: {Email}", adminUser.Email);
    }

    private async Task SeedLeaveBalancesAsync()
    {
        var leaveTypes = await _context.LeaveTypes.ToListAsync();
        if (!leaveTypes.Any()) return;

        var employees   = await _context.Employees.ToListAsync();
        var currentYear = DateTime.UtcNow.Year;
        var added       = 0;

        foreach (var employee in employees)
        {
            foreach (var lt in leaveTypes)
            {
                var exists = await _context.LeaveBalances.AnyAsync(b =>
                    b.EmployeeId  == employee.Id &&
                    b.LeaveTypeId == lt.Id &&
                    b.Year        == currentYear);

                if (!exists)
                {
                    _context.LeaveBalances.Add(new LeaveBalance
                    {
                        EmployeeId  = employee.Id,
                        LeaveTypeId = lt.Id,
                        Year        = currentYear,
                        TotalDays   = lt.MaxDaysPerYear,
                        UsedDays    = 0,
                    });
                    added++;
                }
            }
        }

        if (added > 0)
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Seeded {Count} leave balance record(s)", added);
        }
    }
}
