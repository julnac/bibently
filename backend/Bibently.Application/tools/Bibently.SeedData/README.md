# Firestore Seed Data Tool

A utility to populate the Firestore emulator with 50 diverse test events for testing filtering, searching, and pagination functionality.

Uses [AutoFixture](https://github.com/AutoFixture/AutoFixture) to generate randomized field values (IDs, descriptions, addresses) while maintaining realistic domain data through curated lookup arrays (cities, venues, performers, event types).

## Data Characteristics

The seed data includes:

- **10 different cities**: Warsaw, Krakow, London, Berlin, Paris, New York, Tokyo, Amsterdam, Prague, Vienna
- **7 event types**: MusicEvent, TheaterEvent, SportsEvent, Festival, ComedyEvent, DanceEvent, ExhibitionEvent
- **Price range**: Free ($0) to $500
- **Date range**: Events spread over the next 60 days
- **Keywords**: Genre-specific keywords (Rock, Jazz, Classical, Drama, Football, etc.)
- **Geographic coordinates**: Latitude/Longitude for each city

## Usage

### Option 1: Docker Compose (Recommended)

The `docker-compose.yml` in `.docker/` automatically seeds the database when starting the emulators:

```bash
cd .docker
docker-compose up
```

The startup sequence is:
1. `firebase-emulators` — starts Firestore & Auth emulators
2. `firestore-seed` — waits for emulators to be healthy, then seeds 50 events
3. `bibently.application` — waits for seeding to complete, then starts the API

### Option 2: Using the Shell Script

```bash
# Seed the local emulator (default: localhost:8080)
./scripts/seed-firestore.sh

# Seed with custom emulator host
./scripts/seed-firestore.sh --host localhost:8080

# Seed with custom project ID
./scripts/seed-firestore.sh --project my-project-id

# Show help
./scripts/seed-firestore.sh --help
```

### Option 3: Direct .NET Run

```bash
# With local emulator
FIRESTORE_EMULATOR_HOST=localhost:8080 \
FIRESTORE_PROJECT_ID=demo-project \
dotnet run --project tools/Bibently.SeedData

# With Docker emulator (if running outside Docker)
FIRESTORE_EMULATOR_HOST=localhost:8080 \
FIRESTORE_PROJECT_ID=demo-project \
dotnet run --project tools/Bibently.SeedData
```

## Prerequisites

1. **Firestore Emulator Running**

   Local:
   ```bash
   firebase emulators:start
   ```

   Docker:
   ```bash
   cd .docker && docker-compose up
   ```

2. **.NET SDK** (same version as the main project)

## Sample API Queries After Seeding

Once the data is seeded, you can test these API queries:

```bash
# Filter by city
GET /api/v1/events?city=Warsaw
GET /api/v1/events?city=London

# Filter by event type
GET /api/v1/events?type=MusicEvent
GET /api/v1/events?type=TheaterEvent

# Filter by price range
GET /api/v1/events?minPrice=50&maxPrice=150
GET /api/v1/events?minPrice=0&maxPrice=0  # Free events only

# Filter by keywords
GET /api/v1/events?keywords=Rock
GET /api/v1/events?keywords=Jazz

# Sorting
GET /api/v1/events?sortKey=Price&order=Ascending
GET /api/v1/events?sortKey=StartDate&order=Descending
GET /api/v1/events?sortKey=Name

# Pagination
GET /api/v1/events?pageSize=10
GET /api/v1/events?pageSize=10&pageToken=<token_from_previous_response>

# Combined filters
GET /api/v1/events?city=Warsaw&type=MusicEvent&minPrice=50&sortKey=StartDate
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FIRESTORE_EMULATOR_HOST` | `localhost:8080` | Firestore emulator host:port |
| `FIRESTORE_PROJECT_ID` | `demo-project` | Firebase project ID |
