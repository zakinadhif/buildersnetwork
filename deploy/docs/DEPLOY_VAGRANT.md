# Deploy with Vagrant (Local 2-tier)

Runs the same two-tier architecture as the EC2 deployment but on local Vagrant VMs. Uses the same Ansible roles and the same Docker images — only the inventory and SSH credentials differ. The database is a SQLite file on the API VM; there is no separate database VM.

## Architecture

| VM | Private IP | Role |
|---|---|---|
| `bn-frontend` | `192.168.56.10` | nginx + SPA Docker container |
| `bn-api` | `192.168.56.11` | Hono API Docker container + SQLite file |

Both VMs share a VirtualBox host-only network. The frontend IP is reachable from your Windows browser.

## Prerequisites

- [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- [Vagrant](https://developer.hashicorp.com/vagrant/install)
- WSL (Ubuntu) with Ansible: `pip install ansible` and `ansible-galaxy collection install community.docker`
- Docker Desktop on Windows (for building/pushing images)
- Existing vault at `deploy/ansible/group_vars/all/vault.yml` (reuse from EC2 setup)

---

## First-time setup

### 1. Start the VMs

```powershell
vagrant up
```

Downloads the Ubuntu 22.04 box on first run (~600 MB) and boots both VMs. Takes 3–5 minutes.

### 2. Copy Vagrant SSH keys to WSL

Ansible rejects keys from `/mnt/z/` because Windows mounts appear world-writable, which SSH treats as insecure. Copy each machine's key to WSL's native filesystem:

```bash
mkdir -p ~/.ssh/vagrant-bn
cp /mnt/z/buildersnetwork/.vagrant/machines/bn-frontend/virtualbox/private_key ~/.ssh/vagrant-bn/frontend.key
cp /mnt/z/buildersnetwork/.vagrant/machines/bn-api/virtualbox/private_key     ~/.ssh/vagrant-bn/api.key
chmod 600 ~/.ssh/vagrant-bn/*.key
```

> Redo this step after `vagrant destroy && vagrant up` — Vagrant regenerates keys on each fresh provision.

### 3. Populate the Ansible vault

The vault lives at `deploy/ansible/group_vars/all/vault.yml`. Edit it with:

```bash
ansible-vault edit deploy/ansible/group_vars/all/vault.yml
```

Required keys:

```yaml
better_auth_secret: "at-least-32-character-random-string"
gemini_api_key: "AIza..."
resend_api_key: "re_..."
```

To create the vault from scratch if it doesn't exist:

```bash
ansible-vault create deploy/ansible/group_vars/all/vault.yml
```

### 4. Build and push Docker images

From the repo root in PowerShell:

```powershell
# API image
docker build -f deploy/Dockerfile.api -t ooflamp/buildersnetwork-api:latest .
docker push ooflamp/buildersnetwork-api:latest

# Web image
docker build -f deploy/Dockerfile.web -t ooflamp/buildersnetwork-web:latest .
docker push ooflamp/buildersnetwork-web:latest
```

The web image is environment-agnostic — `API_URL` is injected at container startup via Docker env var (nginx envsubst), so the same image works for both EC2 and Vagrant.

### 5. Run Ansible

From WSL. The `-e` flags override `app_domain` and `app_url` so that `BETTER_AUTH_URL` in the API env points to the frontend IP (where your browser reaches the app):

```bash
ANSIBLE_ROLES_PATH=deploy/ansible/roles \
ansible-playbook deploy/ansible/playbooks/site.yml \
  -i deploy/ansible/inventory.vagrant.ini \
  --ask-vault-pass \
  -e "app_domain=192.168.56.10" \
  -e "app_url=http://192.168.56.10"
```

Or provision each tier separately (useful when iterating):

```bash
# API first (its role also runs migrations against the SQLite file)
ANSIBLE_ROLES_PATH=deploy/ansible/roles \
ansible-playbook deploy/ansible/playbooks/api.yml \
  -i deploy/ansible/inventory.vagrant.ini --ask-vault-pass \
  -e "app_domain=192.168.56.10" -e "app_url=http://192.168.56.10"

# Frontend last
ANSIBLE_ROLES_PATH=deploy/ansible/roles \
ansible-playbook deploy/ansible/playbooks/web.yml \
  -i deploy/ansible/inventory.vagrant.ini --ask-vault-pass \
  -e "app_domain=192.168.56.10" -e "app_url=http://192.168.56.10"
```

### 6. Verify

```bash
curl http://192.168.56.10/           # landing page HTML
curl http://192.168.56.11:8080/api/healthz  # {"status":"ok"}
```

Open `http://192.168.56.10/app/` in your Windows browser.

---

## Day-to-day operations

### Changing an environment variable

Environment variables for the API container come from the Ansible vault and `env.j2` template. To add or change one:

1. Edit the vault:
   ```bash
   ansible-vault edit deploy/ansible/group_vars/all/vault.yml
   ```
2. If the variable isn't in `env.j2` yet, add it to `deploy/ansible/roles/backend-api/templates/env.j2`.
3. Redeploy the API role:
   ```bash
   ANSIBLE_ROLES_PATH=deploy/ansible/roles \
   ansible-playbook deploy/ansible/playbooks/api.yml \
     -i deploy/ansible/inventory.vagrant.ini --ask-vault-pass \
     -e "app_domain=192.168.56.10" -e "app_url=http://192.168.56.10"
   ```

Ansible re-templates the `.env` file and recreates the container automatically.

To confirm the variable reached the container:

```bash
vagrant ssh bn-api -c "docker inspect buildersnetwork-api --format '{{range .Config.Env}}{{println .}}{{end}}'"
```

### Rebuilding and redeploying the API

After changing API code:

```powershell
# Rebuild and push
docker build -f deploy/Dockerfile.api -t ooflamp/buildersnetwork-api:latest .
docker push ooflamp/buildersnetwork-api:latest
```

```bash
# Pull and restart
ANSIBLE_ROLES_PATH=deploy/ansible/roles \
ansible-playbook deploy/ansible/playbooks/api.yml \
  -i deploy/ansible/inventory.vagrant.ini --ask-vault-pass \
  -e "app_domain=192.168.56.10" -e "app_url=http://192.168.56.10"
```

The API role always pulls the latest image (`force_source: true`).

### Rebuilding and redeploying the frontend

After changing frontend code:

```powershell
docker build -f deploy/Dockerfile.web -t ooflamp/buildersnetwork-web:latest .
docker push ooflamp/buildersnetwork-web:latest
```

```bash
ANSIBLE_ROLES_PATH=deploy/ansible/roles \
ansible-playbook deploy/ansible/playbooks/web.yml \
  -i deploy/ansible/inventory.vagrant.ini --ask-vault-pass \
  -e "app_domain=192.168.56.10" -e "app_url=http://192.168.56.10"
```

### Viewing container logs

```bash
# API logs (tail + follow)
vagrant ssh bn-api -c "docker logs buildersnetwork-api --tail 50 -f"

# Web/nginx logs
vagrant ssh bn-frontend -c "docker logs buildersnetwork-web --tail 50 -f"
```

### Checking container status

```bash
vagrant ssh bn-api -c "docker ps"
vagrant ssh bn-frontend -c "docker ps"
```

A container with status `Restarting` means it's crash-looping. Check logs immediately.

### Verifying a container's environment

```bash
vagrant ssh bn-api -c "docker inspect buildersnetwork-api --format '{{range .Config.Env}}{{println .}}{{end}}'"
```

Compare the output against `apps/api/.env` to ensure all required variables are present.

### Running database migrations manually

```bash
vagrant ssh bn-api -c "docker run --rm \
  --env-file /opt/buildersnetwork/.env \
  ooflamp/buildersnetwork-api:latest \
  node dist/scripts/migrate.js"
```

### SSHing into a VM

```powershell
vagrant ssh bn-api
vagrant ssh bn-frontend
```

---

## Teardown

```powershell
# Stop VMs (state preserved, fast restart with `vagrant up`)
vagrant halt

# Destroy VMs completely (frees disk space)
vagrant destroy -f
```

After `vagrant destroy`, repeat step 2 (copy SSH keys) before the next Ansible run — Vagrant regenerates keys on each fresh boot.

---

## Reference: Vagrantfile

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.box_check_update = false
  config.vm.synced_folder ".", "/vagrant", disabled: true

  {
    "bn-frontend" => "192.168.56.10",
    "bn-api"      => "192.168.56.11",
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

## Reference: inventory.vagrant.ini

```ini
[web]
frontend ansible_host=192.168.56.10 ansible_user=vagrant ansible_ssh_private_key_file=~/.ssh/vagrant-bn/frontend.key

[api]
backend  ansible_host=192.168.56.11 ansible_user=vagrant ansible_ssh_private_key_file=~/.ssh/vagrant-bn/api.key

[all:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
```
