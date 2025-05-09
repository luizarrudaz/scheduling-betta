using Microsoft.IdentityModel.Tokens;
using SchedulingBetta.API.Application.DTOs.Auth;
using System.DirectoryServices.AccountManagement;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtService
{
    private readonly SymmetricSecurityKey _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly double _expireHours;

    public JwtService(IConfiguration config)
    {
        var secret = config["JWT_SECRET"] ?? throw new ArgumentNullException("JWT_SECRET");
        _issuer = config["JWT_ISSUER"] ?? throw new ArgumentNullException("JWT_ISSUER");
        _audience = config["JWT_AUDIENCE"] ?? throw new ArgumentNullException("JWT_AUDIENCE");
        _expireHours = double.Parse(config["JWT_EXPIRE_HOURS"] ?? "10");

        if (secret.Length < 32)
            throw new ArgumentException("JWT_SECRET deve ter pelo menos 32 caracteres");

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    }

    public string GenerateToken(LdapUserInfoDto user, IEnumerable<string> groups)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Sid.ToString()),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(ClaimTypes.WindowsAccountName, user.Username),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
        };

        claims.AddRange(groups.Select(group => new Claim(ClaimTypes.Role, group)));

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_expireHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}