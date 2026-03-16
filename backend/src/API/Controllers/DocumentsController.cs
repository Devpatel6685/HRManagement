using HRManagement.Application.DTOs.Document;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
        => _documentService = documentService;

    // GET /api/documents  (Admin, HR)
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAllDocuments()
    {
        var docs = await _documentService.GetAllDocumentsAsync();
        return Ok(docs);
    }

    // GET /api/documents/employee/{employeeId}
    [HttpGet("employee/{employeeId:guid}")]
    public async Task<IActionResult> GetEmployeeDocuments(Guid employeeId)
    {
        var docs = await _documentService.GetEmployeeDocumentsAsync(employeeId);
        return Ok(docs);
    }

    // POST /api/documents/employee/{employeeId}
    [HttpPost("employee/{employeeId:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UploadDocument(
        Guid employeeId, IFormFile file, [FromForm] string docType)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var dto = new FileUploadDto
        {
            FileName    = file.FileName,
            ContentType = file.ContentType,
            Length      = file.Length,
            OpenStream  = file.OpenReadStream(),
        };
        var result = await _documentService.UploadDocumentAsync(employeeId, dto, docType, userId);
        return Ok(result);
    }

    // GET /api/documents/{id}/download
    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id)
    {
        var (stream, fileName, contentType) = await _documentService.DownloadDocumentAsync(id);
        return File(stream, contentType, fileName);
    }

    // DELETE /api/documents/{id}
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        await _documentService.DeleteDocumentAsync(id);
        return NoContent();
    }
}
