using HRManagement.Application.Interfaces;
using HRManagement.Domain.Common;
using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Designation> Designations => Set<Designation>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
    public DbSet<Payroll> Payrolls => Set<Payroll>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<Applicant> Applicants => Set<Applicant>();
    public DbSet<PerformanceReview> PerformanceReviews => Set<PerformanceReview>();
    public DbSet<Training> Trainings => Set<Training>();
    public DbSet<EmployeeTraining> EmployeeTrainings => Set<EmployeeTraining>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            if (entry.State == EntityState.Added)
                entity.CreatedAt = DateTime.UtcNow;

            entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}
