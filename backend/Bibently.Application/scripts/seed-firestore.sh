#!/bin/bash
# ---------------------------------------------------------------------------------------------------------------------
# Firestore Seed Data Script
# Populates the Firestore emulator with 50 diverse test events
# ---------------------------------------------------------------------------------------------------------------------

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SEED_PROJECT="$PROJECT_ROOT/tools/Bibently.SeedData"

# Default values
EMULATOR_HOST="${FIRESTORE_EMULATOR_HOST:-localhost:8080}"
PROJECT_ID="${FIRESTORE_PROJECT_ID:-demo-project}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --docker)
            # When running with Docker, the emulator might be on a different host
            EMULATOR_HOST="${FIRESTORE_EMULATOR_HOST:-host.docker.internal:8080}"
            shift
            ;;
        --host)
            EMULATOR_HOST="$2"
            shift 2
            ;;
        --project)
            PROJECT_ID="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --host HOST     Firestore emulator host (default: localhost:8080)"
            echo "  --project ID    Firebase project ID (default: demo-project)"
            echo "  --docker        Use Docker-friendly host (host.docker.internal:8080)"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  # Seed local emulator"
            echo "  $0"
            echo ""
            echo "  # Seed emulator running in Docker"
            echo "  $0 --host localhost:8080"
            echo ""
            echo "  # Custom project ID"
            echo "  $0 --project my-test-project"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🚀 Firestore Seed Data Script"
echo "   Emulator Host: $EMULATOR_HOST"
echo "   Project ID: $PROJECT_ID"
echo ""

# Check if emulator is reachable
echo "🔍 Checking Firestore emulator connectivity..."
if ! curl -s "http://$EMULATOR_HOST/" > /dev/null 2>&1; then
    echo "❌ Cannot connect to Firestore emulator at $EMULATOR_HOST"
    echo ""
    echo "Please ensure the emulator is running:"
    echo "  Local:  firebase emulators:start"
    echo "  Docker: docker-compose up"
    exit 1
fi
echo "   ✅ Emulator is reachable"
echo ""

# Build and run the seed tool
echo "🔨 Building seed tool..."
cd "$SEED_PROJECT"
dotnet build -c Release --verbosity quiet

echo ""
echo "🌱 Running seed tool..."
FIRESTORE_EMULATOR_HOST="$EMULATOR_HOST" FIRESTORE_PROJECT_ID="$PROJECT_ID" dotnet run -c Release --no-build
