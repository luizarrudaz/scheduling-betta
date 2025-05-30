using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Application.DTOs.Auth;
using System.Security.Authentication;
using System.Security.Claims;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly ILdapAuthService _ldapAuth;
    private readonly JwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ILdapAuthService ldapAuth,
        JwtService jwtService,
        ILogger<AuthController> logger)
    {
        _ldapAuth = ldapAuth;
        _jwtService = jwtService;
        _logger = logger;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                _logger.LogWarning("Login attempt with missing credentials");
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
            _logger.LogError(ex,
                "LDAP authentication error for Username: {Username}. ErrorMessage: {ErrorMessage}",
                request?.Username ?? "NULL",
                ex.Message);

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "General authentication error for Username: {Username}. ErrorMessage: {ErrorMessage}",
                request?.Username ?? "NULL",
                ex.Message);

            return StatusCode(500, new { Message = "Erro interno no servidor" });
        }
    }

    [Authorize]
    [HttpGet("check-auth")]
    public IActionResult CheckAuth()
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;

        if (identity == null || !identity.IsAuthenticated)
        {
            _logger.LogWarning("Unauthorized access attempt to CheckAuth endpoint");
            return Unauthorized(new { Message = "Usuário não autenticado" });
        }

        var username = identity.Name;
        var groups = identity.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();

        _logger.LogInformation("Authentication check passed for {Username}", username);

        return Ok(new
        {
            Authenticated = true,
            Username = username,
            Groups = groups
        });
    }
}
