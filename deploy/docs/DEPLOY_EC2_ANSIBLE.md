# Deploy to AWS EC2 (2-Tier) with Ansible

Two separate EC2 instances: **backend API**, **frontend nginx**. The database is
a SQLite file on the API host — no separate database VM.

```
Browser → Frontend VM (nginx :80) → Backend VM (Hono :8080 + SQLite file)
```

## Prerequisites

- Two EC2 instances (`t3.micro`, Ubuntu 22.04 LTS) — free tier eligible
- SSH key pair saved at `~/.ssh/buildersnetwork.pem`
- Ansible installed: `pip install ansible`
- Docker community collection: `ansible-galaxy collection install community.docker`
- Docker Hub account (for pushing images)
- **Windows users:** run all Ansible commands from WSL

## 1. Security groups

| VM | Inbound rules |
|---|---|
| `bn-frontend` | 80 (HTTP), 22 (SSH from your IP) |
| `bn-api` | 8080 from `bn-frontend` security group, 22 from your IP |

Port 8080 on the backend is intentionally not public — the frontend nginx proxies `/api/` to it internally. The database is a local file on this host, so there is no database port to open.

## 2. Configure inventory

Edit `deploy/ansible/inventory.ini` with your EC2 public IPs:

```ini
[web]
frontend ansible_host=<FRONTEND_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/buildersnetwork.pem

[api]
backend  ansible_host=<BACKEND_IP>  ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/buildersnetwork.pem

[all:vars]
ansible_python_interpreter=/usr/bin/python3
```

## 3. Vault secrets

Secrets live in `deploy/ansible/group_vars/all/vault.yml`, encrypted with Ansible Vault.

Create it:

```bash
ansible-vault create deploy/ansible/group_vars/all/vault.yml
```

Add:

```yaml
better_auth_secret: "min_32_chars_random_secret"
gemini_api_key: "your_gemini_api_key"
```

To edit later: `ansible-vault edit deploy/ansible/group_vars/all/vault.yml`

## 4. Build and push Docker images

Build context is the **repo root** for both images.

**API image:**

```powershell
docker build -f deploy/Dockerfile.api -t ooflamp/buildersnetwork-api:latest .
docker push ooflamp/buildersnetwork-api:latest
```

**Web image** (`API_URL` is injected at container runtime — no build arg needed):

```powershell
docker build -f deploy/Dockerfile.web -t ooflamp/buildersnetwork-web:latest .
docker push ooflamp/buildersnetwork-web:latest
```

Update `deploy/ansible/group_vars/api.yml` and `group_vars/web.yml` to reference your Docker Hub username if different from `ooflamp`.

## 5. Deploy

From WSL (Windows) or your terminal:

```bash
cd /mnt/z/buildersnetwork/deploy/ansible   # adjust path for your machine

ANSIBLE_ROLES_PATH=/mnt/z/buildersnetwork/deploy/ansible/roles \
ansible-playbook -i inventory.ini playbooks/site.yml \
  --ask-vault-pass \
  -e "app_domain=<FRONTEND_IP>" \
  -e "app_url=http://<FRONTEND_IP>"
```

The `-e` flags set `BETTER_AUTH_URL` and `ALLOWED_ORIGINS` to the frontend's public IP — the address users type into their browser.

Or deploy each tier individually (API first — its role also runs migrations
against the SQLite file before the container serves):

```bash
# 1. API
ANSIBLE_ROLES_PATH=... ansible-playbook -i inventory.ini playbooks/api.yml --ask-vault-pass \
  -e "app_domain=<FRONTEND_IP>" -e "app_url=http://<FRONTEND_IP>"

# 2. Frontend
ANSIBLE_ROLES_PATH=... ansible-playbook -i inventory.ini playbooks/web.yml --ask-vault-pass
```

## 6. Verify

```bash
curl http://<FRONTEND_IP>/           # landing page HTML
curl http://<FRONTEND_IP>/api/healthz  # {"status":"ok"} — goes through nginx proxy
```

The backend port 8080 will time out from the public internet — that's expected. Requests reach it only through the frontend proxy.

Open `http://<FRONTEND_IP>/app/` in a browser to test the full app flow.

## Environment variables reference

Non-secret vars live in `group_vars/api.yml` and `group_vars/all/vars.yml`. Secrets in `group_vars/all/vault.yml`.

| Variable | Source | Description |
|---|---|---|
| `DATABASE_URL` | `api.yml` | `file:/data/app.db` — a SQLite file on the API host, mounted into the API and migrate containers at `/data` |
| `BETTER_AUTH_SECRET` | vault | Min 32 chars random string |
| `BETTER_AUTH_URL` | `-e app_url=...` | Frontend public URL — used in auth email links |
| `GEMINI_API_KEY` | vault | Gemini API key — the Node entrypoint always uses `createGeminiAI` |
| `SERVE_STATIC` | `api.yml` | Must be `false` in 2-tier (nginx handles static files) |

## Redeploying after changes

**API code changes:**

```powershell
docker build -f deploy/Dockerfile.api -t ooflamp/buildersnetwork-api:latest .
docker push ooflamp/buildersnetwork-api:latest
```

```bash
ANSIBLE_ROLES_PATH=... ansible-playbook -i inventory.ini playbooks/api.yml --ask-vault-pass \
  -e "app_domain=<FRONTEND_IP>" -e "app_url=http://<FRONTEND_IP>"
```

**Frontend changes:**

```powershell
docker build -f deploy/Dockerfile.web -t ooflamp/buildersnetwork-web:latest .
docker push ooflamp/buildersnetwork-web:latest
```

```bash
ANSIBLE_ROLES_PATH=... ansible-playbook -i inventory.ini playbooks/web.yml --ask-vault-pass
```
