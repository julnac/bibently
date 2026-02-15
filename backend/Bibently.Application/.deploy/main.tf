terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type    = string
  default = "bibently-firebase"
}

variable "region" {
  type    = string
  default = "europe-west1"
}

# The image path we pushed in the previous step
variable "image_uri" {
  type    = string
  default = "europe-west1-docker.pkg.dev/bibently-firebase/gcf-docker-repo/event-service:v1"
}

# Cloud Run v2 is the modern "Docker-based" equivalent of Cloud Functions Gen 2
resource "google_cloud_run_v2_service" "api_service" {
  name     = "bibently-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    # Use second-generation execution environment for faster startup
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

    scaling {
      max_instance_count = 1
      min_instance_count = 0
    }

    containers {
      image = var.image_uri

      ports {
        name           = "h2c"
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        # Keep CPU allocated during idle for faster response after cold start
        cpu_idle = true
        # Temporarily boost CPU during container startup (up to 2x)
        startup_cpu_boost = true
      }

      # Startup probe - helps Cloud Run detect when app is ready faster
      startup_probe {
        http_get {
          path = "/health/ready"
          port = 8080
        }
        initial_delay_seconds = 0
        period_seconds        = 2
        timeout_seconds       = 1
        failure_threshold     = 30  # Allow up to 60 seconds for startup
      }

      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = "Production"
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
    }

  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Allow public access (Equivalent to your previous IAM block)
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.api_service.location
  project  = google_cloud_run_v2_service.api_service.project
  service  = google_cloud_run_v2_service.api_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value = google_cloud_run_v2_service.api_service.uri
}
