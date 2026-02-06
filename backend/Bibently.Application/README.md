Run locally with Firebase Emulators:
- firebase emulators:start --only firestore,auth -P demo-no-project
- run test `RunAdminUserUtility`
- run api
- hit `/scalar`

Run on docker:
- docker-compose -f .docker/docker-compose.yml up --build
- hit `/scalar`

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
