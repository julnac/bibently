# Variables
TF_DIR = ./.terraform
GOOGLE_CLOUD_PROJECT = bibently-firebase
REGION = europe-west1
ARTIFACT_REPO = gcf-docker-repo
REPOSITORY_FORMAT = docker
IMAGE_NAME = event-service
IMAGE_TAG = v2 # bump this for new versions
DOCKER = /Applications/Docker.app/Contents/Resources/bin/docker
IMAGE_URI = $(REGION)-docker.pkg.dev/$(GOOGLE_CLOUD_PROJECT)/$(ARTIFACT_REPO)/$(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: setup-gcp build push tf-init tf-plan tf-apply deploy

# 1. One-time setup for authentication & infra
setup-gcp:
	gcloud auth login
	gcloud config set project $(GOOGLE_CLOUD_PROJECT)
	gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet
	gcloud artifacts repositories create $(ARTIFACT_REPO) \
		--repository-format=$(REPOSITORY_FORMAT) \
		--location=$(REGION) || true

# 2. Build for the correct platform (amd64)
build:
	$(DOCKER) buildx build \
		--platform linux/amd64 \
		--provenance=false \
		-t $(IMAGE_URI) \
		. --load

# 3. Push to Artifact Registry
push: build
	$(DOCKER) push $(IMAGE_URI)

# 4. Terraform Targets
tf-init:
	cd $(TF_DIR) && terraform init

tf-plan:
	cd $(TF_DIR) && terraform plan \
		-var="project_id=$(GOOGLE_CLOUD_PROJECT)" \
		-var="image_uri=$(IMAGE_URI)" \
		-var="region=$(REGION)"

tf-apply:
	cd $(TF_DIR) && terraform apply \
		-var="image_uri=$(IMAGE_URI)" \
		-var="project_id=$(GOOGLE_CLOUD_PROJECT)" \
		-var="region=$(REGION)" \
		-auto-approve

# 5. Full Deployment Flow
deploy: push tf-init tf-apply
