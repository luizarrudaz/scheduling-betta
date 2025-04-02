using SchedulingBetta.API.Authentication;
using System.DirectoryServices.AccountManagement;
using System.Security.Authentication;
using DirectoryEntry = System.DirectoryServices.DirectoryEntry;

#pragma warning disable CA1416

public class LdapAuthService
{
    private readonly string _server;
    private readonly string _domainDn;
    private readonly int _port;
    private readonly bool _useSsl;
    private readonly PrincipalContext _context;

    public LdapAuthService(IConfiguration config)
    {
        _server = config["LDAP_SERVER"] ?? throw new ArgumentNullException(nameof(config), "LDAP_SERVER é obrigatório");
        _domainDn = config["LDAP_DOMAIN_DN"] ?? throw new ArgumentNullException(nameof(config), "LDAP_DOMAIN_DN é obrigatório");

        if (!int.TryParse(config["LDAP_PORT"], out _port))
            _port = 389;

        if (!bool.TryParse(config["LDAP_USE_SSL"], out _useSsl))
            _useSsl = false;

        _context = new PrincipalContext(
            ContextType.Domain,
            _server,
            _domainDn,
            _useSsl ? ContextOptions.SecureSocketLayer : ContextOptions.Negotiate
        );
    }

    public bool AuthenticateUser(string username, string password)
    {
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

            return userContext.ValidateCredentials(username, password);
        }
        catch (Exception ex)
        {
            throw new AuthenticationException("Falha na autenticação LDAP", ex);
        }
    }

    public List<string> GetUserGroups(string username)
    {
        try
        {
            using var userContext = new PrincipalContext(
                ContextType.Domain,
                _server,
                _domainDn
            );

            var user = UserPrincipal.FindByIdentity(userContext, IdentityType.SamAccountName, username);

            return user?.GetAuthorizationGroups()
                .OfType<GroupPrincipal>()
                .Select(g => g.Name)
                .ToList() ?? [];
        }
        catch (Exception ex)
        {
            throw new AuthenticationException("Falha ao buscar grupos", ex);
        }
    }

    public LdapUserInfo GetUserInfo(string username)
    {
        var user = UserPrincipal.FindByIdentity(_context, IdentityType.SamAccountName, username);

        if (user == null) { throw new AuthenticationException("Usuário não encontrado no diretório"); }

        if (user.IsAccountLockedOut()) { throw new AuthenticationException("Conta bloqueada"); }

        if (user.Enabled.HasValue && !user.Enabled.Value) { throw new AuthenticationException("Conta desabilitada"); }

        string email = user.EmailAddress;
        var directoryEntry = user.GetUnderlyingObject() as DirectoryEntry;

        if (directoryEntry != null && directoryEntry.Properties["mail"]?.Value != null)
        {
            email = directoryEntry.Properties["mail"].Value.ToString();
        }

        return new LdapUserInfo
        {
            Sid = user.Sid.ToString(),
            Username = user.SamAccountName,
            DisplayName = user.DisplayName,
            Email = email,
            Groups = GetUserGroups(username)
        };
    }
}