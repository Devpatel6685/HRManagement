using HRManagement.Application.DTOs.Asset;

namespace HRManagement.Application.Interfaces;

public interface IAssetService
{
    Task<IReadOnlyList<AssetDto>> GetAllAssetsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AssetDto>> GetAvailableAssetsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AssetDto>> GetEmployeeAssetsAsync(Guid employeeId, CancellationToken ct = default);
    Task<AssetDto> CreateAssetAsync(CreateAssetDto dto, CancellationToken ct = default);
    Task<AssetDto> UpdateAssetAsync(Guid id, UpdateAssetDto dto, CancellationToken ct = default);
    Task DeleteAssetAsync(Guid id, CancellationToken ct = default);
    Task<AssetDto> AssignAssetAsync(Guid assetId, Guid employeeId, CancellationToken ct = default);
    Task<AssetDto> ReturnAssetAsync(Guid assetId, CancellationToken ct = default);
    Task<AssetDto> ChangeStatusAsync(Guid assetId, string status, CancellationToken ct = default);
}
