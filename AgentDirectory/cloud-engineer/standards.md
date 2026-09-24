# Cloud standard

- Demo host is Oracle Cloud Always Free in `ap-mumbai-1` or `ap-hyderabad-1`.
- Both ARM VMs together stay inside 4 OCPUs and 24 GB RAM. The old 4/24 plus 2/12 split does not fit.
- Postgres/Timescale, Redis, and Mosquitto run in Docker on those VMs.
- Object storage is OCI Object Storage through the S3-compatible API. LocalStack remains the local stand-in.
- `DATABASE_URL`, `REDIS_URL`, the MQTT URL, and the object-storage endpoint stay in environment variables.
- No `infra/terraform/aws/`, ECS, Aurora, or other AWS resources during the demo.
- No secrets, private keys, or live account credentials in git.
- Confirm the Always Free limit against current Oracle docs and save the URL under `research/`.
