# Storage providers

The app imports the small `StorageProvider` port from `libs/storage`. FlyDrive
2.1 implements its filesystem, S3-compatible, and GCS backends; routes do not
depend on FlyDrive directly. Cloudflare Workers keep using the native `UPLOADS`
R2 binding behind the same port.

## Local development

No storage environment variables or Docker services are required. With
`NODE_ENV=development`, `createStorageFromEnv()` selects FlyDrive's filesystem
driver and persists uploads under:

```text
apps/api/.data/uploads/
```

The directory is created on first write, survives process restarts, and is
gitignored. Set `STORAGE_LOCAL_ROOT` to an absolute or cwd-relative path to
override it. `STORAGE_DRIVER=fs` makes the choice explicit.

`deploy/docker-compose.dev.yml` remains available only for testing the
S3-compatible path against MinIO.

## Node production

Production storage is opt-in. Do not use `STORAGE_DRIVER=fs` inside an
otherwise-stateless Docker container: files written to the container layer are
lost when the container is replaced. A filesystem driver is suitable only when
`STORAGE_LOCAL_ROOT` is explicitly backed by a durable host mount or volume.
The provided production paths instead steer toward object storage:

- `docker-compose.selfhost.yml` includes MinIO backed by the named
  `miniodata` volume.
- The EC2/Ansible path expects an external S3-compatible service, such as AWS
  S3 or MinIO backed by an attached persistent disk.

Set `STORAGE_DRIVER=s3` for Cloudflare R2 over S3, Backblaze B2, AWS S3, or
MinIO:

| Provider | `STORAGE_ENDPOINT` | `STORAGE_REGION` | `STORAGE_FORCE_PATH_STYLE` |
|---|---|---|---|
| Cloudflare R2 | `https://<account_id>.r2.cloudflarestorage.com` | `auto` | `false` |
| Backblaze B2 | `https://s3.<region>.backblazeb2.com` | provider region | `false` |
| AWS S3 | omit | AWS region | `false` |
| MinIO | `http://minio:9000` in the provided Compose network, otherwise its reachable private URL | `us-east-1` | `true` |

Every S3-compatible provider also needs:

```dotenv
STORAGE_DRIVER=s3
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=...
```

Existing deployments that set `STORAGE_BUCKET` but omit `STORAGE_DRIVER`
continue to infer `s3`.

For Google Cloud Storage:

```dotenv
STORAGE_DRIVER=gcs
STORAGE_BUCKET=...
STORAGE_GCS_PROJECT_ID=...       # optional when ADC can infer it
STORAGE_GCS_KEY_FILENAME=...     # optional when ADC is available
```

Set `STORAGE_DRIVER=disabled`, or omit all storage values in production, to
keep uploads dark and return `503` from upload/serve routes.

## Cloudflare Workers

Workers do not read the Node storage variables. `apps/api/src/worker.ts` wraps
the native `UPLOADS` R2 binding with `@myapp/storage/r2`, avoiding S3
credentials and network signing inside the Worker.
