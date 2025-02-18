using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DotNetEnv;

namespace SchedulingBetta.API.Authentication
{
    public class JwtService
    {
        private readonly string _secretKey;
        private readonly string _issuer;

        public JwtService()
        {
            Env.Load();

            _secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? 
                throw new ArgumentNullException(nameof(_secretKey));

            _issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? 
                throw new ArgumentNullException(nameof(_issuer));
        }

        public string GenerateJwtToken(string username, List<string> groups)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
                new Claim("role", groups.Contains("Admins") ? "Admin" : "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _issuer,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(10),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
