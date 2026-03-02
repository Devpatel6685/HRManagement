using HRManagement.Application.DTOs.Asset;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;

    public AssetsController(IAssetService assetService)
    {
        _assetService = assetService;
    }

    // GET /api/assets  [Admin, HR]
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _assetService.GetAllAssetsAsync(ct);
        return Ok(result);
    }

    // GET /api/assets/available
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable(CancellationToken ct)
    {
        var result = await _assetService.GetAvailableAssetsAsync(ct);
        return Ok(result);
    }

    // GET /api/assets/employee/{employeeId}
    [HttpGet("employee/{employeeId:guid}")]
    public async Task<IActionResult> GetEmployeeAssets(Guid employeeId, CancellationToken ct)
    {
        var result = await _assetService.GetEmployeeAssetsAsync(employeeId, ct);
        return Ok(result);
    }

    // POST /api/assets  [Admin, HR]
    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create([FromBody] CreateAssetDto dto, CancellationToken ct)
    {
        var result = await _assetService.CreateAssetAsync(dto, ct);
        return CreatedAtAction(nameof(GetAll), new { }, result);
    }

    // PUT /api/assets/{id}  [Admin, HR]
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAssetDto dto, CancellationToken ct)
    {
        var result = await _assetService.UpdateAssetAsync(id, dto, ct);
        return Ok(result);
    }

    // DELETE /api/assets/{id}  [Admin, HR]
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _assetService.DeleteAssetAsync(id, ct);
        return NoContent();
    }

    // PUT /api/assets/{id}/assign  [Admin, HR]
    [HttpPut("{id:guid}/assign")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignAssetDto dto, CancellationToken ct)
    {
        var result = await _assetService.AssignAssetAsync(id, dto.EmployeeId, ct);
        return Ok(result);
    }

    // PUT /api/assets/{id}/return  [Admin, HR]
    [HttpPut("{id:guid}/return")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Return(Guid id, CancellationToken ct)
    {
        var result = await _assetService.ReturnAssetAsync(id, ct);
        return Ok(result);
    }

    // PUT /api/assets/{id}/status  [Admin, HR]
    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeStatusDto dto, CancellationToken ct)
    {
        var result = await _assetService.ChangeStatusAsync(id, dto.Status, ct);
        return Ok(result);
    }
}
