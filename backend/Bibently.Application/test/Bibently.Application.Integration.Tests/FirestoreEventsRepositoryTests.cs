// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="FirestoreEventsRepositoryTests.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Integration.Tests;

using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Repository;
using Bibently.Application.Repository.Models;
using Bibently.Application.Integration.Tests.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class FirestoreEventsRepositoryTests(BibentlyWebApplicationFactory factory, FirebaseEmulatorsContainerFixture fixture)
    : IClassFixture<BibentlyWebApplicationFactory>,
    IClassFixture<FirebaseEmulatorsContainerFixture>
{
    private readonly IEventsRepository _repository = factory.Services.GetRequiredService<IEventsRepository>();

    [Fact]
    public async Task GivenValidDocument_WhenInsertEvent_ThenDocumentIsSaved()
    {
        // Arrange
        var id = Guid.NewGuid();
        var document = CreateEventDocument(id, "Warsaw", "Repository Test Event");

        // Act
        await _repository.InsertEvent(document, TestContext.Current.CancellationToken);

        // Assert
        var result = await _repository.GetEventById(id, TestContext.Current.CancellationToken);
        result.Should().NotBeNull();
        result!.Id.Should().Be(id.ToString());
        result.Name.Should().Be("Repository Test Event");
    }

    [Fact]
    public async Task GivenMultipleDocuments_WhenInsertEvents_ThenAllDocumentsAreSaved()
    {
        // Arrange
        var id1 = Guid.NewGuid();
        var id2 = Guid.NewGuid();
        var documents = new List<EventDocument>
        {
            CreateEventDocument(id1, "Warsaw", "Bulk Event 1"),
            CreateEventDocument(id2, "Krakow", "Bulk Event 2")
        };

        // Act
        await _repository.InsertEvents(documents, TestContext.Current.CancellationToken);

        // Assert
        var result1 = await _repository.GetEventById(id1, TestContext.Current.CancellationToken);
        var result2 = await _repository.GetEventById(id2, TestContext.Current.CancellationToken);

        result1.Should().NotBeNull();
        result2.Should().NotBeNull();
    }

    [Fact]
    public async Task GivenComplexFiltersAndOrdering_WhenGetEvents_ThenReturnsCorrectResults()
    {
        // Arrange - Seed Data
        var uniqueRunId = Guid.NewGuid().ToString("N");
        var events = new List<EventDocument>();

        // City Warsaw, Price 100, Type Music, Date +2d, Keywords: Rock
        events.Add(CreateEventDocument(Guid.NewGuid(), "Warsaw", uniqueRunId + "_Concert_A", 100, "MusicEvent", DateTime.UtcNow.AddDays(2), ["Rock"]));
        // City Warsaw, Price 200, Type Music, Date +3d, Keywords: Jazz
        events.Add(CreateEventDocument(Guid.NewGuid(), "Warsaw", uniqueRunId + "_Concert_B", 200, "MusicEvent", DateTime.UtcNow.AddDays(3), ["Jazz"]));
        // City Krakow, Price 100, Type Theater, Date +1d, Keywords: Drama
        events.Add(CreateEventDocument(Guid.NewGuid(), "Krakow", uniqueRunId + "_Play_A", 100, "TheaterEvent", DateTime.UtcNow.AddDays(1), ["Drama"]));
        // City London, Price 500, Type Music, Date +5d, Keywords: Rock, Pop
        events.Add(CreateEventDocument(Guid.NewGuid(), "London", uniqueRunId + "_Festival_A", 500, "MusicEvent", DateTime.UtcNow.AddDays(5), ["Rock", "Pop"]));
        // City Warsaw, Price 50, Type Music, Date +10d, Keywords: Rock
        events.Add(CreateEventDocument(Guid.NewGuid(), "Warsaw", uniqueRunId + "_Gig_A", 50, "MusicEvent", DateTime.UtcNow.AddDays(10), ["Rock"]));

        await _repository.InsertEvents(events, TestContext.Current.CancellationToken);

        // Test Case 1: Filter by City
        var search1 = new SearchRequest { Filters = new FilterRequest { City = "Warsaw", Name = uniqueRunId } };
        var (items1, _) = await _repository.GetEvents(search1, TestContext.Current.CancellationToken);
        items1.Should().HaveCount(3);
        items1.Should().AllSatisfy(x => x.Location.Address.City.Should().Be("Warsaw"));

        // Test Case 2: Filter by Price Range
        var search2 = new SearchRequest { Filters = new FilterRequest { MinPrice = 150, MaxPrice = 550, Name = uniqueRunId } };
        var (items2, _) = await _repository.GetEvents(search2, TestContext.Current.CancellationToken);
        items2.Should().HaveCount(2); // Concert B (200), Festival A (500)
        items2.Should().Contain(x => x.Name.Contains("Concert_B"));
        items2.Should().Contain(x => x.Name.Contains("Festival_A"));

        // Test Case 3: Filter by Keyword
        var search3 = new SearchRequest { Filters = new FilterRequest { Keywords = ["Jazz"], Name = uniqueRunId } };
        var (items3, _) = await _repository.GetEvents(search3, TestContext.Current.CancellationToken);
        items3.Should().HaveCount(1);
        items3.First().Name.Should().Contain("Concert_B");

        // Test Case 4: Combined Filter (City + Type)
        var search4 = new SearchRequest { Filters = new FilterRequest { City = "Warsaw", Type = "MusicEvent", Name = uniqueRunId } };
        var (items4, _) = await _repository.GetEvents(search4, TestContext.Current.CancellationToken);
        items4.Should().HaveCount(3);

        // Test Case 5: Sorting by Price Descending
        var search5 = new SearchRequest
        {
            Filters = new FilterRequest { Name = uniqueRunId },
            Sorting = new SortRequest { SortKey = EventSortableAccessor.Price, Order = SortDirection.Descending }
        };
        var (items5, _) = await _repository.GetEvents(search5, TestContext.Current.CancellationToken);
        items5.Should().HaveCount(5);
        items5[0].Offer.Price.Should().Be(500);
        items5[1].Offer.Price.Should().Be(200);
        items5[4].Offer.Price.Should().Be(50);

        // Test Case 6: Date Range (All starting within next 4 days)
        var search6 = new SearchRequest
        {
            Filters = new FilterRequest { EndDate = DateTime.UtcNow.AddDays(4), Name = uniqueRunId },
            Sorting = new SortRequest { SortKey = EventSortableAccessor.StartDate, Order = SortDirection.Ascending }
        };
        var (items6, _) = await _repository.GetEvents(search6, TestContext.Current.CancellationToken);
        items6.Should().HaveCount(3); // Play_A (+1d), Concert_A (+2d), Concert_B (+3d)
    }

    [Fact]
    public async Task GivenManyItems_WhenPaginating_ThenReturnsExpectedPages()
    {
        // Arrange
        var uniqueRunId = "Pagination_" + Guid.NewGuid().ToString("N");
        var events = new List<EventDocument>();
        for (int i = 0; i < 14; i++) // 14 items: 5 + 5 + 4
        {
            // Name format: Pagination_runid_00, Pagination_runid_01... to test stable sorting by name
            events.Add(CreateEventDocument(Guid.NewGuid(), "Warsaw", $"{uniqueRunId}_{i:D2}", 10 + i));
        }
        await _repository.InsertEvents(events, TestContext.Current.CancellationToken);

        // Page 1 (PageSize = 5)
        var searchP1 = new SearchRequest
        {
            Filters = new FilterRequest { Name = uniqueRunId },
            Sorting = new SortRequest { SortKey = EventSortableAccessor.Name, Order = SortDirection.Ascending, PageSize = 5 }
        };
        var (itemsP1, tokenP1) = await _repository.GetEvents(searchP1, TestContext.Current.CancellationToken);

        itemsP1.Should().HaveCount(5);
        itemsP1[0].Name.Should().Contain("_00");
        itemsP1[4].Name.Should().Contain("_04");
        tokenP1.Should().NotBeNullOrEmpty();

        // Page 2
        var searchP2 = new SearchRequest
        {
            Filters = new FilterRequest { Name = uniqueRunId },
            Sorting = new SortRequest { SortKey = EventSortableAccessor.Name, Order = SortDirection.Ascending, PageSize = 5, PageToken = tokenP1 }
        };
        var (itemsP2, tokenP2) = await _repository.GetEvents(searchP2, TestContext.Current.CancellationToken);

        itemsP2.Should().HaveCount(5);
        itemsP2[0].Name.Should().Contain("_05");
        itemsP2[4].Name.Should().Contain("_09");
        tokenP2.Should().NotBeNullOrEmpty();
        tokenP2.Should().NotBe(tokenP1);

        // Page 3
        var searchP3 = new SearchRequest
        {
            Filters = new FilterRequest { Name = uniqueRunId },
            Sorting = new SortRequest { SortKey = EventSortableAccessor.Name, Order = SortDirection.Ascending, PageSize = 5, PageToken = tokenP2 }
        };
        var (itemsP3, tokenP3) = await _repository.GetEvents(searchP3, TestContext.Current.CancellationToken);

        itemsP3.Should().HaveCount(4);
        itemsP3[0].Name.Should().Contain("_10");
        itemsP3[3].Name.Should().Contain("_13");
        tokenP3.Should().BeNull(); // No more items because items.Count < PageSize
    }

    private static EventDocument CreateEventDocument(Guid id, string city, string name, double price = 100, string type = "MusicEvent", DateTime? startDate = null, string[]? keywords = null)
    {
        var address = new AddressDocument
        {
            Type = "PostalAddress",
            Name = "Test Address",
            Street = "Test Street 1",
            City = city,
            Country = "PL",
            PostalCode = "00-001",
            Latitude = 52.2297,
            Longitude = 21.0122
        };

        return new EventDocument
        {
            Id = id.ToString(),
            Type = type,
            Name = name,
            Description = "A test concert description",
            StartDate = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(1),
            DatePublished = DateTime.UtcNow,
            Url = "https://example.com/events/1",
            EventStatus = "EventScheduled",
            AttendanceMode = "OfflineEventAttendanceMode",
            Keywords = keywords?.ToList() ?? [],
            Provider = "TestProvider",
            CreatedAt = DateTime.UtcNow,
            Location = new LocationDocument
            {
                Type = "Place",
                Name = "Test Venue",
                Address = address
            },
            Performer = new OrganizationDocument
            {
                Type = "MusicGroup",
                Name = "Test Band",
                Url = "https://example.com/testband",
                Address = address
            },
            Offer = new OfferDocument
            {
                Type = "Offer",
                Price = price,
                Currency = "PLN",
                Url = "https://example.com/tickets/1",
                IsAvailable = true
            }
        };
    }
}
