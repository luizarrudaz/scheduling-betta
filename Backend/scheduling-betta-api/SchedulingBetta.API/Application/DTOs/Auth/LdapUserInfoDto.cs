namespace SchedulingBetta.API.Application.DTOs.Auth;

public class LdapUserInfoDto
{
    public string? Sid { get; set; }
    public string? Username { get; set; }
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public List<string>? Groups { get; set; }
}