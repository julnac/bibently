namespace Bibently.Application.Api.Clients;

using Bibently.Application.Abstractions.Models;

public interface IPrivateServerClient
{
    Task<EventEntity> CreateEventAsync(CreateEventEntityRequest request, CancellationToken token);
}
