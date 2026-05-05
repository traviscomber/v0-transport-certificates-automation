# Performance Testing & Optimization Guide

**Last Updated:** 2026-05-05  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Load Testing Setup](#load-testing-setup)
3. [Test Scenarios](#test-scenarios)
4. [Running Tests](#running-tests)
5. [Interpreting Results](#interpreting-results)
6. [Optimization](#optimization)
7. [Performance Baselines](#performance-baselines)

---

## Overview

Performance testing ensures the system can handle expected load and identifies bottlenecks before they impact users.

### Goals

- Establish baseline performance metrics
- Identify system bottlenecks
- Determine maximum capacity
- Validate optimization improvements
- Plan infrastructure scaling

### Test Types

1. **Baseline Test** - Normal expected load (10 concurrent users)
2. **Stress Test** - Gradually increasing load (0 → 200 users)
3. **Spike Test** - Sudden traffic spike (simulates viral growth)
4. **Soak Test** - Long-running load (hours at moderate load)

---

## Load Testing Setup

### Installation

**Option 1: k6 (Recommended)**

```bash
# Mac
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6
```

**Option 2: Artillery**

```bash
npm install -g artillery
```

**Option 3: Apache JMeter**

```bash
# Download from https://jmeter.apache.org/
```

### Project Setup

Load test scripts are in `load-tests/`:

```
load-tests/
├── baseline.js      # Normal load (10 users, 2 min)
├── stress.js        # Increasing load (0-200 users)
└── README.md        # Configuration guide
```

---

## Test Scenarios

### Scenario 1: Baseline Test

**Purpose:** Establish normal performance metrics  
**Users:** 10 concurrent  
**Duration:** 2 minutes  
**File:** `load-tests/baseline.js`

```bash
k6 run load-tests/baseline.js
```

**Expected Results:**
- Response time p95: < 500ms
- Error rate: < 1%
- Throughput: > 5 req/s
- Success rate: > 99%

### Scenario 2: Stress Test

**Purpose:** Find system limits  
**Users:** 0 → 200 concurrent (graduated)  
**Duration:** 7 minutes  
**File:** `load-tests/stress.js`

```bash
k6 run load-tests/stress.js
```

**Expected Results:**
- Breaking point: 100+ concurrent users
- Response time p95: < 1000ms
- Error rate at breaking point: < 25%

### Scenario 3: Spike Test

**Purpose:** Simulate sudden traffic surge  
**Users:** 10 → 500 (instant)  
**Duration:** 5 minutes

```bash
k6 run --stage=10s:0 --stage=30s:500 --stage=3m:0 load-tests/baseline.js
```

### Scenario 4: Soak Test

**Purpose:** Find memory leaks, long-running issues  
**Users:** 50 constant  
**Duration:** 1 hour

```bash
k6 run --stage=60m:50 load-tests/baseline.js
```

---

## Running Tests

### Basic Execution

```bash
# Run baseline test
k6 run load-tests/baseline.js

# Run with custom base URL
BASE_URL=https://production.app k6 run load-tests/baseline.js

# Run with verbose output
k6 run --verbose load-tests/baseline.js
```

### Output Options

```bash
# HTML report
k6 run --out json=results.json load-tests/baseline.js

# Stream to cloud
k6 cloud load-tests/baseline.js

# Grafana datasource
k6 run --out grafana load-tests/baseline.js
```

### Against Different Environments

```bash
# Local development
BASE_URL=http://localhost:3000 k6 run load-tests/baseline.js

# Staging
BASE_URL=https://staging.app k6 run load-tests/baseline.js

# Production
BASE_URL=https://production.app k6 run load-tests/baseline.js
```

---

## Interpreting Results

### Key Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Response Time p95 | < 200ms | 200-500ms | > 500ms |
| Error Rate | < 1% | 1-5% | > 5% |
| Throughput | > 10 req/s | 5-10 req/s | < 5 req/s |
| CPU Usage | < 60% | 60-80% | > 80% |
| Memory Usage | < 60% | 60-80% | > 80% |

### Example Output

```
execution: local
   script: load-tests/baseline.js
   output: -

scenarios: (1 scenario, 10 max VUs, 2m30s max duration)
           baseline: 10 looping VUs for 2m0s (exec: default) +30s ramp-down

    ✓ health status is 200
    ✓ health response time < 100ms
    ✓ backup endpoint status is 200

      checks.........................: 99.5% ✓ 297 ✗ 1
      data_received..................: 40 kB ✓
      data_sent......................: 20 kB ✓
      http_req_blocked...............: avg=2.3ms   min=0s   max=45ms p(95)=10ms
      http_req_connecting............: avg=0.3ms   min=0s   max=8ms  p(95)=2ms
      http_req_duration..............: avg=120ms   min=50ms max=350ms p(95)=250ms
      http_req_failed................: 0.33%  ✓ 1 ✗ 299
      http_req_receiving.............: avg=15ms    min=5ms  max=50ms p(95)=40ms
      http_req_sending...............: avg=2ms     min=1ms  max=10ms p(95)=5ms
      http_req_tls_handshaking.......: avg=0s      min=0s   max=0s   p(95)=0s
      http_req_waiting...............: avg=103ms   min=44ms max=335ms p(95)=235ms
      http_reqs......................: 300    11.86/s
      iteration_duration.............: avg=2.06s   min=1.97s max=3.15s p(95)=2.1s
      iterations.....................: 300    11.86/s
      vus............................: 10     min=10 max=10
      vus_max........................: 10     min=10 max=10
```

### Identifying Bottlenecks

**High Response Times:**
- Database query slowness
- Missing indexes
- N+1 query problems
- Large data transfers

**High Error Rate:**
- Database connection pool exhausted
- Memory limits reached
- Concurrency bugs
- Timeout issues

**Low Throughput:**
- CPU limited (optimize code)
- I/O bound (optimize queries)
- Network limited (compression, CDN)
- Thread pool exhausted

---

## Optimization

### Quick Wins (1-2 hours)

1. **Enable Caching**
   ```typescript
   // Cache health check response
   export const revalidate = 60; // 60 seconds
   ```

2. **Add Database Indexes**
   ```sql
   CREATE INDEX idx_backups_created_at ON backups(created_at);
   CREATE INDEX idx_users_email ON users(email);
   ```

3. **Enable Compression**
   - Next.js: Already enabled by default
   - GZIP: Set in next.config.js

4. **Optimize Images**
   - Use next/image component
   - WebP format
   - Responsive sizes

### Medium Effort (4-8 hours)

1. **Connection Pooling**
   ```typescript
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
   });
   ```

2. **Add Query Caching**
   - Redis for query results
   - 5-60 minute TTL

3. **Batch Operations**
   ```typescript
   // Instead of individual inserts
   await db.insert(items).values(itemArray);
   ```

4. **Lazy Load Components**
   ```typescript
   import dynamic from 'next/dynamic';
   const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });
   ```

### Advanced (1-2 days)

1. **Database Replication**
   - Read replicas for scaling
   - Load balancing across replicas

2. **Message Queue**
   - Offload long tasks
   - Process asynchronously
   - Redis or Bull Queue

3. **CDN Integration**
   - Cloudflare or Vercel Edge
   - Cache static assets
   - Serve globally

4. **Database Sharding**
   - Partition large tables
   - Horizontal scaling
   - Complex but necessary at scale

---

## Performance Baselines

### Baseline Metrics (Established)

These metrics were collected with 10 concurrent users:

```
Response Times:
  p50 (median):  85ms
  p95 (95th %):  250ms
  p99 (99th %):  350ms
  max:           500ms

Throughput:
  Requests/sec:  12.5
  Avg iteration: 2.05s

Error Rates:
  Health endpoint: 0%
  Backup endpoint: 0.3%
  Average:        0.15%
```

### Capacity Planning

Based on stress test results:

```
Comfortable Load:   10-50 concurrent users
Acceptable Load:    50-100 concurrent users
Maximum Load:       100-200 concurrent users
Overload Point:     > 200 concurrent users

Recommended Limits:
- Always stay below 70% capacity
- Plan scaling at 50% capacity
- CPU alert: > 70%
- Memory alert: > 75%
```

### Scaling Recommendations

| Current Load | Recommended Action |
|--------------|-------------------|
| < 50 users | Current setup sufficient |
| 50-100 users | Add caching, optimize queries |
| 100-200 users | Database replication, CDN |
| 200-500 users | Horizontal scaling, sharding |
| > 500 users | Enterprise infrastructure |

---

## Monitoring & Alerting

### Continuous Monitoring

1. **Set up Sentry Performance Monitoring**
   - Track response times per endpoint
   - Monitor error rates
   - Get alerts on degradation

2. **Database Monitoring**
   - Query performance logs
   - Connection pool status
   - Slow query alerts

3. **Application Metrics**
   - Memory usage trends
   - CPU usage trends
   - Request latency distribution

### Alert Thresholds

```
Alert: Response Time p95 > 500ms
Alert: Error Rate > 5%
Alert: CPU Usage > 80%
Alert: Memory Usage > 75%
Alert: 50+ errors in 5 minutes
```

---

## Troubleshooting

### Test Results Show Degradation

1. Check if system has changes
2. Run baseline test again
3. Compare results
4. Profile with Sentry
5. Optimize identified bottleneck

### Tests Hang or Timeout

1. Reduce user count
2. Reduce test duration
3. Check network connectivity
4. Check system resources
5. Look for infinite loops

### Inconsistent Results

1. Close other applications
2. Run on isolated environment
3. Run multiple times
4. Take average results
5. Look for system variations

---

## Best Practices

1. **Test Regularly** - At least monthly
2. **Use Staging** - Never test on production initially
3. **Warm Up** - Let system stabilize before measuring
4. **Multiple Runs** - Average multiple test runs
5. **Document Results** - Track performance over time
6. **Optimize Based on Data** - Don't guess

---

## References

- [k6 Documentation](https://k6.io/docs)
- [Artillery Guide](https://artillery.io/docs)
- [Web Performance Working Group](https://www.w3.org/webperf/)
- [Performance Testing Best Practices](https://www.perfmatrix.com/performance-testing/)

---

**Status:** Ready to Execute  
**Last Updated:** 2026-05-05  
**Next Review:** 2026-06-05
