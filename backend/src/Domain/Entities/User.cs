using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public bool IsActive { get; set; } = true;
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    public Role Role { get; set; } = null!;
    public Employee? Employee { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
