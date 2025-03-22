using System.DirectoryServices.AccountManagement;
using System.Security.Authentication;
#pragma warning disable CA1416

public class LdapAuthService
{
    private readonly string _server;
    private readonly string _domainDn;
    private readonly int _port;
    private readonly bool _useSsl;

    public LdapAuthService(IConfiguration config)
    {
        _server = config["LDAP_SERVER"] ?? throw new ArgumentNullException(nameof(config), "LDAP_SERVER é obrigatório");
        _domainDn = config["LDAP_DOMAIN_DN"] ?? throw new ArgumentNullException(nameof(config), "LDAP_DOMAIN_DN é obrigatório");

        if (!int.TryParse(config["LDAP_PORT"], out _port))
            _port = 389;

        if (!bool.TryParse(config["LDAP_USE_SSL"], out _useSsl))
            _useSsl = false;
    }

    public bool AuthenticateUser(string username, string password)
    {
        try
        {
            var contextOptions = _useSsl
                ? ContextOptions.SecureSocketLayer | ContextOptions.Negotiate
                : ContextOptions.Negotiate;

            using var context = new PrincipalContext(
                ContextType.Domain,
                $"{_server}:{_port}",
                _domainDn,
                contextOptions,
                username,
                password
            );

            return context.ValidateCredentials(username, password);
        }
        catch (Exception ex)
        {
            throw new AuthenticationException("Falha na autenticação LDAP", ex);
        }
    }

    public List<string> GetUserGroups(string username)
    {
        var groups = new List<string>();

        try
        {
            var contextOptions = _useSsl
                ? ContextOptions.SecureSocketLayer | ContextOptions.Negotiate
                : ContextOptions.Negotiate;

            using var context = new PrincipalContext(
                ContextType.Domain,
                $"{_server}:{_port}",
                _domainDn,
                contextOptions
            );

            var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, username);

            if (user != null)
            {
                foreach (var principal in user.GetAuthorizationGroups())
                {
                    if (principal is GroupPrincipal group && !string.IsNullOrEmpty(group.Name))
                        groups.Add(group.Name);
                }
            }

            return groups.Distinct().ToList();
        }
        catch (Exception ex)
        {
            throw new AuthenticationException("Falha ao buscar grupos", ex);
        }
    }
}