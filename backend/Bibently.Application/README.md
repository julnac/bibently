Run locally with Firebase Emulators:
- firebase emulators:start --only firestore,auth -P demo-no-project
- run test `RunAdminUserUtility`
- run api
- hit `localhost:PORT/scalar`

Run on docker:
- docker-compose -f .docker/docker-compose.yml up --build
- hit `/scalar`
- create admin user & generate token: dotnet test --filter RunAdminUserUtility --logger:"console;verbosity=detailed"

Run on produciton:
- open gcp
- find service url
- hit, for example, /api/v1/events


Deploy:
- firebase deploy --only firestore:indexes --project bibently-firebase

terraform:
- terraform validate
- terraform plan
- terraform apply
