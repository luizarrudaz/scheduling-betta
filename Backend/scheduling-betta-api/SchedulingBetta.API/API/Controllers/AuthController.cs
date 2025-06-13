using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Application.DTOs.Auth;
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
                return BadRequest(new { Message = "Usuário e senha são obrigatórios." });
            }

            if (!_ldapAuth.AuthenticateUser(request.Username, request.Password))
            {
                return Unauthorized(new { Message = "Credenciais inválidas" });
            }

            var userInfo = _ldapAuth.GetUserInfo(request.Username);
            var token = _jwtService.GenerateToken(userInfo, userInfo.Groups);

            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro durante o login para o usuário {Username}", request.Username);
            return StatusCode(500, new { Message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("check-auth")]
    public IActionResult CheckAuth()
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;

        if (identity == null || !identity.IsAuthenticated)
        {
            return Unauthorized(new { Message = "Usuário não autenticado." });
        }

        try
        {
            var username = identity.Name;
            var sid = identity.Claims.FirstOrDefault(c => c.Type == "user_sid")?.Value;
            var groups = identity.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(sid))
            {
                _logger.LogError("O token para o usuário autenticado não contém as claims obrigatórias (Name ou user_sid).");
                return StatusCode(500, new { Message = "Token de autenticação inválido ou incompleto." });
            }

            return Ok(new
            {
                Authenticated = true,
                Username = username,
                Groups = groups,
                Sid = sid
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar as claims do token para o usuário {Username}", identity.Name);
            return StatusCode(500, new { Message = "Erro ao processar informações de autenticação." });
        }
    }
}