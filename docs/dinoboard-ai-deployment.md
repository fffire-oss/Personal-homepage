# DinoBoard AI Deployment

Gem Table uses DinoBoard as the Splendor Smart AI framework.

## Frontend Contract

- Default API base is `/api/dinoboard`.
- Local testing can override it with `?dinoboardApi=http://127.0.0.1:8001`.
- DinoBoard smart AI is assigned only on 2-player tables.
- If multiple seats use AI takeover, the first selected AI seat uses DinoBoard and the other AI seats use random legal AI.
- In 3-player and 4-player tables, AI takeover uses random legal AI.

## DinoBoard Runtime

Deploy DinoBoard as a private local service on the server:

```bash
cd /opt/dinoboard-ai/DinoBoard
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
pip install -e .
cd platform
uvicorn app:app --host 127.0.0.1 --port 8001 --workers 1 --proxy-headers --forwarded-allow-ips=127.0.0.1
```

The service must not expose an independent public port.

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
WorkingDirectory=/opt/dinoboard-ai/DinoBoard/platform
Environment=PYTHONUNBUFFERED=1
ExecStart=/opt/dinoboard-ai/DinoBoard/.venv/bin/uvicorn app:app --host 127.0.0.1 --port 8001 --workers 1 --proxy-headers --forwarded-allow-ips=127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Caddy

Add the same-origin reverse proxy to the homepage site:

```caddy
handle_path /api/dinoboard/* {
    reverse_proxy 127.0.0.1:8001
}
```

The public endpoint becomes:

```bash
curl https://zephyrlabs.cloud/api/dinoboard/api/games/available
```

## Rate Limiting

Rate limiting is applied before AI inference:

- `/ai/sessions`: 10 requests per IP per 10 minutes.
- `/ai/sessions/*/decide`: 30 requests per IP per minute.
- `/ai/sessions/*/observe`: 120 requests per IP per minute.
- Global AI API: 180 requests per IP per minute.
- Expert 20,000-sim `/decide`: 20 requests per IP per 10 minutes.

When a request exceeds a limit, DinoBoard returns `429 Too Many Requests` with a `Retry-After` header and logs:

```text
RATE_LIMIT ip=<client_ip> route=<path> limit=<limit_name>
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
failregex = RATE_LIMIT ip=<HOST> route=.* limit=.*
ignoreregex =
```

Manual unban:

```bash
sudo fail2ban-client set dinoboard-ai unbanip <ip>
```

## AI Strength Tiers

Splendor 2P uses the DinoBoard `web` profiles:

- Casual: 800 simulations.
- Balanced: 5,000 simulations.
- Expert: 20,000 simulations.

These are server-side profiles. The browser sends only the coarse strength alias and cannot set raw simulation counts.
