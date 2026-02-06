# STAGE 1: Build
# Use the SDK image that matches the host platform for faster builds (leveraging native emulation if needed)
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
ARG TARGETARCH
WORKDIR /app

# 1. Copy global configuration files (these change rarely)
COPY Bibently.Application.sln global.json ./
COPY .build/ .build/
COPY src/Directory.Build.props src/

# 2. Copy project files for dependency restoration
# This layer is cached as long as the .csproj files don't change
COPY src/Bibently.Application.Api/Bibently.Application.Api.csproj src/Bibently.Application.Api/
COPY src/Bibently.Application.Abstractions/Bibently.Application.Abstractions.csproj src/Bibently.Application.Abstractions/
COPY src/Bibently.Application.Repository/Bibently.Application.Repository.csproj src/Bibently.Application.Repository/

# 3. Restore dependencies
# Using --mount=type=cache stores NuGet packages between builds, significantly speeding up restores
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore src/Bibently.Application.Api/Bibently.Application.Api.csproj -a $TARGETARCH

# 4. Copy source code and Publish
# This layer is invalidated when any source code changes
COPY src/ src/
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish src/Bibently.Application.Api/Bibently.Application.Api.csproj \
    -c Release \
    -a $TARGETARCH \
    -o /app/publish \
    --no-restore \
    --self-contained true

# STAGE 2: Runtime
# Use runtime-deps for self-contained apps
FROM mcr.microsoft.com/dotnet/runtime-deps:10.0-alpine AS final
WORKDIR /app

# Install ICU libraries for globalization support
RUN apk add --no-cache icu-libs

# Set production defaults
ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_GCMode=1 \
    DOTNET_TieredPGO=1 \
    DOTNET_TC_QuickJitForLoops=1 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8

# Security: Create and use a non-privileged user
RUN adduser -h /app -D -u 1000 appuser
USER appuser

# Copy only the published output from the build stage
COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["./Bibently.Application.Api"]
