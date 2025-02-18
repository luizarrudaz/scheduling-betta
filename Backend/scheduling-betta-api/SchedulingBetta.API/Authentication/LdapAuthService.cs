using DotNetEnv;
using System.DirectoryServices.AccountManagement;

namespace SchedulingBetta.API.Authentication;

public class LdapAuthService
{
    private readonly string _domain;

    public LdapAuthService()
    {
        Env.Load();

        _domain = Environment.GetEnvironmentVariable("DOMAIN") ??
            throw new ArgumentNullException(nameof(_domain));

    }

    public bool AuthenticateUser(string username, string password)
    {
        using (var context = new PrincipalContext(ContextType.Domain, _domain))
        {
            try
            {
                bool isValid = context.ValidateCredentials(username, password);
                return isValid;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}"); // log
                return false;
            }
        }

    }

    public List<string> GetUserGroups(string username)
    {
        List<string> groups = new List<string>();
        using (var context = new PrincipalContext(ContextType.Domain, _domain))
        using (var user = UserPrincipal.FindByIdentity(context, username))
        {
            if (user != null)
            {
                var groupPrincipal = user.GetGroups();
                foreach (var group in groupPrincipal)
                {
                    groups.Add(group.Name);
                }
            }
        }
        return groups;
    }
}
