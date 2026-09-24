output "app_vm_public_ip" {
  description = "Public IP of the app VM — point your domain A record here"
  value       = oci_core_instance.app_vm.public_ip
}

output "db_vm_private_ip" {
  description = "Private IP of the DB VM (not accessible from internet)"
  value       = oci_core_instance.db_vm.private_ip
}

output "ssh_command" {
  description = "SSH into the app VM"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${oci_core_instance.app_vm.public_ip}"
}
