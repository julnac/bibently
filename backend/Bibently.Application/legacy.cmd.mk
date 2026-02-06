# Makefile to automate common Go tasks

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

gcloud artifacts repositories create gcf-docker-repo \
    --repository-format=docker \
    --location=europe-west1 \
    --description="Docker repository for Bibently Api"

gcloud auth configure-docker us-central1-docker.pkg.dev

docker tag bibently-api europe-west1-docker.pkg.dev/bibently-firebase/gcf-docker-repo/event-service:v1


docker push europe-west1-docker.pkg.dev/bibently-firebase/gcf-docker-repo/event-service:v1

deploy:
	gcloud functions deploy bibently-functions \
	--flags-file=deploy-config.yaml \
	--service-account=$(FUNCTION_SERVICE_ACCOUNT) \
	--update-env-vars=GOOGLE_CLOUD_PROJECT=$(GOOGLE_CLOUD_PROJECT)

deploy-firebase:
	firebase deploy --only firestore

# can set all env vars from .env file
#	--set-env-vars=$(shell grep -v '^#' .env | xargs | tr ' ' ',')

# check the service account used by the function
#gcloud functions describe $(FUNCTION_TARGET) \
#    --region=europe-west1 \
#    --gen2 \
#    --format="value(serviceConfig.serviceAccountEmail)"
