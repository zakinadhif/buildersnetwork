# Deploy to AWS EC2 (3-Tier) with Ansible

Three separate EC2 instances: **database**, **backend API**, **frontend nginx**.

```
Frontend VM (nginx)  ──▶  Backend VM (Hono API)  ──▶  Database VM (Postgres)
```

## Prerequisites

- Three EC2 instances (e.g. `t3.micro` each — free tier eligible)
- Ubuntu 22.04 LTS AMI on all three
- SSH key pair (`~/.ssh/buildersnetwork.pem`)
- Ansible installed locally: `pip install ansible`
- Docker community collection: `ansible-galaxy collection install community.docker`

## 1. Set up EC2 security groups

| VM | Inbound |
|---|---|
| Frontend | 80 (HTTP), 443 (HTTPS), 22 (SSH from your IP) |
| Backend API | 8080 from Frontend VM's security group, 22 from your IP |
| Database | 5432 from Backend VM's security group, 22 from your IP |

## 2. Configure inventory

Edit `deploy/ansible/inventory.ini` — replace the placeholder IPs:

```ini
[web]
frontend ansible_host=1.2.3.4 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/buildersnetwork.pem

[api]
backend  ansible_host=5.6.7.8 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/buildersnetwork.pem

[db]
database ansible_host=9.10.11.12 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/buildersnetwork.pem
```

## 3. Vault secrets

Create a vault file for secrets:

```bash
ansible-vault create deploy/ansible/group_vars/vault.yml
```

Add:

```yaml
postgres_password: "strong_random_password"
better_auth_secret: "min_32_chars_random_secret"
anthropic_api_key: "sk-ant-..."
```

## 4. Build the API image

```bash
docker build -f deploy/Dockerfile.api -t buildersnetwork-api:latest .
```

Then push to a registry the EC2 instances can pull from (ECR, Docker Hub, or transfer the image manually):

```bash
# Example: save and transfer (for class demo without a registry)
docker save buildersnetwork-api:latest | gzip > buildersnetwork-api.tar.gz
scp -i ~/.ssh/buildersnetwork.pem buildersnetwork-api.tar.gz ubuntu@<BACKEND_EC2_IP>:~/
# On the backend VM: docker load < buildersnetwork-api.tar.gz
```

## 5. Build the frontend

```bash
# Set the backend API URL for the SPA
VITE_API_URL=http://<BACKEND_EC2_IP>:8080 pnpm build:frontend
```

> **Note:** If the frontend and backend are behind a shared domain/load balancer, set `VITE_API_URL` to that URL instead.

## 6. Deploy

```bash
cd deploy/ansible
ansible-playbook -i inventory.ini playbooks/site.yml --ask-vault-pass
```

Or deploy each tier individually:

```bash
ansible-playbook -i inventory.ini playbooks/db.yml --ask-vault-pass   # Postgres first
ansible-playbook -i inventory.ini playbooks/api.yml --ask-vault-pass  # then API
ansible-playbook -i inventory.ini playbooks/web.yml --ask-vault-pass  # then nginx
```

## 7. Verify

```bash
curl http://<FRONTEND_EC2_IP>/          # landing page HTML
curl http://<BACKEND_EC2_IP>:8080/healthz  # {"ok":true,...}
```

## Environment variables reference

Set in `deploy/ansible/group_vars/api.yml` (non-secret) and `vault.yml` (secret):

| Variable | Where | Description |
|---|---|---|
| `APP_URL` | api.yml | Public URL of the app (from frontend VM) |
| `DATABASE_URL` | auto-built from vault | Constructed from db host + vault password |
| `BETTER_AUTH_SECRET` | vault | Min 32 chars |
| `ANTHROPIC_API_KEY` | vault | Required when `AI_PROVIDER=anthropic` |
| `SERVE_STATIC` | api.yml | Must be `false` for 3-tier |
| `AI_PROVIDER` | api.yml | `anthropic` for EC2 deployment |

## Redeploying after code changes

```bash
# Rebuild and transfer image
docker build -f deploy/Dockerfile.api -t buildersnetwork-api:latest .
# ... push/transfer to backend VM
ansible-playbook -i inventory.ini playbooks/api.yml --ask-vault-pass
```

## Redeploying after frontend changes

```bash
VITE_API_URL=http://<BACKEND_EC2_IP>:8080 pnpm build:frontend
ansible-playbook -i inventory.ini playbooks/web.yml --ask-vault-pass
```
