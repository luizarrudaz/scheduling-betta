using SchedulingBetta.API.Application.DTOs.Auth;
using System.DirectoryServices.AccountManagement;
using System.Security.Authentication;
using System.Text.RegularExpressions;
using DirectoryEntry = System.DirectoryServices.DirectoryEntry;

#pragma warning disable CA1416

public class LdapAuthService
{
    private readonly string _server;
    private readonly string _domainDn;
    private readonly int _port;
    private readonly bool _useSsl;
    private readonly PrincipalContext _context;
    private readonly ILogger<LdapAuthService> _logger;

    public LdapAuthService(IConfiguration config, ILogger<LdapAuthService> logger)
    {
        _logger = logger;

        _server = config["LDAP_SERVER"] ?? throw new ArgumentNullException(nameof(config), "LDAP_SERVER é obrigatório");
        _domainDn = config["LDAP_DOMAIN_DN"] ?? throw new ArgumentNullException(nameof(config), "LDAP_DOMAIN_DN é obrigatório");

        if (!int.TryParse(config["LDAP_PORT"], out _port))
            _port = 389;
        _logger.LogWarning("Invalid or missing LDAP_PORT. Using default port: 389");

        if (!bool.TryParse(config["LDAP_USE_SSL"], out _useSsl))
            _useSsl = false;
        _logger.LogWarning("Invalid or missing LDAP_USE_SSL. Using default: false");

        _context = new PrincipalContext(
            ContextType.Domain,
            _server,
            _domainDn,
            _useSsl ? ContextOptions.SecureSocketLayer : ContextOptions.Negotiate
        );

        _logger.LogInformation("LdapAuthService initialized with server: {Server}, domain: {Domain}, port: {Port}, SSL: {SSL}",
            _server, _domainDn, _port, _useSsl);
    }

    public bool AuthenticateUser(string username, string password)
    {
        _logger.LogInformation("Attempting to authenticate user: {Username}", username);

        try
        {
            var contextOptions = _useSsl
                ? ContextOptions.SecureSocketLayer | ContextOptions.Negotiate
                : ContextOptions.Negotiate;

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
            throw new AuthenticationException("Falha na autenticação LDAP", ex);
        }
    }

    public List<string> GetUserGroups(string username)
    {
        _logger.LogInformation("Retrieving groups for user: {Username}", username);

        try
        {
            using var userContext = new PrincipalContext(
                ContextType.Domain,
                _server,
                _domainDn
            );

            var user = UserPrincipal.FindByIdentity(userContext, IdentityType.SamAccountName, username);

            var groups = user?.GetAuthorizationGroups()
                .OfType<GroupPrincipal>()
                .Select(g => g.Name)
                .ToList() ?? [];

            _logger.LogInformation("User: {Username} belongs to {GroupCount} groups", username, groups.Count);

            return groups;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving groups for user: {Username}", username);
            throw new AuthenticationException("Falha ao buscar grupos", ex);
        }
    }

    public LdapUserInfoDto GetUserInfo(string username)
    {
        _logger.LogInformation("Retrieving user info for: {Username}", username);

        try
        {
            var user = UserPrincipal.FindByIdentity(_context, IdentityType.SamAccountName, username);

            if (user == null)
            {
                _logger.LogWarning("User: {Username} not found in directory", username);
                throw new AuthenticationException("Usuário não encontrado no diretório");
            }

            if (user.IsAccountLockedOut()) 
            {
                _logger.LogWarning("Account is locked for user: {Username}", username);
                throw new AuthenticationException("Conta bloqueada"); 
            }

            if (user.Enabled.HasValue && !user.Enabled.Value) 
            {
                _logger.LogWarning("Account is disabled for user: {Username}", username);
                throw new AuthenticationException("Conta desabilitada"); 
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
            throw new AuthenticationException("Falha ao buscar informações do usuário", ex);

        }
    }
}