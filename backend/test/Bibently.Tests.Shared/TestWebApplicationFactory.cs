using Bibently.Application;

namespace Bibently.Tests.Shared;

using Microsoft.AspNetCore.Mvc.Testing;

public sealed class TestWebApplicationFactory : WebApplicationFactory<IApiMarker>
{
    private TestWebApplicationFactory()
    { }

    public static TestWebApplicationFactory Create() => new();
}