terraform {
  required_version = ">= 1.6.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
  # Uncomment to use OCI Object Storage as Terraform backend
  # backend "s3" {
  #   bucket   = "minaker-tfstate"
  #   key      = "oracle/terraform.tfstate"
  #   region   = "ap-mumbai-1"
  #   endpoint = "https://<namespace>.compat.objectstorage.ap-mumbai-1.oraclecloud.com"
  #   ...
  # }
}

provider "oci" {
  region = var.region
  # Auth via ~/.oci/config (API key) or instance principal in CI
}

# ─── Data Sources ─────────────────────────────────────────────
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

data "oci_core_images" "ubuntu_arm" {
  compartment_id   = var.compartment_id
  operating_system = "Canonical Ubuntu"
  # Ubuntu 22.04 LTS ARM64
  filter {
    name   = "display_name"
    values = ["Canonical-Ubuntu-22.04-aarch64-.*"]
    regex  = true
  }
  filter {
    name   = "lifecycle_state"
    values = ["AVAILABLE"]
  }
  sort_by    = "TIMECREATED"
  sort_order = "DESC"
}

# ─── VCN (Virtual Cloud Network) ──────────────────────────────
resource "oci_core_vcn" "minaker_vcn" {
  compartment_id = var.compartment_id
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "minaker-vcn"
  dns_label      = "minaker"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.minaker_vcn.id
  display_name   = "minaker-igw"
  enabled        = true
}

resource "oci_core_route_table" "public_rt" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.minaker_vcn.id
  display_name   = "minaker-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_subnet" "public_subnet" {
  compartment_id    = var.compartment_id
  vcn_id            = oci_core_vcn.minaker_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "minaker-public-subnet"
  dns_label         = "public"
  route_table_id    = oci_core_route_table.public_rt.id
  security_list_ids = [oci_core_security_list.minaker_sl.id]
}

resource "oci_core_subnet" "private_subnet" {
  compartment_id             = var.compartment_id
  vcn_id                     = oci_core_vcn.minaker_vcn.id
  cidr_block                 = "10.0.2.0/24"
  display_name               = "minaker-private-subnet"
  dns_label                  = "private"
  prohibit_public_ip_on_vnic = true
}

# ─── Security List (Firewall Rules) ───────────────────────────
resource "oci_core_security_list" "minaker_sl" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.minaker_vcn.id
  display_name   = "minaker-security-list"

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options { min = 22; max = 22 } # SSH
  }
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options { min = 80; max = 80 } # HTTP
  }
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options { min = 443; max = 443 } # HTTPS
  }
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options { min = 1883; max = 1883 } # MQTT
  }
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

# ─── App VM (ARM — Always Free: 4 OCPUs, 24 GB RAM) ──────────
resource "oci_core_instance" "app_vm" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  shape               = "VM.Standard.A1.Flex"
  display_name        = "minaker-app"

  shape_config {
    ocpus         = 4
    memory_in_gbs = 24
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_arm.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    display_name     = "minaker-app-vnic"
    hostname_label   = "minaker-app"
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data = base64encode(templatefile("${path.module}/cloud-init.sh.tpl", {
      docker_compose_version = "2.32.4"
    }))
  }

  freeform_tags = {
    project     = "theminaker"
    environment = "demo"
    region      = "ap-mumbai-1"
  }
}

# ─── DB VM (ARM — Always Free) ────────────────────────────────
resource "oci_core_instance" "db_vm" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  shape               = "VM.Standard.A1.Flex"
  display_name        = "minaker-db"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 12
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_arm.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.private_subnet.id
    assign_public_ip = false
    display_name     = "minaker-db-vnic"
    hostname_label   = "minaker-db"
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
  }

  freeform_tags = {
    project     = "theminaker"
    environment = "demo"
  }
}
