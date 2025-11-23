namespace Bibently.Tests.Shared;

using Bibently.Api;
using Microsoft.AspNetCore.Mvc.Testing;

public sealed class TestWebApplicationFactory : WebApplicationFactory<IApiMarker>
{
    private TestWebApplicationFactory()
    { }

    public static TestWebApplicationFactory Create() => new();
}
