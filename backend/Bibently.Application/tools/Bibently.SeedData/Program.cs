// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="Program.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

using AutoFixture;
using Google.Api.Gax;
using Google.Cloud.Firestore;

// Configuration
var projectId = Environment.GetEnvironmentVariable("FIRESTORE_PROJECT_ID") ?? "demo-project";
var emulatorHost = Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST") ?? "localhost:8080";

// Set the emulator host environment variable for the Firestore client
Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", emulatorHost);

Console.WriteLine($"🔥 Firestore Seed Tool (AutoFixture)");
Console.WriteLine($"   Project ID: {projectId}");
Console.WriteLine($"   Emulator Host: {emulatorHost}");
Console.WriteLine();

try
{
    var db = new FirestoreDbBuilder
    {
        ProjectId = projectId,
        EmulatorDetection = EmulatorDetection.EmulatorOnly
    }.Build();
    var collection = db.Collection("events");

    Console.WriteLine("🌱 Seeding Firestore with 50 diverse events...");
    Console.WriteLine();

    var generator = new EventGenerator();
    var events = Enumerable.Range(0, 50)
        .Select(i => generator.Generate(i))
        .ToList();

    // Insert in batches of 20
    var batchSize = 20;
    for (int i = 0; i < events.Count; i += batchSize)
    {
        var batch = db.StartBatch();
        var batchEvents = events.Skip(i).Take(batchSize).ToList();

        foreach (var evt in batchEvents)
        {
            var docRef = collection.Document(evt["id"].ToString());
            batch.Set(docRef, evt);
        }

        await batch.CommitAsync();
        Console.WriteLine($"   ✅ Inserted events {i + 1} to {Math.Min(i + batchSize, events.Count)}");
    }

    Console.WriteLine();
    Console.WriteLine($"✨ Successfully seeded {events.Count} events!");
    Console.WriteLine();
    Console.WriteLine("Sample queries to test:");
    Console.WriteLine("  - Filter by city: ?city=Warsaw, ?city=Krakow, ?city=London, ?city=Berlin, ?city=Paris");
    Console.WriteLine("  - Filter by type: ?type=MusicEvent, ?type=TheaterEvent, ?type=SportsEvent");
    Console.WriteLine("  - Filter by price: ?minPrice=50&maxPrice=150");
    Console.WriteLine("  - Filter by keywords: ?keywords=Rock, ?keywords=Jazz, ?keywords=Classical");
    Console.WriteLine("  - Sort by: sortKey=Price, sortKey=StartDate, sortKey=Name");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Console.WriteLine();
    Console.WriteLine("Make sure the Firestore emulator is running:");
    Console.WriteLine("  Local: firebase emulators:start");
    Console.WriteLine("  Docker: docker-compose up");
    Environment.Exit(1);
}

// ─── Event Generator ─────────────────────────────────────────────────────────

public class EventGenerator
{
    private readonly Fixture _fixture;

    private static readonly (string City, string Country, double Lat, double Lng)[] Cities =
    [
        ("Warsaw", "PL", 52.2297, 21.0122),
        ("Krakow", "PL", 50.0647, 19.9450),
        ("London", "GB", 51.5074, -0.1278),
        ("Berlin", "DE", 52.5200, 13.4050),
        ("Paris", "FR", 48.8566, 2.3522),
        ("New York", "US", 40.7128, -74.0060),
        ("Tokyo", "JP", 35.6762, 139.6503),
        ("Amsterdam", "NL", 52.3676, 4.9041),
        ("Prague", "CZ", 50.0755, 14.4378),
        ("Vienna", "AT", 48.2082, 16.3738)
    ];

    private static readonly string[] EventTypes =
        ["MusicEvent", "TheaterEvent", "SportsEvent", "Festival", "ComedyEvent", "DanceEvent", "ExhibitionEvent"];

    private static readonly string[] Venues =
    [
        "National Stadium", "City Arena", "Concert Hall", "Opera House", "Jazz Club",
        "Rock Cafe", "Arts Center", "Sports Complex", "Theater Royal", "Open Air Stage",
        "Underground Club", "Grand Ballroom", "Civic Center", "Memorial Hall", "Amphitheater"
    ];

    private static readonly (string Name, string Type)[] Performers =
    [
        ("The Rolling Sounds", "MusicGroup"),
        ("City Symphony Orchestra", "MusicGroup"),
        ("Jazz Quartet Plus", "MusicGroup"),
        ("Electronic Dreams", "MusicGroup"),
        ("Royal Theater Company", "TheaterGroup"),
        ("Comedy Stars", "PerformingGroup"),
        ("Ballet Ensemble", "DanceGroup"),
        ("Folk Traditions", "MusicGroup"),
        ("Modern Dance Collective", "DanceGroup"),
        ("Chamber Music Society", "MusicGroup")
    ];

    private static readonly string[] EventNamePrefixes =
        ["Summer", "Winter", "Grand", "Annual", "International", "City", "Royal", "Ultimate", "Classic", "Modern"];

    private static readonly string[] EventNameSuffixes =
        ["Festival", "Night", "Concert", "Showcase", "Experience", "Extravaganza", "Gala", "Marathon", "Tour", "Show"];

    private static readonly Dictionary<string, string[]> KeywordsByType = new()
    {
        ["MusicEvent"] = ["Rock", "Jazz", "Classical", "Pop", "Electronic", "Hip-Hop", "Metal", "Blues", "Indie", "Folk"],
        ["TheaterEvent"] = ["Drama", "Comedy", "Musical", "Opera", "Ballet", "Contemporary", "Experimental"],
        ["SportsEvent"] = ["Football", "Basketball", "Tennis", "Running", "Swimming", "Cycling", "Boxing"],
        ["Festival"] = ["Summer", "Winter", "Food", "Art", "Cultural", "Street", "Music"],
        ["ComedyEvent"] = ["Stand-up", "Improv", "Sketch", "Satire", "Comedy"],
        ["DanceEvent"] = ["Ballet", "Contemporary", "Hip-Hop", "Salsa", "Tango"],
        ["ExhibitionEvent"] = ["Art", "Photography", "Sculpture", "Modern", "Historic"]
    };

    private static readonly double[] Prices = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];

    private static readonly Dictionary<string, string> CurrencyByCountry = new()
    {
        ["PL"] = "PLN", ["GB"] = "GBP", ["US"] = "USD", ["JP"] = "JPY"
    };

    public EventGenerator()
    {
        _fixture = new Fixture();
        _fixture.Behaviors.Add(new OmitOnRecursionBehavior());
    }

    public Dictionary<string, object> Generate(int index)
    {
        var city = Cities[index % Cities.Length];
        var eventType = EventTypes[index % EventTypes.Length];
        var venue = Venues[index % Venues.Length];
        var performer = Performers[index % Performers.Length];
        var price = Prices[index % Prices.Length];

        var eventName = $"{EventNamePrefixes[index % EventNamePrefixes.Length]} " +
                        $"{eventType.Replace("Event", "")} " +
                        $"{EventNameSuffixes[index % EventNameSuffixes.Length]}";

        var id = _fixture.Create<Guid>().ToString();
        var now = DateTime.UtcNow;
        var startDate = now.AddDays(index % 60).AddHours(10 + (index % 12));

        var typeKeywords = KeywordsByType.GetValueOrDefault(eventType, ["Entertainment", "Live"]);
        var keywords = new[] { typeKeywords[index % typeKeywords.Length], typeKeywords[(index + 1) % typeKeywords.Length] }
            .Distinct()
            .ToList();

        var currency = CurrencyByCountry.GetValueOrDefault(city.Country, "EUR");

        return new Dictionary<string, object>
        {
            ["id"] = id,
            ["type"] = eventType,
            ["name"] = $"{eventName} #{index + 1}",
            ["description"] = _fixture.Create<string>(),
            ["startDate"] = Timestamp.FromDateTime(startDate),
            ["endDate"] = Timestamp.FromDateTime(startDate.AddHours(2 + (index % 4))),
            ["datePublished"] = Timestamp.FromDateTime(now.AddDays(-(1 + (index % 30)))),
            ["url"] = $"https://example.com/events/{id}",
            ["imageUrl"] = $"https://picsum.photos/seed/{id}/800/600",
            ["eventStatus"] = "EventScheduled",
            ["attendanceMode"] = index % 5 == 0 ? "OnlineEventAttendanceMode" : "OfflineEventAttendanceMode",
            ["keywords"] = keywords,
            ["provider"] = "SeedDataProvider",
            ["createdAt"] = Timestamp.FromDateTime(now),
            ["location"] = new Dictionary<string, object>
            {
                ["type"] = "Place",
                ["name"] = venue,
                ["address"] = CreateAddress($"{venue} Address", city)
            },
            ["performer"] = new Dictionary<string, object>
            {
                ["type"] = performer.Type,
                ["name"] = performer.Name,
                ["url"] = $"https://example.com/performers/{performer.Name.ToLower().Replace(" ", "-")}",
                ["address"] = CreateAddress($"{performer.Name} HQ", city)
            },
            ["offer"] = new Dictionary<string, object>
            {
                ["type"] = "Offer",
                ["price"] = price,
                ["currency"] = currency,
                ["url"] = $"https://example.com/tickets/{id}",
                ["isAvailable"] = index % 7 != 0
            }
        };
    }

    private Dictionary<string, object> CreateAddress(
        string name,
        (string City, string Country, double Lat, double Lng) city)
    {
        return new Dictionary<string, object>
        {
            ["type"] = "PostalAddress",
            ["name"] = name,
            ["street"] = _fixture.Create<string>(),
            ["city"] = city.City,
            ["country"] = city.Country,
            ["postalCode"] = _fixture.Create<string>(),
            ["latitude"] = city.Lat,
            ["longitude"] = city.Lng
        };
    }
}
