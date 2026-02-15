namespace Bibently.Application.Api.Clients;

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Settings;
using Microsoft.Extensions.Options;

public class PrivateServerClient : IPrivateServerClient
{
    private readonly HttpClient _httpClient;

    public PrivateServerClient(HttpClient httpClient, IOptions<PrivateServerSettings> options)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", options.Value.BearerToken);
    }

    public async Task<EventEntity> CreateEventAsync(CreateEventEntityRequest request, CancellationToken token)
    {
        var response = await _httpClient.PostAsJsonAsync("/events", request, AppJsonContext.Default.CreateEventEntityRequest, token);

        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            throw new UnauthorizedAccessException("Private Server authentication failed.");
        }

        response.EnsureSuccessStatusCode();

        var eventEntity = await response.Content.ReadFromJsonAsync(AppJsonContext.Default.EventEntity, token);

        return eventEntity ?? throw new InvalidOperationException(
            "Private Server returned a success status but the response body was empty.");
    }
}
