# Cloud Function Event Service

This project implements a Google Cloud Function (Gen 2) in Go for managing events in Firestore.

## Project Structure

* internal/domain: Data models and DTOs.
* internal/repository: Firestore interactions (Filtering, Sorting).
* internal/service: Business logic.
* internal/transport: HTTP handling and Brotli compression.
* function.go: Cloud Function entry point.

## Testing

Run the unit tests (ensure you run tidy first):

```go test ./...```


## Deployment

To deploy to Google Cloud:

```

```

## GCP setup
Service account have to has three required roles:
- datastore.user
- logging.logWriter
- secretmanager.secretAccessor

