using HRManagement.Application.DTOs.Departments;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/departments")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly IDesignationService _designationService;

    public DepartmentsController(IDepartmentService departmentService, IDesignationService designationService)
    {
        _departmentService  = departmentService;
        _designationService = designationService;
    }

    // ── Department Endpoints ──────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var departments = await _departmentService.GetAllAsync(cancellationToken);
        return Ok(departments);
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetAllWithCount(CancellationToken cancellationToken)
    {
        var departments = await _departmentService.GetAllWithCountAsync(cancellationToken);
        return Ok(departments);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var department = await _departmentService.GetByIdAsync(id, cancellationToken);
        return Ok(department);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentDto dto, CancellationToken cancellationToken)
    {
        var created = await _departmentService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentDto dto, CancellationToken cancellationToken)
    {
        var updated = await _departmentService.UpdateAsync(id, dto, cancellationToken);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _departmentService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("{id:guid}/designations")]
    public async Task<IActionResult> GetDesignations(Guid id, CancellationToken cancellationToken)
    {
        var designations = await _departmentService.GetDesignationsAsync(id, cancellationToken);
        return Ok(designations);
    }

    // ── Designation Endpoints ─────────────────────────────────────────────

    [HttpGet("/api/designations")]
    public async Task<IActionResult> GetAllDesignations([FromQuery] Guid? departmentId, CancellationToken cancellationToken)
    {
        var designations = await _designationService.GetAllAsync(departmentId, cancellationToken);
        return Ok(designations);
    }

    [HttpGet("/api/designations/{id:guid}")]
    public async Task<IActionResult> GetDesignationById(Guid id, CancellationToken cancellationToken)
    {
        var designation = await _designationService.GetByIdAsync(id, cancellationToken);
        return Ok(designation);
    }

    [HttpPost("/api/designations")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> CreateDesignation([FromBody] CreateDesignationDto dto, CancellationToken cancellationToken)
    {
        var created = await _designationService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetDesignationById), new { id = created.Id }, created);
    }

    [HttpPut("/api/designations/{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpdateDesignation(Guid id, [FromBody] UpdateDesignationDto dto, CancellationToken cancellationToken)
    {
        var updated = await _designationService.UpdateAsync(id, dto, cancellationToken);
        return Ok(updated);
    }

    [HttpDelete("/api/designations/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDesignation(Guid id, CancellationToken cancellationToken)
    {
        await _designationService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
