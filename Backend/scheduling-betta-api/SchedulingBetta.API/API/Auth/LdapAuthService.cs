using SchedulingBetta.API.Application.DTOs.Auth;
using System.DirectoryServices.AccountManagement;
using System.Security.Authentication;
using DirectoryEntry = System.DirectoryServices.DirectoryEntry;

#pragma warning disable CA1416

public class LdapAuthService : ILdapAuthService
{
    private readonly string _server;
    private readonly string _domainDn;
    private readonly int _port;
    private readonly bool _useSsl;
    private readonly ILogger<LdapAuthService> _logger;

    public LdapAuthService(ILogger<LdapAuthService> logger)
    {
        _logger = logger;

        _server = Environment.GetEnvironmentVariable("LDAP_SERVER")
                  ?? throw new InvalidOperationException("LDAP_SERVER is not configured");

        _domainDn = Environment.GetEnvironmentVariable("LDAP_DOMAIN_DN")
                    ?? throw new InvalidOperationException("LDAP_DOMAIN_DN is not configured");

        if (!int.TryParse(Environment.GetEnvironmentVariable("LDAP_PORT"), out _port))
        {
            _port = 389;
            _logger.LogWarning("LDAP_PORT is invalid or missing. Using default port: 389");
        }

        if (!bool.TryParse(Environment.GetEnvironmentVariable("LDAP_USE_SSL"), out _useSsl))
        {
            _useSsl = false;
            _logger.LogWarning("LDAP_USE_SSL is invalid or missing. Using default: false");
        }

        _logger.LogInformation("LdapAuthService initialized with server: {Server}, domain: {Domain}, port: {Port}, SSL: {SSL}",
            _server, _domainDn, _port, _useSsl);
    }

    public bool AuthenticateUser(string username, string password)
    {
        _logger.LogInformation("Attempting to authenticate user: {Username}", username);

        try
        {
            using var userContext = new PrincipalContext(
                ContextType.Domain,
                _server,
                _domainDn,
                _useSsl ? ContextOptions.SecureSocketLayer : ContextOptions.Negotiate,
                username,
                password
            );

            bool isValid = userContext.ValidateCredentials(username, password);

            _logger.LogInformation("Authentication {Status} for user: {Username}", isValid ? "succeeded" : "failed", username);

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authenticating user: {Username}", username);
            throw new AuthenticationException("LDAP authentication failure", ex);
        }
    }

    public List<string> GetUserGroups(string username)
    {
        _logger.LogInformation("Retrieving groups for user: {Username}", username);

        try
        {
            using var userContext = new PrincipalContext(ContextType.Domain, _server, _domainDn);

            var user = UserPrincipal.FindByIdentity(userContext, IdentityType.SamAccountName, username);

            var groups = user?.GetAuthorizationGroups()
                .OfType<GroupPrincipal>()
                .Select(g => g.Name)
                .ToList() ?? new List<string>();

            _logger.LogInformation("User: {Username} belongs to {GroupCount} groups", username, groups.Count);

            return groups;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving groups for user: {Username}", username);
            throw new AuthenticationException("Failed to retrieve groups", ex);
        }
    }

    public LdapUserInfoDto GetUserInfo(string username)
    {
        _logger.LogInformation("Retrieving user info for: {Username}", username);

        try
        {
            using var context = new PrincipalContext(ContextType.Domain, _server, _domainDn);

            var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, username);

            if (user == null)
            {
                _logger.LogWarning("User: {Username} not found in directory", username);
                throw new AuthenticationException("User not found in directory");
            }

            if (user.IsAccountLockedOut())
            {
                _logger.LogWarning("Account is locked for user: {Username}", username);
                throw new AuthenticationException("Account is locked");
            }

            if (user.Enabled.HasValue && !user.Enabled.Value)
            {
                _logger.LogWarning("Account is disabled for user: {Username}", username);
                throw new AuthenticationException("Account is disabled");
            }

            string email = user.EmailAddress;
            var directoryEntry = user.GetUnderlyingObject() as DirectoryEntry;

            if (directoryEntry != null && directoryEntry.Properties["mail"]?.Value != null)
            {
                email = directoryEntry.Properties["mail"].Value.ToString();
            }

            var userInfo = new LdapUserInfoDto
            {
                Sid = user.Sid.ToString(),
                Username = user.SamAccountName,
                DisplayName = user.DisplayName,
                Email = email,
                Groups = GetUserGroups(username)
            };

            _logger.LogInformation("User info for {Username} retrieved successfully", username);

            return userInfo;
        }
        catch (AuthenticationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user info for: {Username}", username);
            throw new AuthenticationException("Failed to retrieve user information", ex);
        }
    }
}