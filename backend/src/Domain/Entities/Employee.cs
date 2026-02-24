using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class Employee : BaseEntity
{
    public Guid? UserId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly DOB { get; set; }
    public Gender Gender { get; set; }
    public string Phone { get; set; } = string.Empty;
    public DateOnly JoinDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? DesignationId { get; set; }
    public Guid? ManagerId { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;

    public User? User { get; set; }
    public Department? Department { get; set; }
    public Designation? Designation { get; set; }
    public Employee? Manager { get; set; }
    public ICollection<Employee> Subordinates { get; set; } = new List<Employee>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<LeaveRequest> ApprovedLeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
    public ICollection<Payroll> Payrolls { get; set; } = new List<Payroll>();
    public ICollection<PerformanceReview> PerformanceReviews { get; set; } = new List<PerformanceReview>();
    public ICollection<PerformanceReview> ReviewsGiven { get; set; } = new List<PerformanceReview>();
    public ICollection<EmployeeTraining> EmployeeTrainings { get; set; } = new List<EmployeeTraining>();
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
