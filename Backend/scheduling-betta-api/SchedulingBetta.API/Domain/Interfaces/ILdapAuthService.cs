using SchedulingBetta.API.Application.DTOs.Auth;

public interface ILdapAuthService
{
    bool AuthenticateUser(string username, string password);
    List<string> GetUserGroups(string username);
    LdapUserInfoDto GetUserInfo(string username);
}
