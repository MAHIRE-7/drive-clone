# Kubernetes Deployment Guide - Google Drive Clone

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [CI/CD Pipeline](#cicd-pipeline)
- [File Explanations](#file-explanations)
- [Deployment](#deployment)
- [Monitoring & Operations](#monitoring--operations)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Internet                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (NodePort/LB) │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │    Frontend Service          │
              │    Type: NodePort            │
              │    Port: 80                  │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │    Frontend Pods (Nginx)     │
              │    - Serves React Build      │
              │    - Proxies /api/* → Backend│
              │    - Port: 80                │
              └──────────┬───────────────────┘
                         │
                         │ Internal /api/* requests
                         ▼
              ┌──────────────────────────────┐
              │    Backend Service           │
              │    Type: ClusterIP           │
              │    Port: 5000                │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │    Backend Pods (Node.js)    │
              │    - REST API                │
              │    - JWT Auth                │
              │    - File Upload             │
              │    - Port: 5000              │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │    MongoDB Service           │
              │    Type: ClusterIP           │
              │    Port: 27017               │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │    MongoDB StatefulSet       │
              │    - Database                │
              │    - Persistent Volume       │
              │    - Port: 27017             │
              └──────────────────────────────┘
```

### Network Flow

```
┌─────────┐     HTTP      ┌──────────┐    /api/*    ┌─────────┐    MongoDB    ┌─────────┐
│ Browser │ ────────────> │ Frontend │ ───────────> │ Backend │ ────────────> │ MongoDB │
│         │               │  Nginx   │              │ Node.js │               │         │
└─────────┘               └──────────┘              └─────────┘               └─────────┘
   Public                    Port 80                 Port 5000                Port 27017
                          (NodePort)               (ClusterIP)              (ClusterIP)
```

---

## CI/CD Pipeline

### DevOps Workflow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Developer Workflow                               │
└──────────────────────────────────────────────────────────────────────────┘

1. Code Development
   ├── Developer writes code
   ├── Local testing
   └── Git commit

2. Source Control (GitHub)
   ├── Push to repository
   ├── Create Pull Request
   └── Code Review

3. CI Pipeline (GitHub Actions / Jenkins)
   ├── Trigger on push/PR
   ├── Run tests
   │   ├── Unit tests
   │   ├── Integration tests
   │   └── Linting
   ├── Build Docker images
   │   ├── Frontend: manodayahire/drive-clone-frontend:v3
   │   └── Backend: manodayahire/drive-clone-backend:v1
   └── Push to Docker Hub

4. CD Pipeline (ArgoCD / Flux)
   ├── Detect new image
   ├── Update Kubernetes manifests
   ├── Apply to cluster
   └── Health checks

5. Deployment
   ├── Rolling update
   ├── Zero downtime
   └── Rollback on failure

6. Monitoring
   ├── Prometheus metrics
   ├── Grafana dashboards
   ├── Alert on errors
   └── Log aggregation (ELK)
```

### CI/CD Pipeline Diagram

```
┌─────────┐      ┌─────────┐      ┌──────────┐      ┌────────────┐      ┌──────────┐
│   Git   │ ───> │ GitHub  │ ───> │  Build   │ ───> │   Docker   │ ───> │   K8s    │
│  Commit │      │ Actions │      │  & Test  │      │    Hub     │      │ Cluster  │
└─────────┘      └─────────┘      └──────────┘      └────────────┘      └──────────┘
                      │                  │                  │                  │
                      │                  │                  │                  │
                      ▼                  ▼                  ▼                  ▼
                 Webhook           Unit Tests         Push Images        Rolling Update
                 Trigger           Lint Code          Tag: latest        Health Checks
                                   Build Images       Tag: v1.0.0        Monitor Pods
```

### GitHub Actions Workflow Example

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: |
          manodayahire/drive-clone-frontend:latest
          manodayahire/drive-clone-frontend:${{ github.sha }}
    
    - name: Build and push Backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: |
          manodayahire/drive-clone-backend:latest
          manodayahire/drive-clone-backend:${{ github.sha }}
    
    - name: Update Kubernetes manifests
      run: |
        sed -i 's|image: manodayahire/drive-clone-frontend:.*|image: manodayahire/drive-clone-frontend:${{ github.sha }}|' k8s/frontend-deployment.yml
        sed -i 's|image: manodayahire/drive-clone-backend:.*|image: manodayahire/drive-clone-backend:${{ github.sha }}|' k8s/backend-statefulset.yml
    
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v4
      with:
        manifests: |
          k8s/namespace.yml
          k8s/mongo-statefulset.yml
          k8s/backend-statefulset.yml
          k8s/frontend-deployment.yml
```

### GitOps with ArgoCD

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Git Repo   │ ──────> │   ArgoCD     │ ──────> │  Kubernetes  │
│  (manifests) │  Sync   │   Server     │  Apply  │   Cluster    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │                        │                        │
       ▼                        ▼                        ▼
  YAML files            Detect changes           Deploy pods
  Helm charts           Auto-sync               Health checks
  Kustomize             Rollback                Monitor status
```

---

## File Explanations

### 1. `namespace.yml`
Creates an isolated namespace for the application.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: web-app
```

**Purpose:**
- Isolates resources from other applications
- Provides resource quotas and limits
- Enables RBAC policies per namespace

**Deploy:**
```bash
kubectl apply -f namespace.yml
```

---

### 2. `mongo-statefulset.yml`
Deploys MongoDB with persistent storage.

**Key Components:**

#### StatefulSet
```yaml
kind: StatefulSet
serviceName: "mongo"  # Required for stable network identity
replicas: 1           # Single instance (can be scaled for replica set)
```

**Why StatefulSet?**
- Provides stable, unique network identifiers
- Ordered deployment and scaling
- Persistent storage per pod
- Suitable for databases

#### Container Configuration
```yaml
containers:
- name: mongodb
  image: mongo:7
  env:
    - name: MONGO_INITDB_ROOT_USERNAME
      value: admin
    - name: MONGO_INITDB_ROOT_PASSWORD
      value: admin123
```

#### Persistent Volume
```yaml
volumeClaimTemplates:
- metadata:
    name: mongo-data
  spec:
    accessModes: ["ReadWriteOnce"]
    resources:
      requests:
        storage: 10Gi
```

**Purpose:**
- Data persists even if pod is deleted
- Each pod gets its own volume
- Data survives pod restarts

#### Service
```yaml
kind: Service
type: ClusterIP  # Internal only, not exposed outside cluster
```

**Deploy:**
```bash
kubectl apply -f mongo-statefulset.yml
```

**Verify:**
```bash
kubectl get statefulset -n web-app
kubectl get pvc -n web-app  # Check persistent volume claims
```

---

### 3. `backend-statefulset.yml`
Deploys Node.js backend API.

**Why StatefulSet for Backend?**
- Can scale to multiple replicas
- Each pod can have its own storage for uploads
- Stable network identity for debugging

#### Environment Variables
```yaml
env:
  - name: PORT
    value: "5000"
  - name: MONGODB_URI
    value: mongodb://admin:admin123@mongo-service:27017/drive-clone?authSource=admin
  - name: JWT_SECRET
    value: your_jwt_secret_key_here
  - name: FRONTEND_URL
    value: http://frontend-service:3000
```

**Key Points:**
- `mongo-service` - Uses Kubernetes DNS (service-name.namespace.svc.cluster.local)
- `authSource=admin` - Required for MongoDB authentication
- Secrets should use Kubernetes Secrets in production

#### Resources
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Purpose:**
- `requests` - Guaranteed resources
- `limits` - Maximum allowed
- Prevents resource starvation

#### Service
```yaml
type: ClusterIP  # Internal only
port: 5000
```

**Deploy:**
```bash
kubectl apply -f backend-statefulset.yml
```

**Test:**
```bash
kubectl exec -it backend-statefulset-0 -n web-app -- curl http://localhost:5000/api/auth/profile
```

---

### 4. `frontend-deployment.yml`
Deploys React frontend with Nginx.

**Why Deployment (not StatefulSet)?**
- Stateless application
- No persistent storage needed
- Can scale horizontally easily
- Pods are interchangeable

#### Container Configuration
```yaml
containers:
- name: frontend
  image: manodayahire/drive-clone-frontend:v3
  ports:
  - containerPort: 80  # Nginx listens on port 80
```

**How Frontend Connects to Backend:**

1. **Build Time** (Dockerfile):
   ```dockerfile
   ENV REACT_APP_API_URL=/api
   ```
   - React embeds `/api` as the base URL during build

2. **Runtime** (Browser):
   ```javascript
   // api.js
   const API = axios.create({
     baseURL: process.env.REACT_APP_API_URL  // "/api"
   });
   
   // Makes request to: /api/auth/login
   ```

3. **Nginx Proxy** (nginx.conf):
   ```nginx
   location /api/ {
       proxy_pass http://backend-service:5000/api/;
   }
   ```
   - Intercepts `/api/*` requests
   - Forwards to backend service internally

4. **Backend Receives**:
   - Request arrives at `http://backend-service:5000/api/auth/login`

**Request Flow:**
```
Browser → http://frontend-service/api/auth/login
       → Nginx (port 80)
       → Proxies to http://backend-service:5000/api/auth/login
       → Backend processes request
       → Response back through same path
```

#### Service
```yaml
type: NodePort  # Exposes to outside cluster
port: 80
targetPort: 80
```

**NodePort:**
- Exposes service on each node's IP at a static port (30000-32767)
- Accessible from outside cluster
- For production, use LoadBalancer or Ingress

**Deploy:**
```bash
kubectl apply -f frontend-deployment.yml
```

**Access:**
```bash
# Get NodePort
kubectl get svc frontend-service -n web-app

# Access via
http://<node-ip>:<node-port>
```

---

## Deployment

### Automated Deployment Pipeline

```bash
#!/bin/bash
# deploy.sh - Automated deployment script

set -e

echo "🚀 Starting deployment..."

# 1. Build Docker images
echo "📦 Building Docker images..."
docker build -t manodayahire/drive-clone-frontend:latest ./frontend
docker build -t manodayahire/drive-clone-backend:latest ./backend

# 2. Push to registry
echo "⬆️  Pushing to Docker Hub..."
docker push manodayahire/drive-clone-frontend:latest
docker push manodayahire/drive-clone-backend:latest

# 3. Apply Kubernetes manifests
echo "☸️  Deploying to Kubernetes..."
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/mongo-statefulset.yml
kubectl wait --for=condition=ready pod -l app=mongo -n web-app --timeout=300s

kubectl apply -f k8s/backend-statefulset.yml
kubectl wait --for=condition=ready pod -l app=backend -n web-app --timeout=300s

kubectl apply -f k8s/frontend-deployment.yml
kubectl wait --for=condition=ready pod -l app=frontend -n web-app --timeout=300s

echo "✅ Deployment complete!"
kubectl get pods -n web-app
```

### Manual Deployment Order

```bash
# 1. Create namespace
kubectl apply -f namespace.yml

# 2. Deploy MongoDB (backend needs it)
kubectl apply -f mongo-statefulset.yml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongo -n web-app --timeout=300s

# 3. Deploy Backend
kubectl apply -f backend-statefulset.yml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n web-app --timeout=300s

# 4. Deploy Frontend
kubectl apply -f frontend-deployment.yml
```

---

## Networking Explained

### Service Discovery (DNS)

Kubernetes provides internal DNS:
```
<service-name>.<namespace>.svc.cluster.local
```

**Examples:**
- `mongo-service.web-app.svc.cluster.local` → MongoDB
- `backend-service.web-app.svc.cluster.local` → Backend
- `frontend-service.web-app.svc.cluster.local` → Frontend

**Short form (within same namespace):**
- `mongo-service` → MongoDB
- `backend-service` → Backend

### Service Types

1. **ClusterIP** (Default)
   - Internal only
   - Accessible only within cluster
   - Used for: Backend, MongoDB

2. **NodePort**
   - Exposes on each node's IP
   - Port range: 30000-32767
   - Used for: Frontend (development)

3. **LoadBalancer** (Production)
   - Creates external load balancer
   - Gets external IP
   - Used for: Frontend (production)

---

## Scaling

### Frontend (Stateless)
```bash
kubectl scale deployment frontend-deployment --replicas=3 -n web-app
```

### Backend (Stateful)
```bash
kubectl scale statefulset backend-statefulset --replicas=3 -n web-app
```

### MongoDB (Requires Replica Set Configuration)
```bash
# Don't scale MongoDB without configuring replica set
# Single instance is fine for development
```

---

## Monitoring & Operations

### Full Observability with SigNoz

**SigNoz** provides complete observability with metrics, traces, and logs in a single platform.

```
┌─────────────────────────────────────────────────────────────────┐
│                         SigNoz Platform                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Metrics    │  │    Traces    │  │     Logs     │         │
│  │ (Prometheus) │  │ (OpenTelemetry)│ │  (ClickHouse)│         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │  Unified Query │                          │
│                    │    Engine      │                          │
│                    └───────┬────────┘                          │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │   Dashboard    │                          │
│                    │   & Alerts     │                          │
│                    └────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │
                    ┌───────┴────────┐
                    │  Kubernetes    │
                    │    Cluster     │
                    │                │
                    │  ┌──────────┐  │
                    │  │ Frontend │  │
                    │  │ Backend  │  │
                    │  │ MongoDB  │  │
                    │  └──────────┘  │
                    └────────────────┘
```

### Install SigNoz on Kubernetes

```bash
# Add SigNoz Helm repository
helm repo add signoz https://charts.signoz.io
helm repo update

# Create namespace
kubectl create namespace signoz

# Install SigNoz
helm install signoz signoz/signoz \
  --namespace signoz \
  --set frontend.service.type=LoadBalancer

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=signoz -n signoz --timeout=600s

# Get SigNoz URL
kubectl get svc -n signoz signoz-frontend
```

### Instrument Backend with OpenTelemetry

**Install dependencies:**
```bash
cd backend
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http
```

**Create `tracing.js`:**
```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://signoz-otel-collector.signoz:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'drive-clone-backend',
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

**Update `server.js`:**
```javascript
require('./tracing'); // Add at the very top
require('dotenv').config();
const express = require('express');
// ... rest of the code
```

### Update Backend Deployment

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: backend-statefulset
  namespace: web-app
spec:
  serviceName: "backend-service"
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
      annotations:
        signoz.io/scrape: "true"
        signoz.io/port: "5000"
    spec:
      containers:
      - name: backend
        image: manodayahire/drive-clone-backend:v2
        ports:
        - containerPort: 5000
        env:
          - name: PORT
            value: "5000"
          - name: MONGODB_URI
            value: mongodb://admin:admin123@mongo-service:27017/drive-clone?authSource=admin
          - name: JWT_SECRET
            value: your_jwt_secret_key_here
          - name: FRONTEND_URL
            value: http://frontend-service:3000
          - name: OTEL_EXPORTER_OTLP_ENDPOINT
            value: http://signoz-otel-collector.signoz:4318/v1/traces
          - name: OTEL_SERVICE_NAME
            value: drive-clone-backend
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Instrument Frontend with OpenTelemetry

**Install dependencies:**
```bash
cd frontend
npm install @opentelemetry/api \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/instrumentation-fetch \
  @opentelemetry/instrumentation-xml-http-request \
  @opentelemetry/exporter-trace-otlp-http
```

**Create `src/tracing.js`:**
```javascript
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

const provider = new WebTracerProvider();

const exporter = new OTLPTraceExporter({
  url: process.env.REACT_APP_OTEL_ENDPOINT || 'http://signoz-otel-collector.signoz:4318/v1/traces',
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});
```

**Update `src/index.js`:**
```javascript
import './tracing'; // Add at the very top
import React from 'react';
import ReactDOM from 'react-dom/client';
// ... rest of the code
```

### SigNoz Dashboard Features

**1. Application Metrics**
- Request rate (requests/sec)
- Error rate (%)
- Response time (p50, p90, p99)
- Apdex score

**2. Distributed Tracing**
- End-to-end request flow
- Service dependencies
- Latency breakdown
- Error traces

**3. Logs**
- Structured logs from all services
- Log correlation with traces
- Full-text search
- Log aggregation

**4. Alerts**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: signoz-alerts
  namespace: signoz
data:
  alerts.yaml: |
    alerts:
      - name: High Error Rate
        query: error_rate > 5
        duration: 5m
        severity: critical
        channels:
          - slack
          - email
      
      - name: High Response Time
        query: p99_latency > 1000
        duration: 5m
        severity: warning
        channels:
          - slack
      
      - name: Pod Down
        query: up == 0
        duration: 1m
        severity: critical
        channels:
          - pagerduty
```

### Access SigNoz Dashboard

```bash
# Get SigNoz frontend URL
kubectl get svc signoz-frontend -n signoz

# Port forward for local access
kubectl port-forward svc/signoz-frontend 3301:3301 -n signoz

# Access at: http://localhost:3301
```

### Key Metrics to Monitor

**Backend Metrics:**
- API response time (p50, p95, p99)
- Request throughput (req/sec)
- Error rate (%)
- Database query time
- File upload/download time
- Active connections

**Frontend Metrics:**
- Page load time
- Time to interactive (TTI)
- First contentful paint (FCP)
- API call latency
- JavaScript errors
- User sessions

**Infrastructure Metrics:**
- CPU usage per pod
- Memory usage per pod
- Disk I/O
- Network throughput
- Pod restart count
- Node resource utilization

### Custom Metrics Example

**Backend custom metrics:**
```javascript
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const exporter = new PrometheusExporter({ port: 9464 });
const meterProvider = new MeterProvider();
meterProvider.addMetricReader(exporter);

const meter = meterProvider.getMeter('drive-clone-backend');

// Custom counters
const fileUploadCounter = meter.createCounter('file_uploads_total');
const fileDownloadCounter = meter.createCounter('file_downloads_total');
const userRegistrationCounter = meter.createCounter('user_registrations_total');

// Usage
fileUploadCounter.add(1, { user_id: userId, file_type: fileType });
```

### Logging with SigNoz

**Backend logging:**
```javascript
const winston = require('winston');
const { format } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'drive-clone-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});

// Usage
logger.info('File uploaded', { 
  userId: user.id, 
  fileName: file.name, 
  fileSize: file.size 
});

logger.error('Upload failed', { 
  userId: user.id, 
  error: error.message 
});
```

### SigNoz Query Examples

**1. Average response time by endpoint:**
```
avg(http_server_duration_milliseconds) by (http_route)
```

**2. Error rate:**
```
sum(rate(http_server_requests_total{status=~"5.."}[5m])) / sum(rate(http_server_requests_total[5m])) * 100
```

**3. Top 10 slowest endpoints:**
```
topk(10, avg(http_server_duration_milliseconds) by (http_route))
```

**4. Database query performance:**
```
avg(mongodb_query_duration_milliseconds) by (operation)
```

### Monitoring Commands

### Check Pod Status
```bash
kubectl get pods -n web-app
kubectl describe pod <pod-name> -n web-app
```

### View Logs
```bash
kubectl logs <pod-name> -n web-app
kubectl logs -f <pod-name> -n web-app  # Follow logs
```

### Execute Commands in Pod
```bash
kubectl exec -it <pod-name> -n web-app -- /bin/sh
```

### Test Connectivity
```bash
# From backend to MongoDB
kubectl exec -it backend-statefulset-0 -n web-app -- curl http://mongo-service:27017

# From frontend to backend
kubectl exec -it <frontend-pod> -n web-app -- curl http://backend-service:5000/api/auth/profile
```

### Port Forward (Local Testing)
```bash
# Access backend locally
kubectl port-forward svc/backend-service 5000:5000 -n web-app

# Access frontend locally
kubectl port-forward svc/frontend-service 8080:80 -n web-app
```

---

## Resource Management

### View Resource Usage
```bash
kubectl top pods -n web-app
kubectl top nodes
```

### Resource Quotas (Optional)
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: web-app-quota
  namespace: web-app
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
```

---

## Security Best Practices

### 1. Use Secrets for Sensitive Data
```bash
# Create secret
kubectl create secret generic mongo-credentials \
  --from-literal=username=admin \
  --from-literal=password=admin123 \
  -n web-app

# Use in pod
env:
- name: MONGO_USERNAME
  valueFrom:
    secretKeyRef:
      name: mongo-credentials
      key: username
```

### 2. Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
  namespace: web-app
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 5000
```

### 3. RBAC
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: web-app
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
```

---

## Troubleshooting

### Pod Not Starting
```bash
kubectl describe pod <pod-name> -n web-app
# Check Events section for errors
```

### Image Pull Errors
```bash
# Check image name and tag
kubectl get pods -n web-app
# Look for ImagePullBackOff or ErrImagePull
```

### Connection Refused
```bash
# Check service endpoints
kubectl get endpoints -n web-app

# Verify service selector matches pod labels
kubectl get pods --show-labels -n web-app
```

### MongoDB Connection Failed
```bash
# Test from backend pod
kubectl exec -it backend-statefulset-0 -n web-app -- sh
nc -zv mongo-service 27017
```

---

## Production Considerations

1. **Use Ingress** instead of NodePort
2. **Enable TLS/SSL** with cert-manager
3. **Use Secrets** for credentials
4. **Implement Health Checks** (liveness/readiness probes)
5. **Set Resource Limits** on all containers
6. **Use Horizontal Pod Autoscaler** (HPA)
7. **Enable Monitoring** (Prometheus/Grafana)
8. **Implement Logging** (ELK/Loki)
9. **Use Persistent Volumes** with proper storage class
10. **Implement Backup Strategy** for MongoDB

---

## Clean Up

```bash
# Delete all resources
kubectl delete -f frontend-deployment.yml
kubectl delete -f backend-statefulset.yml
kubectl delete -f mongo-statefulset.yml
kubectl delete -f namespace.yml

# Or delete namespace (deletes everything inside)
kubectl delete namespace web-app
```

---

## Summary

- **MongoDB**: StatefulSet with persistent storage (ClusterIP)
- **Backend**: StatefulSet for API (ClusterIP, internal only)
- **Frontend**: Deployment with Nginx proxy (NodePort, public)
- **Networking**: Internal DNS for service discovery
- **API Routing**: Nginx proxies `/api/*` to backend
- **Security**: Backend and MongoDB not exposed externally

This setup provides a production-ready Kubernetes deployment with proper separation of concerns and security!
