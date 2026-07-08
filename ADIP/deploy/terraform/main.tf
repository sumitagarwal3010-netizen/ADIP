# ============================================================================
# ADIP — Terraform skeleton (Role 9 — DevOps)
# ----------------------------------------------------------------------------
# A provider-agnostic SKELETON that provisions the shape of an ADIP environment:
# a Kubernetes namespace, a secret for the database URL, and the Helm release.
# It intentionally does NOT provision a specific cloud's managed database — swap
# in your cloud module (RDS / Cloud SQL / Azure Postgres) where indicated.
#
#   terraform init && terraform plan -var="database_url=..."
# ============================================================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.30" }
    helm       = { source = "hashicorp/helm", version = "~> 2.13" }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig
}

provider "helm" {
  kubernetes {
    config_path = var.kubeconfig
  }
}

resource "kubernetes_namespace" "adip" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/part-of" = "adip"
    }
  }
}

resource "kubernetes_secret" "adip" {
  metadata {
    name      = "adip-secrets"
    namespace = kubernetes_namespace.adip.metadata[0].name
  }
  data = {
    "database-url" = var.database_url
  }
  type = "Opaque"
}

# --- Managed database (placeholder) --------------------------------------
# Replace with your cloud's module and feed its connection string into
# var.database_url. Example:
# module "database" {
#   source  = "terraform-aws-modules/rds/aws"
#   ...
# }

resource "helm_release" "adip" {
  name      = "adip"
  namespace = kubernetes_namespace.adip.metadata[0].name
  chart     = "${path.module}/../helm/adip"

  set {
    name  = "backend.image.tag"
    value = var.image_tag
  }
  set {
    name  = "frontend.image.tag"
    value = var.image_tag
  }
  set {
    name  = "ingress.host"
    value = var.host
  }
  set {
    name  = "secrets.existingSecret"
    value = kubernetes_secret.adip.metadata[0].name
  }

  depends_on = [kubernetes_secret.adip]
}
