using HRManagement.Application.DTOs.Auth;

namespace HRManagement.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<LoginResponseDto> RefreshTokenAsync(string refreshToken);
    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(string token, string newPassword);
    Task<UserProfileDto> GetProfileAsync(Guid userId);
    Task LogoutAsync(Guid userId);
    Task RegisterAsync(RegisterDto dto);
}
