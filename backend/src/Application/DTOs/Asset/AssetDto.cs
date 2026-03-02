namespace HRManagement.Application.DTOs.Asset;

public class AssetDto
{
    public Guid Id { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetCode { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedToEmployeeId { get; set; }
    public string? AssignedToEmployeeName { get; set; }
    public DateTime? AssignedDate { get; set; }
    public DateTime? ReturnDate { get; set; }
}

public class CreateAssetDto
{
    public string AssetName { get; set; } = string.Empty;
    public string AssetCode { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class UpdateAssetDto
{
    public string AssetName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class AssignAssetDto
{
    public Guid EmployeeId { get; set; }
}

public class ChangeStatusDto
{
    public string Status { get; set; } = string.Empty;
}
