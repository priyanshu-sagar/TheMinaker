variable "compartment_id" {
  description = "OCI Compartment OCID"
  type        = string
}

variable "region" {
  description = "OCI Region — must be India for DPDP Act compliance"
  type        = string
  default     = "ap-mumbai-1"

  validation {
    condition     = contains(["ap-mumbai-1", "ap-hyderabad-1"], var.region)
    error_message = "DPDP Act 2023: Only India regions are permitted. Use ap-mumbai-1 or ap-hyderabad-1."
  }
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}
