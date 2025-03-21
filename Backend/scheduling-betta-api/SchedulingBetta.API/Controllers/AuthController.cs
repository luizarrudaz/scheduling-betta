using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Authentication;
using LoginRequest = SchedulingBetta.API.Authentication.LoginRequest;

namespace SchedulingBetta.API.Controllers;
[Route("[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly LdapAuthService _ldapAuth;
    private readonly JwtService _jwtService;

    public AuthController()
    {
        _ldapAuth = new LdapAuthService();
        _jwtService = new JwtService();
    }

    [HttpPost("Login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            // AD Authentication
            if(!_ldapAuth.AuthenticateUser(request.Username, request.Password))
            {
                return Unauthorized("Invalid Credentials");
            }

            var groups = _ldapAuth.GetUserGroups(request.Username);

            var token = _jwtService.GenerateJwtToken(request.Username, groups);

            return Ok(new { Token = token });
        } 
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal error: {ex.Message}");
        }
    }
}
