// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="FirestoreTrackingRepositoryTests.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Integration.Tests;

using Bibently.Application.Repository;
using Bibently.Application.Repository.Models;
using Bibently.Application.Integration.Tests.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class FirestoreTrackingRepositoryTests(BibentlyWebApplicationFactory factory)
    : IClassFixture<BibentlyWebApplicationFactory>,
    IClassFixture<FirebaseEmulatorsContainerFixture>
{
    private readonly ITrackingRepository _repository = factory.Services.GetRequiredService<ITrackingRepository>();

    [Fact]
    public async Task GivenValidTrackingEvent_WhenInsertTrackingEvent_ThenDocumentIsSaved()
    {
        // Arrange
        var id = Guid.NewGuid();
        var document = new TrackingEventDocument
        {
            Id = id.ToString(),
            Action = "Test Action",
            UserId = "test-user",
            Payload = "{\"key\": \"value\"}",
            UserAgent = "TestAgent",
            CreatedAt = DateTime.UtcNow
        };

        // Act
        await _repository.InsertTrackingEvent(document, TestContext.Current.CancellationToken);

        // Assert
        var result = await _repository.GetTrackingEventById(id, TestContext.Current.CancellationToken);
        result.Should().NotBeNull();
        result!.Id.Should().Be(id.ToString());
        result.Action.Should().Be("Test Action");
        result.UserId.Should().Be("test-user");
        result.Payload.Should().Be("{\"key\": \"value\"}");
        result.UserAgent.Should().Be("TestAgent");
    }

    [Fact]
    public async Task GivenExistingTrackingEvent_WhenDeleteTrackingEventById_ThenDocumentIsRemoved()
    {
        // Arrange
        var id = Guid.NewGuid();
        var document = new TrackingEventDocument
        {
            Id = id.ToString(),
            Action = "Delete Test",
            UserId = "delete-user",
            CreatedAt = DateTime.UtcNow
        };
        await _repository.InsertTrackingEvent(document, TestContext.Current.CancellationToken);

        // Act
        await _repository.DeleteTrackingEventById(id, TestContext.Current.CancellationToken);

        // Assert
        var result = await _repository.GetTrackingEventById(id, TestContext.Current.CancellationToken);
        result.Should().BeNull();
    }

    [Fact]
    public async Task GivenNonExistentId_WhenGetTrackingEventById_ThenReturnsNull()
    {
        // Arrange
        var id = Guid.AllBitsSet;

        // Act
        var result = await _repository.GetTrackingEventById(id, TestContext.Current.CancellationToken);

        // Assert
        result.Should().BeNull();
    }
}
