variable "kubeconfig" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "namespace" {
  description = "Kubernetes namespace for ADIP"
  type        = string
  default     = "adip"
}

variable "database_url" {
  description = "SQLAlchemy database URL (PostgreSQL DSN) for the backend"
  type        = string
  sensitive   = true
}

variable "image_tag" {
  description = "Container image tag to deploy for backend and frontend"
  type        = string
  default     = "latest"
}

variable "host" {
  description = "Public hostname for the ingress"
  type        = string
  default     = "adip.example.com"
}
