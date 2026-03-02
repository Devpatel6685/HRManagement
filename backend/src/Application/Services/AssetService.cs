using HRManagement.Application.DTOs.Asset;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class AssetService : IAssetService
{
    private readonly IApplicationDbContext _context;

    public AssetService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AssetDto>> GetAllAssetsAsync(CancellationToken ct = default)
    {
        return await _context.Assets
            .Include(a => a.AssignedToEmployee)
            .OrderBy(a => a.AssetName)
            .Select(a => ToDto(a))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AssetDto>> GetAvailableAssetsAsync(CancellationToken ct = default)
    {
        return await _context.Assets
            .Where(a => a.Status == AssetStatus.Available)
            .OrderBy(a => a.AssetName)
            .Select(a => ToDto(a))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AssetDto>> GetEmployeeAssetsAsync(Guid employeeId, CancellationToken ct = default)
    {
        return await _context.Assets
            .Include(a => a.AssignedToEmployee)
            .Where(a => a.AssignedToEmployeeId == employeeId)
            .OrderByDescending(a => a.AssignedDate)
            .Select(a => ToDto(a))
            .ToListAsync(ct);
    }

    public async Task<AssetDto> CreateAssetAsync(CreateAssetDto dto, CancellationToken ct = default)
    {
        var exists = await _context.Assets
            .AnyAsync(a => a.AssetCode == dto.AssetCode, ct);
        if (exists)
            throw new InvalidOperationException($"Asset code '{dto.AssetCode}' is already in use.");

        var asset = new Asset
        {
            AssetName = dto.AssetName,
            AssetCode = dto.AssetCode,
            Category  = dto.Category,
            Status    = AssetStatus.Available,
        };

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync(ct);
        return ToDto(asset);
    }

    public async Task<AssetDto> UpdateAssetAsync(Guid id, UpdateAssetDto dto, CancellationToken ct = default)
    {
        var asset = await _context.Assets
            .Include(a => a.AssignedToEmployee)
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new KeyNotFoundException($"Asset '{id}' not found.");

        asset.AssetName = dto.AssetName;
        asset.Category  = dto.Category;

        await _context.SaveChangesAsync(ct);
        return ToDto(asset);
    }

    public async Task DeleteAssetAsync(Guid id, CancellationToken ct = default)
    {
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new KeyNotFoundException($"Asset '{id}' not found.");

        if (asset.Status == AssetStatus.Assigned)
            throw new InvalidOperationException("Cannot delete an asset that is currently assigned to an employee.");

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<AssetDto> AssignAssetAsync(Guid assetId, Guid employeeId, CancellationToken ct = default)
    {
        var asset = await _context.Assets
            .Include(a => a.AssignedToEmployee)
            .FirstOrDefaultAsync(a => a.Id == assetId, ct)
            ?? throw new KeyNotFoundException($"Asset '{assetId}' not found.");

        if (asset.Status == AssetStatus.Assigned)
            throw new InvalidOperationException("Asset is already assigned to an employee.");

        if (asset.Status != AssetStatus.Available)
            throw new InvalidOperationException($"Asset is not available for assignment (current status: {asset.Status}).");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId, ct)
            ?? throw new KeyNotFoundException($"Employee '{employeeId}' not found.");

        asset.AssignedToEmployeeId = employeeId;
        asset.AssignedDate         = DateTime.UtcNow;
        asset.ReturnDate           = null;
        asset.Status               = AssetStatus.Assigned;

        await _context.SaveChangesAsync(ct);

        asset.AssignedToEmployee = employee;
        return ToDto(asset);
    }

    public async Task<AssetDto> ReturnAssetAsync(Guid assetId, CancellationToken ct = default)
    {
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a => a.Id == assetId, ct)
            ?? throw new KeyNotFoundException($"Asset '{assetId}' not found.");

        if (asset.Status != AssetStatus.Assigned)
            throw new InvalidOperationException("Asset is not currently assigned.");

        asset.Status               = AssetStatus.Available;
        asset.ReturnDate           = DateTime.UtcNow;
        asset.AssignedToEmployeeId = null;
        asset.AssignedDate         = null;

        await _context.SaveChangesAsync(ct);
        return ToDto(asset);
    }

    public async Task<AssetDto> ChangeStatusAsync(Guid assetId, string status, CancellationToken ct = default)
    {
        var asset = await _context.Assets
            .Include(a => a.AssignedToEmployee)
            .FirstOrDefaultAsync(a => a.Id == assetId, ct)
            ?? throw new KeyNotFoundException($"Asset '{assetId}' not found.");

        if (asset.Status == AssetStatus.Assigned)
            throw new InvalidOperationException("Cannot change status of an assigned asset. Return it first.");

        if (!Enum.TryParse<AssetStatus>(status, out var newStatus))
            throw new ArgumentException($"Invalid status '{status}'.");

        if (newStatus == AssetStatus.Assigned)
            throw new ArgumentException("Use the assign endpoint to assign an asset to an employee.");

        asset.Status = newStatus;
        await _context.SaveChangesAsync(ct);
        return ToDto(asset);
    }

    private static AssetDto ToDto(Asset a) => new()
    {
        Id                     = a.Id,
        AssetName              = a.AssetName,
        AssetCode              = a.AssetCode,
        Category               = a.Category,
        Status                 = a.Status.ToString(),
        AssignedToEmployeeId   = a.AssignedToEmployeeId,
        AssignedToEmployeeName = a.AssignedToEmployee is null
                                     ? null
                                     : $"{a.AssignedToEmployee.FirstName} {a.AssignedToEmployee.LastName}",
        AssignedDate           = a.AssignedDate,
        ReturnDate             = a.ReturnDate,
    };
}
