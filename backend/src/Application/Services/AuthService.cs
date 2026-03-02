using HRManagement.Application.DTOs.Auth;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        IApplicationDbContext context,
        ITokenService tokenService,
        IEmailService emailService,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!_passwordHasher.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return await BuildAuthResponseAsync(user);
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string token)
    {
        var stored = await _context.RefreshTokens
            .Include(rt => rt.User).ThenInclude(u => u.Role)
            .Include(rt => rt.User).ThenInclude(u => u.Employee)
            .FirstOrDefaultAsync(rt =>
                rt.Token == token &&
                !rt.IsRevoked &&
                rt.ExpiresAt > DateTime.UtcNow)
            ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        // Rotate — revoke old token before issuing new one
        stored.IsRevoked = true;
        stored.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await BuildAuthResponseAsync(stored.User);
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _context.Users
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

        // Always return silently — never reveal whether the address is registered
        if (user == null) return;

        user.PasswordResetToken = _tokenService.GeneratePasswordResetToken();
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _context.SaveChangesAsync();

        var name = user.Employee != null
            ? $"{user.Employee.FirstName} {user.Employee.LastName}"
            : user.Email.Split('@')[0];

        await _emailService.SendPasswordResetEmailAsync(user.Email, name, user.PasswordResetToken);
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.PasswordResetToken == token &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow)
            ?? throw new InvalidOperationException("Reset token is invalid or has expired.");

        user.PasswordHash = _passwordHasher.Hash(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        await _context.SaveChangesAsync();
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found.");

        return ToProfileDto(user);
    }

    public async Task LogoutAsync(Guid userId)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();

        foreach (var rt in activeTokens)
        {
            rt.IsRevoked = true;
            rt.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("An account with this email already exists.");

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == dto.Role)
            ?? throw new InvalidOperationException($"Role '{dto.Role}' does not exist.");

        var user = new User
        {
            Email        = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            RoleId       = role.Id,
            IsActive     = true,
        };

        _context.Users.Add(user);

        var employee = new Employee
        {
            UserId       = user.Id,
            EmployeeCode = $"EMP{DateTime.UtcNow:yyyyMMddHHmmss}",
            FirstName    = dto.FirstName,
            LastName     = dto.LastName,
            JoinDate     = DateOnly.FromDateTime(DateTime.UtcNow),
            Status       = EmployeeStatus.Active,
        };

        _context.Employees.Add(employee);

        // Seed leave balances for the current year
        var leaveTypes  = await _context.LeaveTypes.ToListAsync();
        var currentYear = DateTime.UtcNow.Year;
        foreach (var lt in leaveTypes)
        {
            _context.LeaveBalances.Add(new LeaveBalance
            {
                EmployeeId  = employee.Id,
                LeaveTypeId = lt.Id,
                Year        = currentYear,
                TotalDays   = lt.MaxDaysPerYear,
                UsedDays    = 0,
            });
        }

        await _context.SaveChangesAsync();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private async Task<LoginResponseDto> BuildAuthResponseAsync(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var rawRefreshToken = _tokenService.GenerateRefreshToken();

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId    = user.Id,
            Token     = rawRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        });

        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken  = accessToken,
            RefreshToken = rawRefreshToken,
            ExpiresAt    = DateTime.UtcNow.AddMinutes(60),
            User         = ToProfileDto(user),
        };
    }

    private static UserProfileDto ToProfileDto(User user) => new()
    {
        Id        = user.Id,
        Email     = user.Email,
        FirstName = user.Employee?.FirstName ?? string.Empty,
        LastName  = user.Employee?.LastName  ?? string.Empty,
        FullName  = user.Employee != null
                        ? $"{user.Employee.FirstName} {user.Employee.LastName}"
                        : user.Email.Split('@')[0],
        Role      = user.Role.Name,
        IsActive  = user.IsActive,
    };
}
