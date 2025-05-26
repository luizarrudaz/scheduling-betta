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

    public JwtService(IConfiguration config, ILogger<JwtService> logger)
    {
        _logger = logger;

        _logger.LogInformation("Initializing JWT Service...");

        var secret = config["JWT_SECRET"] ?? throw new ArgumentNullException("JWT_SECRET");
        _issuer = config["JWT_ISSUER"] ?? throw new ArgumentNullException("JWT_ISSUER");
        _audience = config["JWT_AUDIENCE"] ?? throw new ArgumentNullException("JWT_AUDIENCE");
        _expireHours = double.Parse(config["JWT_EXPIRE_HOURS"] ?? "10");

        if (secret.Length < 32)
        {
            _logger.LogError("JWT_SECRET must have at least 32 characters");
            throw new ArgumentException("JWT_SECRET deve ter pelo menos 32 caracteres");
        }

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        _logger.LogInformation("JwtService initialized successfully with issuer: {Issuer}, audience: {Audience}, expiration: {ExpireHours}h",
            _issuer, _audience, _expireHours); 
    }

    public string GenerateToken(LdapUserInfoDto user, IEnumerable<string> groups)
    {
        _logger.LogInformation("Generating JWT token for user: {Username}, SID: {Sid}", user.Username, user.Sid);

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

        _logger.LogInformation("Added {GroupCount} group claims for user {Username}", groups.Count(), user.Username);

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_expireHours),
            signingCredentials: creds
        );

        _logger.LogInformation("JWT token generated successfully for user: {Username}", user.Username);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}