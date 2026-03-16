using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Employee> Employees { get; }
    DbSet<Department> Departments { get; }
    DbSet<Designation> Designations { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Attendance> Attendances { get; }
    DbSet<AttendanceBreak> AttendanceBreaks { get; }
    DbSet<LeaveType> LeaveTypes { get; }
    DbSet<LeaveRequest> LeaveRequests { get; }
    DbSet<LeaveBalance> LeaveBalances { get; }
    DbSet<Payroll> Payrolls { get; }
    DbSet<JobPosting> JobPostings { get; }
    DbSet<Applicant> Applicants { get; }
    DbSet<PerformanceReview> PerformanceReviews { get; }
    DbSet<Asset> Assets { get; }
    DbSet<Training> Trainings { get; }
    DbSet<EmployeeTraining> EmployeeTrainings { get; }
    DbSet<Document> Documents { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
