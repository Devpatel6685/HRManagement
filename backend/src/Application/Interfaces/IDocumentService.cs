using HRManagement.Application.DTOs.Document;

namespace HRManagement.Application.Interfaces;

public interface IDocumentService
{
    Task<DocumentDto> UploadDocumentAsync(Guid employeeId, FileUploadDto file, string docType, Guid uploadedById);
    Task<IEnumerable<DocumentDto>> GetAllDocumentsAsync();
    Task<IEnumerable<DocumentDto>> GetEmployeeDocumentsAsync(Guid employeeId);
    Task<(Stream stream, string fileName, string contentType)> DownloadDocumentAsync(Guid id);
    Task DeleteDocumentAsync(Guid id);
}
