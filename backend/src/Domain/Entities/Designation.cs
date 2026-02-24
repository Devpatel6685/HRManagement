using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class Designation : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public int Level { get; set; }

    public Department Department { get; set; } = null!;
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
