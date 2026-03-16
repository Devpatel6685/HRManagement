using HRManagement.Application.DTOs.Document;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HRManagement.Application.Services;

public class DocumentStorageOptions
{
    public string BasePath { get; set; } = string.Empty;
}

public class DocumentService : IDocumentService
{
    private readonly IApplicationDbContext _db;
    private readonly string _basePath;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".jpg", ".jpeg", ".png" };

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        { "application/pdf", "image/jpeg", "image/jpg", "image/png" };

    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public DocumentService(IApplicationDbContext db, IOptions<DocumentStorageOptions> options)
    {
        _db = db;
        _basePath = options.Value.BasePath;
    }

    public async Task<DocumentDto> UploadDocumentAsync(
        Guid employeeId, FileUploadDto file, string docType, Guid uploadedById)
    {
        var ext = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Only PDF, JPG, and PNG files are allowed.");

        if (!AllowedContentTypes.Contains(file.ContentType))
            throw new InvalidOperationException("Invalid file content type.");

        if (file.Length > MaxFileSize)
            throw new InvalidOperationException("File size must not exceed 5 MB.");

        var directory = Path.Combine(_basePath, "documents", employeeId.ToString());
        Directory.CreateDirectory(directory);

        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(directory, uniqueName);

        using (var fs = File.Create(filePath))
            await file.OpenStream.CopyToAsync(fs);

        var doc = new Document
        {
            EmployeeId = employeeId,
            DocType = docType,
            FileName = file.FileName,
            FilePath = filePath,
            FileSize = file.Length,
            UploadedById = uploadedById,
            UploadedOn = DateTime.UtcNow,
        };

        _db.Documents.Add(doc);
        await _db.SaveChangesAsync();

        var uploaderName = await _db.Users
            .Where(u => u.Id == uploadedById)
            .Select(u => u.Employee != null
                ? u.Employee.FirstName + " " + u.Employee.LastName
                : u.Email)
            .FirstOrDefaultAsync();

        return MapToDto(doc, uploaderName);
    }

    public async Task<IEnumerable<DocumentDto>> GetAllDocumentsAsync()
    {
        return await _db.Documents
            .OrderByDescending(d => d.UploadedOn)
            .Select(d => new DocumentDto
            {
                Id = d.Id,
                EmployeeId = d.EmployeeId,
                DocType = d.DocType,
                FileName = d.FileName,
                FileSize = d.FileSize,
                EmployeeName = d.Employee.FirstName + " " + d.Employee.LastName,
                UploadedByName = d.UploadedBy != null
                    ? (d.UploadedBy.Employee != null
                        ? d.UploadedBy.Employee.FirstName + " " + d.UploadedBy.Employee.LastName
                        : d.UploadedBy.Email)
                    : null,
                UploadedOn = d.UploadedOn,
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<DocumentDto>> GetEmployeeDocumentsAsync(Guid employeeId)
    {
        return await _db.Documents
            .Where(d => d.EmployeeId == employeeId)
            .OrderByDescending(d => d.UploadedOn)
            .Select(d => new DocumentDto
            {
                Id = d.Id,
                EmployeeId = d.EmployeeId,
                DocType = d.DocType,
                FileName = d.FileName,
                FileSize = d.FileSize,
                EmployeeName = d.Employee.FirstName + " " + d.Employee.LastName,
                UploadedByName = d.UploadedBy != null
                    ? (d.UploadedBy.Employee != null
                        ? d.UploadedBy.Employee.FirstName + " " + d.UploadedBy.Employee.LastName
                        : d.UploadedBy.Email)
                    : null,
                UploadedOn = d.UploadedOn,
            })
            .ToListAsync();
    }

    public async Task<(Stream stream, string fileName, string contentType)> DownloadDocumentAsync(Guid id)
    {
        var doc = await _db.Documents.FindAsync(id)
            ?? throw new KeyNotFoundException("Document not found.");

        if (!File.Exists(doc.FilePath))
            throw new KeyNotFoundException("File not found on server.");

        var contentType = Path.GetExtension(doc.FilePath).ToLower() switch
        {
            ".pdf"           => "application/pdf",
            ".jpg" or ".jpeg"=> "image/jpeg",
            ".png"           => "image/png",
            _                => "application/octet-stream",
        };

        return (File.OpenRead(doc.FilePath), doc.FileName, contentType);
    }

    public async Task DeleteDocumentAsync(Guid id)
    {
        var doc = await _db.Documents.FindAsync(id)
            ?? throw new KeyNotFoundException("Document not found.");

        if (File.Exists(doc.FilePath))
            File.Delete(doc.FilePath);

        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync();
    }

    private static DocumentDto MapToDto(Document doc, string? uploaderName) => new()
    {
        Id = doc.Id,
        EmployeeId = doc.EmployeeId,
        DocType = doc.DocType,
        FileName = doc.FileName,
        FileSize = doc.FileSize,
        UploadedByName = uploaderName,
        UploadedOn = doc.UploadedOn,
    };
}
