namespace Bibently.Application.Integration.Tests;

using Bibently.Application.Api;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

public class BibentlyWebApplicationFactory : WebApplicationFactory<IApiMarker>
{
    public BibentlyWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("GOOGLE_CLOUD_PROJECT", "demo-no-project");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            // Here you can override services like database, auth, etc.
            // For now, we'll let it use the default configuration or mock as needed.
        });
    }
}
