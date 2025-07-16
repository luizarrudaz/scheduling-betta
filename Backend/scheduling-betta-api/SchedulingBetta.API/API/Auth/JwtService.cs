using Microsoft.IdentityModel.Tokens;
using SchedulingBetta.API.Application.DTOs.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtService
{
    private readonly SymmetricSecurityKey _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly double _expireHours;
    private readonly ILogger _logger;

    public JwtService(ILogger<JwtService> logger)
    {
        _logger = logger;
        _issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? throw new InvalidOperationException("JWT_ISSUER is not configured");
        _audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? throw new InvalidOperationException("JWT_AUDIENCE is not configured");
        var secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? throw new InvalidOperationException("JWT_SECRET is not configured");
        if (!double.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRE_HOURS"), out _expireHours)) _expireHours = 10;
        if (secret.Length < 32) throw new ArgumentException("JWT_SECRET must be at least 32 characters long");
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    }

    public string GenerateToken(LdapUserInfoDto user, IEnumerable<string> groups)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            
            new Claim("user_sid", user.Sid.ToString())
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