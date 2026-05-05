# Health Check Endpoint

Provides system health status for monitoring and load balancers.

## Endpoint

```
GET /api/health
```

## Response (Healthy)

```json
{
  "status": "healthy",
  "timestamp": "2026-05-05T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "backups": "healthy",
  "checks": {
    "database": { "status": "ok", "responseTime": "45ms" },
    "cache": { "status": "ok", "responseTime": "10ms" },
    "api": { "status": "ok", "responseTime": "120ms" }
  }
}
```

## Response Codes

- **200 OK** - System is healthy
- **206 Partial Content** - System operational but degraded
- **500 Server Error** - System unhealthy

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Overall health: 'healthy', 'degraded', or 'error' |
| timestamp | ISO 8601 | When check was performed |
| uptime | number | Seconds since last restart |
| database | string | Database connection status |
| backups | string | Backup system status |
| checks | object | Individual component health checks |

## Usage

**Load Balancer Health Check:**
```bash
curl -f https://your-app.vercel.app/api/health || exit 1
```

**Monitoring Script:**
```bash
#!/bin/bash
RESPONSE=$(curl -s https://your-app.vercel.app/api/health)
STATUS=$(echo $RESPONSE | jq -r '.status')

if [ "$STATUS" != "healthy" ]; then
  alert "System health degraded: $RESPONSE"
fi
```

**Kubernetes Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

---

**Included in:** Backup verification & disaster recovery setup
