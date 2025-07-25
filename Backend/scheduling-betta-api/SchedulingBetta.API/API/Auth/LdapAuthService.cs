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
        _server = Environment.GetEnvironmentVariable("LDAP_SERVER") ?? throw new InvalidOperationException("LDAP_SERVER is not configured");
        _domainDn = Environment.GetEnvironmentVariable("LDAP_DOMAIN_DN") ?? throw new InvalidOperationException("LDAP_DOMAIN_DN is not configured");
        if (!int.TryParse(Environment.GetEnvironmentVariable("LDAP_PORT"), out _port)) _port = 389;
        if (!bool.TryParse(Environment.GetEnvironmentVariable("LDAP_USE_SSL"), out _useSsl)) _useSsl = false;
    }

    public bool AuthenticateUser(string username, string password)
    {
        try
        {
            using var userContext = new PrincipalContext(ContextType.Domain, _server, _domainDn, _useSsl ? ContextOptions.SecureSocketLayer : ContextOptions.Negotiate, username, password);
            return userContext.ValidateCredentials(username, password);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authenticating user: {Username}", username);
            throw new AuthenticationException("LDAP authentication failure", ex);
        }
    }

    public List<string> GetUserGroups(string username)
    {
        try
        {
            using var userContext = new PrincipalContext(ContextType.Domain, _server, _domainDn);
            var user = UserPrincipal.FindByIdentity(userContext, IdentityType.SamAccountName, username);
            return user?.GetAuthorizationGroups().OfType<GroupPrincipal>().Select(g => g.Name).ToList() ?? new List<string>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving groups for user: {Username}", username);
            throw new AuthenticationException("Failed to retrieve groups", ex);
        }
    }

    public LdapUserInfoDto GetUserInfo(string username)
    {
        _logger.LogInformation("GetUserInfo: Iniciando busca para o usuário: '{Username}'", username);
        try
        {
            _logger.LogInformation("GetUserInfo: Criando PrincipalContext para o servidor: '{Server}', container: '{Container}'", _server, _domainDn);
            using var context = new PrincipalContext(ContextType.Domain, _server, _domainDn);
            _logger.LogInformation("GetUserInfo: PrincipalContext criado. Buscando por SamAccountName...");

            UserPrincipal user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, username);

            if (user == null)
            {
                _logger.LogWarning("GetUserInfo: Usuário '{Username}' não encontrado por SamAccountName. Tentando por UserPrincipalName...", username);
                user = UserPrincipal.FindByIdentity(context, IdentityType.UserPrincipalName, username);
            }

            if (user == null)
            {
                _logger.LogError("GetUserInfo: Usuário '{Username}' não encontrado no diretório após duas tentativas.", username);
                throw new AuthenticationException("User not found in directory");
            }

            _logger.LogInformation("GetUserInfo: Usuário '{Username}' encontrado com sucesso. SID: {SID}", username, user.Sid);

            if (user.IsAccountLockedOut()) throw new AuthenticationException("Account is locked");
            if (user.Enabled.HasValue && !user.Enabled.Value) throw new AuthenticationException("Account is disabled");

            string email = user.EmailAddress;
            if (user.GetUnderlyingObject() is DirectoryEntry directoryEntry && directoryEntry.Properties["mail"]?.Value != null)
            {
                email = directoryEntry.Properties["mail"].Value.ToString();
            }

            return new LdapUserInfoDto
            {
                Sid = user.Sid.ToString(),
                Username = user.SamAccountName,
                DisplayName = user.DisplayName,
                Email = email,
                Groups = GetUserGroups(user.SamAccountName)
            };
        }
        catch (AuthenticationException ex)
        {
            _logger.LogError(ex, "GetUserInfo: Erro de autenticação ao buscar '{Username}'.", username);
            throw;
        }
        catch (PrincipalServerDownException psdex)
        {
            _logger.LogError(psdex, "GetUserInfo: O servidor LDAP está inacessível. Servidor: '{Server}'", _server);
            throw new AuthenticationException("O servidor de autenticação está indisponível.", psdex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetUserInfo: Erro inesperado ao buscar '{Username}'. Exceção interna: {InnerException}", username, ex.InnerException?.Message);
            throw new AuthenticationException("Falha ao buscar informações do usuário devido a um erro inesperado.", ex);
        }
    }

    public LdapUserInfoDto GetUserInfoBySid(string sid)
    {
        try
        {
            using var context = new PrincipalContext(ContextType.Domain, _server, _domainDn);
            UserPrincipal user = UserPrincipal.FindByIdentity(context, IdentityType.Sid, sid);

            if (user == null)
            {
                _logger.LogError("GetUserInfoBySid: Usuário com SID '{SID}' não encontrado.", sid);
                throw new AuthenticationException("User with specified SID not found");
            }
            if (user.IsAccountLockedOut()) throw new AuthenticationException("Account is locked");
            if (user.Enabled.HasValue && !user.Enabled.Value) throw new AuthenticationException("Account is disabled");

            string email = user.EmailAddress;
            if (user.GetUnderlyingObject() is DirectoryEntry directoryEntry && directoryEntry.Properties["mail"]?.Value != null)
            {
                email = directoryEntry.Properties["mail"].Value.ToString();
            }

            return new LdapUserInfoDto
            {
                Sid = user.Sid.ToString(),
                Username = user.SamAccountName,
                DisplayName = user.DisplayName,
                Email = email,
                Groups = GetUserGroups(user.SamAccountName)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetUserInfoBySid: Erro ao buscar usuário pelo SID: {SID}", sid);
            throw new AuthenticationException("Falha ao buscar informações do usuário pelo SID.", ex);
        }
    }
}