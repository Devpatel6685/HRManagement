using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid? HeadEmployeeId { get; set; }

    public Employee? HeadEmployee { get; set; }
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Designation> Designations { get; set; } = new List<Designation>();
    public ICollection<JobPosting> JobPostings { get; set; } = new List<JobPosting>();
}
