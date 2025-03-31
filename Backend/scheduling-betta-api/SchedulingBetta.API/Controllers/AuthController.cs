using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Authentication;
using System.Security.Authentication;
using System.Text.RegularExpressions;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly LdapAuthService _ldapAuth;
    private readonly JwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        LdapAuthService ldapAuth,
        JwtService jwtService,
        ILogger<AuthController> logger)
    {
        _ldapAuth = ldapAuth;
        _jwtService = jwtService;
        _logger = logger;
    }

    [HttpPost("Login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { Message = "Username and Password are required." });
            }

            if (!_ldapAuth.AuthenticateUser(request.Username, request.Password))
            {
                _logger.LogWarning("Failed login attempt for {Username}", request.Username);
                return Unauthorized(new { Message = "Credenciais inválidas" });
            }

            var userInfo = _ldapAuth.GetUserInfo(request.Username);
            var token = _jwtService.GenerateToken(userInfo, userInfo.Groups);

            _logger.LogInformation("Successful login for {Username}", request.Username);
            return Ok(new { Token = token });
        }
        catch (AuthenticationException ex)
        {
            _logger.LogError(ex, "LDAP Authentication error");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "General authentication error");
            return StatusCode(500, new { Message = "Erro interno no servidor" });
        }
    }
}