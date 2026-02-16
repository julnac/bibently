namespace Bibently.Application.Api.Endpoints;

using Bibently.Application.Abstractions.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

public static class ConfigurationEndpoints
{
    public static void Map(IEndpointRouteBuilder app)
    {
        var configGroup = app.MapGroup("/configuration")
            .AllowAnonymous()
            .WithTags("Configuration");

        configGroup.MapGet("/categories", () => Results.Ok(CategoriesConfiguration.All))
            .WithName("GetCategories")
            .WithSummary("Retrieves the list of predefined event categories.")
            .CacheOutput(policy => policy.Expire(TimeSpan.FromHours(24)).Tag("configuration"));
    }
}
