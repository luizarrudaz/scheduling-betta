using Microsoft.IdentityModel.Tokens;
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
        _expireHours = double.Parse(config["JWT_EXPIRE_HOURS"] ?? "1");

        if (secret.Length < 32)
            throw new ArgumentException("JWT_SECRET must be at least 32 characters");

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    }

    public string GenerateToken(string username, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, username)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

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