# Deploy with Vagrant (Local 3-tier)

Runs the same three-tier architecture as the EC2 deployment but on local Vagrant VMs. Uses the same Ansible roles and the same Docker images — only the inventory and SSH credentials differ.

## Architecture

| VM | Private IP | Role |
|---|---|---|
| `bn-frontend` | `192.168.56.10` | nginx + SPA Docker container |
| `bn-api` | `192.168.56.11` | Hono API Docker container |
| `bn-db` | `192.168.56.12` | Postgres Docker container |

All three VMs share a VirtualBox host-only network. The frontend IP is reachable from your Windows browser.

## Prerequisites

- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- [Vagrant](https://developer.hashicorp.com/vagrant/install)
- WSL (Ubuntu) with Ansible: `pip install ansible` and `ansible-galaxy collection install community.docker`
- Docker Desktop on Windows (for building/pushing images)
- Existing vault at `deploy/ansible/group_vars/all/vault.yml` (reuse from EC2 setup)

## 1. Vagrantfile

Already at the **repo root**. Content for reference:

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.box_check_update = false

  # Disable default rsync — problematic on Windows
  config.vm.synced_folder ".", "/vagrant", disabled: true

  {
    "bn-frontend" => "192.168.56.10",
    "bn-api"      => "192.168.56.11",
    "bn-db"       => "192.168.56.12",
  }.each do |name, ip|
    config.vm.define name do |node|
      node.vm.hostname = name
      node.vm.network "private_network", ip: ip
      node.vm.provider "virtualbox" do |vb|
        vb.name   = name
        vb.memory = name == "bn-api" ? 1024 : 512
        vb.cpus   = 1
      end
    end
  end
end
```

## 2. Start the VMs

```powershell
vagrant up
```

Downloads the Ubuntu 22.04 box on first run (~600 MB) and boots all three VMs. Takes 3–5 minutes.

## 3. Copy Vagrant SSH keys to WSL

Ansible rejects keys from `/mnt/z/` because Windows mounts appear world-writable, which SSH treats as insecure. Copy each machine's key to WSL's native filesystem:

```bash
mkdir -p ~/.ssh/vagrant-bn
cp /mnt/z/buildersnetwork/.vagrant/machines/bn-frontend/virtualbox/private_key ~/.ssh/vagrant-bn/frontend.key
cp /mnt/z/buildersnetwork/.vagrant/machines/bn-api/virtualbox/private_key     ~/.ssh/vagrant-bn/api.key
cp /mnt/z/buildersnetwork/.vagrant/machines/bn-db/virtualbox/private_key      ~/.ssh/vagrant-bn/db.key
chmod 600 ~/.ssh/vagrant-bn/*.key
```

> Redo this step after `vagrant destroy && vagrant up` — Vagrant regenerates keys on each fresh provision.

## 4. Vagrant inventory

Already at `deploy/ansible/inventory.vagrant.ini`. Content for reference:

```ini
[web]
frontend ansible_host=192.168.56.10 ansible_user=vagrant ansible_ssh_private_key_file=~/.ssh/vagrant-bn/frontend.key

[api]
backend  ansible_host=192.168.56.11 ansible_user=vagrant ansible_ssh_private_key_file=~/.ssh/vagrant-bn/api.key

[db]
database ansible_host=192.168.56.12 ansible_user=vagrant ansible_ssh_private_key_file=~/.ssh/vagrant-bn/db.key

[all:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
```

## 5. Web image (no rebuild needed)

`API_URL` is injected at container startup via a Docker env var — the image is environment-agnostic. The same `ooflamp/buildersnetwork-web:latest` image works for both EC2 and Vagrant. Ansible passes the correct URL automatically from `api_url` in `group_vars/web.yml`, which already resolves to the Vagrant API IP.

## 6. Run Ansible

From WSL. The `-e` flags override `app_domain` and `app_url` so that `BETTER_AUTH_URL` in the API env points to the frontend IP (where your browser reaches the app):

```bash
cd /mnt/z/buildersnetwork/deploy/ansible

ANSIBLE_ROLES_PATH=/mnt/z/buildersnetwork/deploy/ansible/roles \
ansible-playbook -i inventory.vagrant.ini playbooks/site.yml \
  --ask-vault-pass \
  -e "app_domain=192.168.56.10" \
  -e "app_url=http://192.168.56.10"
```

Or provision each tier separately:

```bash
# Database first
ANSIBLE_ROLES_PATH=/mnt/z/buildersnetwork/deploy/ansible/roles \
ansible-playbook -i inventory.vagrant.ini playbooks/db.yml --ask-vault-pass

# API second (needs DB up)
ANSIBLE_ROLES_PATH=/mnt/z/buildersnetwork/deploy/ansible/roles \
ansible-playbook -i inventory.vagrant.ini playbooks/api.yml --ask-vault-pass \
  -e "app_domain=192.168.56.10" -e "app_url=http://192.168.56.10"

# Frontend last
ANSIBLE_ROLES_PATH=/mnt/z/buildersnetwork/deploy/ansible/roles \
ansible-playbook -i inventory.vagrant.ini playbooks/web.yml --ask-vault-pass
```

## 7. Verify

```bash
# From WSL or PowerShell
curl http://192.168.56.10/          # should return landing page HTML
curl http://192.168.56.11:8080/api/healthz   # should return {"status":"ok"}
```

Open `http://192.168.56.10/app/` in your Windows browser — the private network IP is directly reachable from the host.

## Teardown

```powershell
# Stop VMs (state preserved, fast restart with `vagrant up`)
vagrant halt

# Destroy VMs completely (frees disk space)
vagrant destroy -f
```

After `vagrant destroy`, run step 3 again before the next Ansible run — Vagrant regenerates SSH keys on each fresh boot.
