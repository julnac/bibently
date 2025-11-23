# -------------------------------------------------------------------------
# Stage 1: build
# Base image for building the .NET application
# -------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set the working directory for the build stage. This represents the solution root inside the container.
WORKDIR /src

# CRITICAL STEP 1: Copy global property files for MSBuild variable definition
# FIX: The destination must be the container's root (/) to satisfy the relative import path
# used in Directory.Build.props (which evaluates to /.build/src.props).
COPY ./.build/*.props /.build/

# Copy Directory.Build.props, which links the project files to the properties.
# Source: ./src/Directory.Build.props -> Destination: /src/ (the WORKDIR)
COPY ./src/Directory.Build.props ./

# CRITICAL STEP 2: Copy project files for caching and restore
# Destination paths are relative to WORKDIR /src.
COPY ./src/Bibently.Api/*.csproj ./Bibently.Api/
COPY ./src/Bibently.Abstractions/*.csproj ./Bibently.Abstractions/
COPY ./src/Bibently.Repository/*.csproj ./Bibently.Repository/

# Restore dependencies
# Explicitly pass NetVersion and RuntimeIdentifiers to guarantee they resolve,
# bypassing potential MSBuild property import issues.
RUN dotnet restore Bibently.Api/Bibently.Api.csproj \
    /p:NetVersion=net9.0 \
    /p:RuntimeIdentifiers=linux-x64

# CRITICAL STEP 3: Copy all remaining source files
# Copy the *contents* of the host's ./src/ folder into the container's /src root.
COPY ./src/ .

# Build and Publish the main application
# Explicitly pass properties again for a guaranteed successful publish.
RUN dotnet publish Bibently.Api/Bibently.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false \
    /p:NetVersion=net9.0 \
    /p:RuntimeIdentifiers=linux-x64

# -------------------------------------------------------------------------
# Stage 2: final
# Final, smaller runtime image
# -------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
# Copy the published output from the build stage
COPY --from=build /app/publish .
# Define the application entry point
ENTRYPOINT ["dotnet", "Bibently.Api.dll"]
