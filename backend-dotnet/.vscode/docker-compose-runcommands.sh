# WINDOWS (cmd):

docker.exe compose ^
  -f .docker/docker-compose.yml ^
  --env-file .docker/.env ^
  up --remove-orphans --build -d

# LINUX/MACOS (bash):

docker compose \
  -f .docker/docker-compose.yml \
  --env-file .docker/.env \
  up --remove-orphans --build -d
  
  
# PUBLISH MACOS -working
dotnet publish \
  --self-contained \
  --runtime osx-arm64 \
  -f net10.0 \
  -p:PublishDir=obj/docker/publish/net10.0/osx-arm64
  

dotnet publish \
  --self-contained \
  --runtime linux-x64 \
  -f net10.0 \
  -p:PublishDir=obj/docker/publish/net10.0/linux-x64

