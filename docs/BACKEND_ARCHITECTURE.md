# Backend Integration & Microservices Architecture
## Ophthalmic Surgical Simulator - Technical Specification

---

## Executive Summary

This document outlines the integration strategy for 7 external GitHub libraries into a microservices-based backend architecture, optimized for real-time biofeedback, leaderboard functionality, and dynamic training matrix support.

---

## I. SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Radial    │  │    Apex     │  │  Real-time  │  │    Simulator Canvas     │ │
│  │  Dashboard  │  │   League    │  │   Gauges    │  │   (WebGL/Canvas API)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
└─────────┼────────────────┼────────────────┼─────────────────────┼───────────────┘
          │                │                │                     │
          ▼                ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Kong/Nginx)                               │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  • Rate Limiting  • JWT Auth  • Load Balancing  • Request Routing          │ │
│  │  • WebSocket Upgrade  • gRPC-Web Proxy  • SSL Termination                  │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                             │
│         ┌──────────────────────────┼──────────────────────────┐                 │
│         ▼                          ▼                          ▼                 │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐           │
│  │  REST API   │           │  WebSocket  │           │    gRPC     │           │
│  │  /api/v1/*  │           │   /ws/*     │           │  :50051     │           │
│  └─────────────┘           └─────────────┘           └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE MESH (Istio/Linkerd)                              │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  • mTLS  • Service Discovery  • Circuit Breaker  • Retry Logic             │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   PROCESSING    │       │    ANALYTICS    │       │     STORAGE     │
│   SERVICES      │       │    SERVICES     │       │    SERVICES     │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## II. MICROSERVICES SPECIFICATION (7 Core Services)

### Service 1: Tremor Analysis Service (TAS)
**Repository**: `ophthalmo-tremor-analyzer`  
**Language**: Python 3.11 + C++ Extensions (NumPy/SciPy)  
**Port**: 8001

```yaml
# docker-compose.tremor.yml
tremor-service:
  image: ophthalmo/tremor-analyzer:latest
  build:
    context: ./services/tremor
    dockerfile: Dockerfile
  ports:
    - "8001:8001"
  environment:
    - REDIS_URL=redis://cache:6379
    - DB_URL=postgresql://db:5432/tremor_data
  resources:
    limits:
      cpus: '2'
      memory: 2G
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
    interval: 10s
    timeout: 5s
    retries: 3
```

**API Endpoints**:
```
POST   /api/v1/tremor/analyze
GET    /api/v1/tremor/session/{session_id}
GET    /api/v1/tremor/waveform/{session_id}?resolution=high
WS     /ws/v1/tremor/stream/{session_id}
```

**Response Schema**:
```json
{
  "session_id": "uuid-v4",
  "timestamp": "2025-11-30T18:00:00Z",
  "analysis": {
    "stability_score": 98.7,
    "tremor_frequency_hz": 8.5,
    "amplitude_mm": 0.12,
    "classification": "physiological",
    "waveform_data": {
      "samples": 1000,
      "sample_rate_hz": 120,
      "values": [...]
    }
  },
  "metrics": {
    "processing_time_ms": 12,
    "confidence": 0.95
  }
}
```

---

### Service 2: Force Quantification Service (FQS)
**Repository**: `ophthalmo-force-quant`  
**Language**: C++ with Python bindings (pybind11)  
**Port**: 8002

**API Endpoints**:
```
POST   /api/v1/force/quantify
GET    /api/v1/force/gradient/{session_id}
POST   /api/v1/force/calibrate
WS     /ws/v1/force/realtime/{session_id}
```

**Response Schema**:
```json
{
  "session_id": "uuid-v4",
  "force_analysis": {
    "current_force_gf": 2.4,
    "peak_force_gf": 3.8,
    "average_force_gf": 2.1,
    "force_gradient": [
      {"t": 0, "f": 0.5},
      {"t": 100, "f": 2.4}
    ],
    "risk_level": "safe",
    "tissue_stress_estimate": 0.15
  }
}
```

---

### Service 3: Score Calculation Engine (SCE)
**Repository**: `ophthalmo-score-engine`  
**Language**: Rust (high performance) with gRPC  
**Port**: 8003 (HTTP) / 50051 (gRPC)

**gRPC Service Definition**:
```protobuf
syntax = "proto3";

package ophthalmosim.scoring;

service ScoringEngine {
  rpc CalculateModuleScore(ModuleScoreRequest) returns (ModuleScoreResponse);
  rpc GetLeaderboardRank(RankRequest) returns (RankResponse);
  rpc StreamLiveScore(stream ScoreUpdate) returns (stream ScoreResult);
}

message ModuleScoreRequest {
  string session_id = 1;
  string module_id = 2;
  repeated MetricValue metrics = 3;
}

message ModuleScoreResponse {
  float overall_score = 1;
  map<string, float> component_scores = 2;
  string grade = 3;
  int32 percentile = 4;
}
```

---

### Service 4: Leaderboard Service (LBS)
**Repository**: `ophthalmo-leaderboard`  
**Language**: Go (high concurrency)  
**Port**: 8004

**Architecture**:
```
┌─────────────────────────────────────────────────────┐
│              LEADERBOARD SERVICE                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           Go Application Server              │    │
│  │  • Gin Framework  • goroutines (10K+)       │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│       ┌────────────┴────────────┐                   │
│       ▼                         ▼                   │
│  ┌─────────┐              ┌─────────┐               │
│  │  Redis  │              │ Postgres │              │
│  │ (Cache) │              │ (Persist)│              │
│  │ <50ms   │              │ (Source) │              │
│  └─────────┘              └─────────┘               │
└─────────────────────────────────────────────────────┘
```

**API Endpoints**:
```
GET    /api/v1/leaderboard/global?limit=100&offset=0
GET    /api/v1/leaderboard/module/{module_id}
GET    /api/v1/leaderboard/user/{user_id}/rank
POST   /api/v1/leaderboard/submit
GET    /api/v1/leaderboard/team/{team_id}
```

**Redis Caching Strategy**:
```go
// Leaderboard caching with sorted sets
type LeaderboardCache struct {
    client *redis.Client
    ttl    time.Duration
}

func (lc *LeaderboardCache) GetTopN(moduleID string, n int) ([]RankEntry, error) {
    key := fmt.Sprintf("lb:%s:top", moduleID)
    
    // Try cache first (Target: <10ms)
    entries, err := lc.client.ZRevRangeWithScores(ctx, key, 0, int64(n-1)).Result()
    if err == nil && len(entries) > 0 {
        return parseEntries(entries), nil
    }
    
    // Cache miss - fetch from DB and populate
    return lc.refreshCache(moduleID, n)
}
```

---

### Service 5: Session Management Service (SMS)
**Repository**: `ophthalmo-session-mgr`  
**Language**: Node.js (TypeScript)  
**Port**: 8005

**API Endpoints**:
```
POST   /api/v1/session/create
GET    /api/v1/session/{session_id}
PUT    /api/v1/session/{session_id}/state
DELETE /api/v1/session/{session_id}
POST   /api/v1/session/{session_id}/checkpoint
```

---

### Service 6: Biofeedback Aggregator (BFA)
**Repository**: `ophthalmo-biofeedback`  
**Language**: Python + asyncio  
**Port**: 8006

**Real-time WebSocket Protocol**:
```json
{
  "type": "biofeedback_frame",
  "timestamp": 1701367200000,
  "data": {
    "tremor": {"value": 0.08, "unit": "mm"},
    "force": {"value": 2.1, "unit": "gf"},
    "angle": {"value": 45.2, "unit": "deg"},
    "stability": {"value": 94.5, "unit": "%"}
  },
  "alerts": [
    {"level": "warning", "message": "Tremor increasing"}
  ]
}
```

---

### Service 7: Analytics & Reporting Service (ARS)
**Repository**: `ophthalmo-analytics`  
**Language**: Python (Pandas/NumPy)  
**Port**: 8007

**API Endpoints**:
```
GET    /api/v1/analytics/user/{user_id}/progress
GET    /api/v1/analytics/user/{user_id}/trends
POST   /api/v1/analytics/report/generate
GET    /api/v1/analytics/cohort/{cohort_id}/comparison
```

---

## III. DATA FLOW ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                   │
└──────────────────────────────────────────────────────────────────────────────┘

    SIMULATOR INPUT                    PROCESSING                      OUTPUT
    ═══════════════               ════════════════════            ══════════════
    
    ┌─────────────┐              ┌─────────────────────┐         ┌────────────┐
    │   Pointer   │──────┐      │   Tremor Analysis   │────────▶│  Waveform  │
    │   Events    │      │      │      Service        │         │   Display  │
    └─────────────┘      │      └─────────────────────┘         └────────────┘
                         │                 │
    ┌─────────────┐      │      ┌─────────────────────┐         ┌────────────┐
    │  Pressure   │──────┼─────▶│  Force Quantify     │────────▶│   Force    │
    │   Sensor    │      │      │      Service        │         │   Gauge    │
    └─────────────┘      │      └─────────────────────┘         └────────────┘
                         │                 │
    ┌─────────────┐      │      ┌─────────────────────┐         ┌────────────┐
    │    Tilt     │──────┼─────▶│  Biofeedback        │────────▶│   Angle    │
    │   Sensor    │      │      │   Aggregator        │         │ Indicator  │
    └─────────────┘      │      └─────────────────────┘         └────────────┘
                         │                 │
                         │                 ▼
                         │      ┌─────────────────────┐         ┌────────────┐
                         │      │   Score Calculation │────────▶│   Score    │
                         └─────▶│      Engine         │         │  Display   │
                                └─────────────────────┘         └────────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐         ┌────────────┐
                                │   Leaderboard       │────────▶│   Apex     │
                                │      Service        │         │  League    │
                                └─────────────────────┘         └────────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐         ┌────────────┐
                                │   Analytics &       │────────▶│  Progress  │
                                │   Reporting         │         │  Reports   │
                                └─────────────────────┘         └────────────┘


═══════════════════════════════════════════════════════════════════════════════
                              LATENCY TARGETS
═══════════════════════════════════════════════════════════════════════════════

  Input → Tremor Display:     <30ms  (WebSocket streaming)
  Input → Force Gauge:        <30ms  (WebSocket streaming)
  Score Calculation:          <100ms (POST request)
  Leaderboard Refresh:        <200ms (Cached GET)
  Analytics Report:           <2000ms (Async generation)
```

---

## IV. DATABASE SCHEMA

### PostgreSQL (Primary Data Store)

```sql
-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    module_id VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_module ON sessions(module_id);

-- Raw Telemetry (Time-series optimized)
CREATE TABLE telemetry (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    timestamp_ms BIGINT NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE telemetry_2025_11 PARTITION OF telemetry
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Scores Table
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    module_id VARCHAR(50) NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    component_scores JSONB NOT NULL,
    percentile INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_leaderboard ON scores(module_id, overall_score DESC);
CREATE INDEX idx_scores_user ON scores(user_id, created_at DESC);

-- Leaderboard Materialized View (for fast queries)
CREATE MATERIALIZED VIEW leaderboard_global AS
SELECT 
    u.id as user_id,
    u.display_name,
    s.module_id,
    MAX(s.overall_score) as best_score,
    COUNT(*) as attempts,
    ROW_NUMBER() OVER (PARTITION BY s.module_id ORDER BY MAX(s.overall_score) DESC) as rank
FROM scores s
JOIN users u ON s.user_id = u.id
GROUP BY u.id, u.display_name, s.module_id;

CREATE UNIQUE INDEX idx_leaderboard_global ON leaderboard_global(module_id, user_id);

-- Refresh strategy (every 5 minutes)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
```

### Redis (Caching Layer)

```
# Key Patterns

# Real-time session data (TTL: session duration + 1hr)
session:{session_id}:state          -> Hash (current state)
session:{session_id}:telemetry      -> Stream (real-time data)

# Leaderboard caches (TTL: 5 minutes)
lb:global:top100                    -> Sorted Set
lb:module:{module_id}:top100        -> Sorted Set
lb:user:{user_id}:ranks             -> Hash

# Rate limiting
rate:api:{ip}:{endpoint}            -> String (counter)

# User presence
presence:{user_id}                  -> String (TTL: 30s)
```

---

## V. KUBERNETES DEPLOYMENT

### Namespace & Resource Quotas

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ophthalmo-sim
  labels:
    name: ophthalmo-sim
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: ophthalmo-sim
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.cpu: "40"
    limits.memory: 80Gi
```

### Service Deployment Template

```yaml
# k8s/tremor-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tremor-service
  namespace: ophthalmo-sim
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tremor-service
  template:
    metadata:
      labels:
        app: tremor-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8001"
    spec:
      containers:
      - name: tremor-service
        image: ophthalmo/tremor-analyzer:v1.2.0
        ports:
        - containerPort: 8001
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2000m"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: url
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: postgres-credentials
              key: url
---
apiVersion: v1
kind: Service
metadata:
  name: tremor-service
  namespace: ophthalmo-sim
spec:
  selector:
    app: tremor-service
  ports:
  - port: 8001
    targetPort: 8001
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: tremor-service-hpa
  namespace: ophthalmo-sim
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: tremor-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## VI. CI/CD PIPELINE

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy Microservices

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ophthalmo

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [tremor, force, score, leaderboard, session, biofeedback, analytics]
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Tests
        run: |
          cd services/${{ matrix.service }}
          make test
          
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./services/${{ matrix.service }}/coverage.xml

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    strategy:
      matrix:
        service: [tremor, force, score, leaderboard, session, biofeedback, analytics]
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./services/${{ matrix.service }}
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}:${{ github.sha }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name ophthalmo-cluster
        
      - name: Deploy to Kubernetes
        run: |
          for service in tremor force score leaderboard session biofeedback analytics; do
            kubectl set image deployment/${service}-service \
              ${service}-service=${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${service}:${{ github.sha }} \
              -n ophthalmo-sim
          done
          
      - name: Verify deployment
        run: |
          kubectl rollout status deployment -n ophthalmo-sim --timeout=300s
```

---

## VII. OBSERVABILITY STACK

### Prometheus Metrics

```yaml
# prometheus/rules.yaml
groups:
- name: ophthalmo-sim-alerts
  rules:
  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.05
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected on {{ $labels.service }}"
      description: "95th percentile latency is {{ $value }}s (threshold: 50ms)"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "High error rate on {{ $labels.service }}"
      
  - alert: LeaderboardCacheMissHigh
    expr: rate(redis_cache_misses_total{service="leaderboard"}[5m]) > 100
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High cache miss rate on leaderboard service"
```

### Grafana Dashboard JSON

```json
{
  "dashboard": {
    "title": "Ophthalmo-Sim Performance",
    "panels": [
      {
        "title": "Request Latency (p95)",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))",
            "legendFormat": "{{ service }}"
          }
        ]
      },
      {
        "title": "Leaderboard Response Time",
        "type": "gauge",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service='leaderboard',endpoint='/api/v1/leaderboard/global'}[5m]))",
            "legendFormat": "p95 Latency"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 0.1},
                {"color": "red", "value": 0.2}
              ]
            },
            "unit": "s",
            "max": 0.5
          }
        }
      }
    ]
  }
}
```

---

## VIII. DEPENDENCY MATRIX

| Service | Language | Key Dependencies | License | CVE Status |
|---------|----------|------------------|---------|------------|
| Tremor Analysis | Python 3.11 | NumPy 1.26, SciPy 1.11, Cython 3.0 | BSD-3 | ✅ Clear |
| Force Quantification | C++17/Python | pybind11 2.11, Eigen 3.4 | BSD-3/MPL2 | ✅ Clear |
| Score Calculation | Rust 1.74 | tokio 1.34, tonic 0.10 | MIT/Apache | ✅ Clear |
| Leaderboard | Go 1.21 | gin 1.9, go-redis 9.3 | MIT | ✅ Clear |
| Session Mgmt | Node.js 20 | Express 4.18, Socket.io 4.7 | MIT | ✅ Clear |
| Biofeedback | Python 3.11 | asyncio, aiohttp 3.9 | Apache-2.0 | ✅ Clear |
| Analytics | Python 3.11 | Pandas 2.1, NumPy 1.26 | BSD-3 | ✅ Clear |

---

## IX. PERFORMANCE KPIs & TARGETS

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Real-time Feedback Latency | <50ms | WebSocket round-trip timing |
| Leaderboard Refresh | <200ms | API response time (p95) |
| Score Calculation | <100ms | gRPC call duration |
| Concurrent Users | 10,000 | Load test (k6) |
| Cache Hit Rate | >95% | Redis metrics |
| Service Availability | 99.9% | Uptime monitoring |
| Error Rate | <0.1% | Prometheus metrics |

---

## X. IMPLEMENTATION TIMELINE

```
PHASE 1 (Week 1-2): Infrastructure Setup
├── Set up Kubernetes cluster
├── Configure CI/CD pipelines
├── Deploy PostgreSQL & Redis
└── Set up observability stack

PHASE 2 (Week 3-4): Core Services
├── Deploy Tremor Analysis Service
├── Deploy Force Quantification Service
├── Deploy Score Calculation Engine
└── Integration testing

PHASE 3 (Week 5-6): Supporting Services
├── Deploy Leaderboard Service
├── Deploy Session Management
├── Deploy Biofeedback Aggregator
└── Deploy Analytics Service

PHASE 4 (Week 7-8): Integration & Optimization
├── Frontend integration
├── Performance optimization
├── Load testing
└── Security audit

PHASE 5 (Week 9-10): Production Readiness
├── Documentation completion
├── Runbook creation
├── Disaster recovery testing
└── Production deployment
```

---

## APPENDIX A: API GATEWAY CONFIGURATION (Kong)

```yaml
# kong.yaml
_format_version: "3.0"

services:
  - name: tremor-service
    url: http://tremor-service:8001
    routes:
      - name: tremor-api
        paths:
          - /api/v1/tremor
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 1000
          policy: redis
      - name: jwt
      - name: cors
        config:
          origins: ["*"]
          methods: ["GET", "POST", "PUT", "DELETE"]
          headers: ["Authorization", "Content-Type"]

  - name: leaderboard-service
    url: http://leaderboard-service:8004
    routes:
      - name: leaderboard-api
        paths:
          - /api/v1/leaderboard
    plugins:
      - name: rate-limiting
        config:
          minute: 5000
      - name: proxy-cache
        config:
          response_code: [200]
          request_method: ["GET"]
          content_type: ["application/json"]
          cache_ttl: 30
          strategy: memory
```

---

**Document Version**: 1.0  
**Last Updated**: November 30, 2025  
**Author**: Backend Architecture Team
