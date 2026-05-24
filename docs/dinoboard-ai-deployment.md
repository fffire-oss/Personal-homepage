# DinoBoard AI Deployment

Gem Table uses DinoBoard as the Splendor Smart AI framework.

## Frontend Contract

- Default API base is `/api/dinoboard`.
- Local testing can override it with `?dinoboardApi=http://localhost:8001`.
- Production should use the same-origin `/api/dinoboard` route. Do not commit raw production network addresses, cookies, SSH paths, account names, or other private deployment values.
- DinoBoard smart AI is assigned only on 2-player tables.
- If multiple seats use AI takeover, the first selected AI seat uses DinoBoard and the other AI seats use random legal AI.
- In 3-player and 4-player tables, AI takeover uses random legal AI.

## DinoBoard Runtime

Deploy DinoBoard as a private local service. Replace `<dinoboard-root>` with the local checkout path on the target machine; do not commit the real production path if it is private.

```bash
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev python3-venv python3-setuptools fail2ban

cd <dinoboard-root>
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip setuptools wheel
.venv/bin/python -m pip install fastapi "uvicorn[standard]" pybind11 numpy onnxruntime
.venv/bin/python -m pip install -e . --no-build-isolation --no-deps
cd platform
../.venv/bin/uvicorn app:app --host localhost --port 8001 --workers 1 --proxy-headers --forwarded-allow-ips=localhost
```

The service must not expose an independent public port. For inference-only deploys, install only the runtime dependencies above; do not install training-only packages such as PyTorch unless training is needed on the server.

## systemd

```ini
[Unit]
Description=DinoBoard AI
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=dinoboard
Group=dinoboard
WorkingDirectory=<dinoboard-root>/platform
Environment=PYTHONUNBUFFERED=1
ExecStart=<dinoboard-root>/.venv/bin/uvicorn app:app --host localhost --port 8001 --workers 1 --proxy-headers --forwarded-allow-ips=localhost
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Caddy

Serve the homepage through a domain and add the same-origin reverse proxy. Replace `<your-domain>` and `<site-root>` with deployment-local values.

```caddy
https://<your-domain> {
    root * <site-root>
    file_server

    handle_path /api/dinoboard/* {
        reverse_proxy localhost:8001
    }
}
```

If the domain site is already defined elsewhere, add only the handler:

```caddy
handle_path /api/dinoboard/* {
    reverse_proxy localhost:8001
}
```

The public endpoint becomes:

```bash
curl https://<your-domain>/api/dinoboard/api/games/available
```

## Verification

```bash
curl http://localhost:8001/api/games/available
curl https://<your-domain>/api/dinoboard/api/games/available
systemctl status dinoboard-ai --no-pager
systemctl status caddy --no-pager
fail2ban-client status dinoboard-ai
```

## Rate Limiting

Rate limiting is applied before AI inference:

- `/ai/sessions`: 10 requests per client per 10 minutes.
- `/ai/sessions/*/decide`: 30 requests per client per minute.
- `/ai/sessions/*/observe`: 120 requests per client per minute.
- Global AI API: 180 requests per client per minute.
- Expert 20,000-sim `/decide`: 20 requests per client per 10 minutes.

When a request exceeds a limit, DinoBoard returns `429 Too Many Requests` with a `Retry-After` header and logs:

```text
RATE_LIMIT client=<client_key> route=<path> limit=<limit_name>
```

For high-strength expert decisions, DinoBoard also serializes 20,000-sim `/decide` work inside the process so concurrent heavy requests wait for a slot instead of running in parallel.

## fail2ban

Use fail2ban as a temporary abuse ban layer over the application logs:

```ini
[dinoboard-ai]
enabled = true
backend = systemd
journalmatch = _SYSTEMD_UNIT=dinoboard-ai.service
filter = dinoboard-ai
maxretry = 30
findtime = 10m
bantime = 30m
port = 80,443
```

Filter:

```ini
[Definition]
failregex = RATE_LIMIT client=<HOST> route=.* limit=.*
ignoreregex =
```

Manual unban:

```bash
sudo fail2ban-client set dinoboard-ai unbanip <client-address>
```

## AI Strength Tiers

Splendor 2P uses the DinoBoard `web` profiles:

- Casual: 800 simulations.
- Balanced: 5,000 simulations.
- Expert: 20,000 simulations.

These are server-side profiles. The browser sends only the coarse strength alias and cannot set raw simulation counts.
