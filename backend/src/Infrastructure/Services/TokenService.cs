using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HRManagement.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(User user)
    {
        var jwt = _configuration.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
            new Claim("uid",  user.Id.ToString()),
            new Claim("role", user.Role.Name),
            new Claim("name", user.Employee != null
                ? $"{user.Employee.FirstName} {user.Employee.LastName}"
                : user.Email.Split('@')[0]),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.Role,           user.Role.Name),
        };

        var expiryMinutes = double.Parse(jwt["ExpiryMinutes"] ?? "60");

        var token = new JwtSecurityToken(
            issuer:             jwt["Issuer"],
            audience:           jwt["Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public string GeneratePasswordResetToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
}
