# Kubernetes Deployment Guide - Google Drive Clone

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  NodePort/LB    │
                  │  Port: 30000+   │
                  └────────┬────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Frontend Service      │
              │  Type: NodePort        │
              │  Port: 80              │
              └──────────┬─────────────┘
                         │
                         ▼
              ┌────────────────────────┐
              │  Frontend Pod          │
              │  - Nginx (Port 80)     │
              │  - React Build         │
              │  - Proxies /api/*      │
              └──────────┬─────────────┘
                         │
                         │ /api/* requests
                         ▼
              ┌────────────────────────┐
              │  Backend Service       │
              │  Type: ClusterIP       │
              │  Port: 5000            │
              └──────────┬─────────────┘
                         │
                         ▼
              ┌────────────────────────┐
              │  Backend StatefulSet   │
              │  - Node.js API         │
              │  - Port: 5000          │
              └──────────┬─────────────┘
                         │
                         ▼
              ┌────────────────────────┐
              │  MongoDB Service       │
              │  Type: ClusterIP       │
              │  Port: 27017           │
              └──────────┬─────────────┘
                         │
                         ▼
              ┌────────────────────────┐
              │  MongoDB StatefulSet   │
              │  - MongoDB 7           │
              │  - Persistent Storage  │
              └────────────────────────┘
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

## Deployment Order

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

## Monitoring & Debugging

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
