using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class Asset : BaseEntity
{
    public string AssetName { get; set; } = string.Empty;
    public string AssetCode { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public Guid? AssignedToEmployeeId { get; set; }
    public DateTime? AssignedDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public AssetStatus Status { get; set; } = AssetStatus.Available;

    public Employee? AssignedToEmployee { get; set; }
}
