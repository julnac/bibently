namespace Bibently.Application.Api.Endpoints;

public static class UtilityEndpoints
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/robots.txt", () =>
            Results.Text(
                """
                User-agent: *
                Disallow: /
                """,
                contentType: "text/plain"
            )
        ).AllowAnonymous().ExcludeFromDescription();
    }
}
