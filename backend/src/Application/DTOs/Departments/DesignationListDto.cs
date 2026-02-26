namespace HRManagement.Application.DTOs.Departments;

public class DesignationListDto
{
    public Guid   Id             { get; set; }
    public string Title          { get; set; } = string.Empty;
    public Guid   DepartmentId   { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int    Level          { get; set; }
    public string LevelLabel     { get; set; } = string.Empty;
    public int    EmployeeCount  { get; set; }
}
