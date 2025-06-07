# Contoso Air - AKS Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Contoso Air airline booking application to Azure Kubernetes Service (AKS). The deployment includes security best practices, monitoring, scaling, and CI/CD integration.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Azure ACR     │    │      AKS         │    │  Azure CosmosDB │
│                 │    │                  │    │                 │
│  Container      │    │  ┌─────────────┐ │    │   MongoDB API   │
│  Registry       │────┤  │ Contoso Air │ │────┤                 │
│                 │    │  │   Pods      │ │    │   Database      │
│  contoso-air:*  │    │  └─────────────┘ │    │                 │
└─────────────────┘    │                  │    └─────────────────┘
                       │  ┌─────────────┐ │
                       │  │   Ingress   │ │
                       │  │ Controller  │ │
                       │  └─────────────┘ │
                       └──────────────────┘
```

## Quick Start

### Prerequisites

1. **Azure CLI** - Latest version
2. **kubectl** - Kubernetes command-line tool
3. **Docker** - For building container images
4. **Azure Subscription** - With appropriate permissions

### 1. Automated Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd contoso-air

# Make the script executable
chmod +x deploy-aks.sh

# Run the deployment script
./deploy-aks.sh
```

### 2. Manual Deployment

Follow the detailed steps in `k8s/README.md` for manual deployment.

## Configuration Files

### Core Kubernetes Manifests

- **`k8s/namespace.yaml`** - Isolated namespace for the application
- **`k8s/configmap.yaml`** - Application configuration
- **`k8s/secret.yaml`** - Azure CosmosDB credentials
- **`k8s/deployment.yaml`** - Main application deployment
- **`k8s/service.yaml`** - Internal load balancer
- **`k8s/ingress.yaml`** - External access configuration
- **`k8s/hpa.yaml`** - Horizontal Pod Autoscaler
- **`k8s/pdb.yaml`** - Pod Disruption Budget

### Additional Components

- **`k8s/monitoring.yaml`** - Prometheus monitoring rules
- **`k8s/network-policy.yaml`** - Network security policies
- **`k8s/kustomization.yaml`** - Kustomize configuration

### Environment Overlays

- **`k8s/overlays/development/`** - Development environment configuration
- **`k8s/overlays/production/`** - Production environment configuration

## Security Features

### Container Security
- ✅ Non-root user execution (UID: 1001)
- ✅ RuntimeDefault seccomp profile
- ✅ Dropped Linux capabilities
- ✅ Read-only root filesystem (where applicable)

### Network Security
- ✅ Network policies for traffic isolation
- ✅ Secure ingress configuration
- ✅ Service mesh ready

### Secrets Management
- ✅ Azure CosmosDB credentials stored in Kubernetes secrets
- ✅ Base64 encoded sensitive data
- ✅ Environment variable injection

## Scaling and High Availability

### Horizontal Pod Autoscaler (HPA)
- **CPU Threshold**: 70%
- **Memory Threshold**: 80%
- **Min Replicas**: 2
- **Max Replicas**: 10

### Pod Disruption Budget (PDB)
- **Min Available**: 1 pod during updates/maintenance

### Anti-Affinity Rules
- Pods prefer to be scheduled on different nodes
- Topology spread constraints for better distribution

## Monitoring and Observability

### Health Checks
- **Startup Probe**: 60-second startup window
- **Liveness Probe**: Restarts unhealthy containers
- **Readiness Probe**: Controls traffic routing

### Metrics and Alerting
- Prometheus metrics collection
- Custom alerting rules for:
  - High error rates
  - High response times
  - Pod crash loops
  - Pod not ready states

### Logging
- Azure Monitor integration
- Container logs aggregation
- Application performance insights

## CI/CD Integration

### GitHub Actions Workflow
- **Triggers**: Push to main/develop branches
- **Security**: Trivy container scanning
- **Environments**: Separate dev and prod deployments
- **Rollback**: Automatic rollback on deployment failures

### Pipeline Stages
1. **Build & Test** - Code quality checks
2. **Security Scan** - Container vulnerability scanning
3. **Deploy to Dev** - Automated deployment to development
4. **Deploy to Prod** - Manual approval for production
5. **Smoke Tests** - Post-deployment validation

## Environment Variables

### Required Configuration

| Variable | Description | Source |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | ConfigMap |
| `PORT` | Application port | ConfigMap |
| `AZURE_COSMOS_LISTCONNECTIONSTRINGURL` | CosmosDB connection URL | Secret |
| `AZURE_COSMOS_SCOPE` | Azure scope | Secret |
| `AZURE_COSMOS_CLIENTID` | Managed identity client ID | Secret |

## Networking

### Internal Communication
- **Service**: `contoso-air-web-service.contoso-air.svc.cluster.local`
- **Port**: 80 (maps to container port 3000)

### External Access
- **Ingress**: Configurable domain (default: contoso-air.example.com)
- **Load Balancer**: Azure Application Gateway or NGINX

### Port Forwarding (Development)
```bash
kubectl port-forward svc/contoso-air-web-service -n contoso-air 8080:80
```

## Troubleshooting

### Common Issues

1. **ImagePullBackOff**
   ```bash
   # Check ACR integration
   az aks check-acr --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --acr $ACR_NAME
   ```

2. **CrashLoopBackOff**
   ```bash
   # Check application logs
   kubectl logs -l app=contoso-air -n contoso-air --tail=100
   ```

3. **Service Unavailable**
   ```bash
   # Check service endpoints
   kubectl get endpoints -n contoso-air
   kubectl describe service contoso-air-web-service -n contoso-air
   ```

### Useful Commands

```bash
# Check pod status
kubectl get pods -n contoso-air -o wide

# View recent events
kubectl get events -n contoso-air --sort-by='.lastTimestamp'

# Scale deployment
kubectl scale deployment contoso-air-web --replicas=5 -n contoso-air

# Update image
kubectl set image deployment/contoso-air-web contoso-air-web=new-image:tag -n contoso-air

# Check resource usage
kubectl top pods -n contoso-air
kubectl top nodes
```

## Cost Optimization

### Resource Requests and Limits
- **CPU**: 200m requests, 500m limits
- **Memory**: 256Mi requests, 512Mi limits
- **Storage**: Minimal persistent storage requirements

### Scaling Strategy
- Aggressive scale-down policies
- Efficient resource utilization
- Cost-aware instance selection

## Backup and Disaster Recovery

### Database Backup
- Azure CosmosDB automatic backups
- Point-in-time restore capabilities

### Application State
- Stateless application design
- Configuration stored in Git
- Infrastructure as Code

## Security Considerations

### Access Control
- RBAC integration with Azure AD
- Least privilege principles
- Service account restrictions

### Data Protection
- Encryption in transit (TLS)
- Encryption at rest (Azure CosmosDB)
- Secrets rotation capabilities

### Compliance
- Pod Security Standards enforcement
- Network isolation
- Audit logging enabled

## Performance Optimization

### Application Tuning
- Node.js production optimizations
- Connection pooling
- Caching strategies

### Kubernetes Optimizations
- Resource quotas
- QoS classes
- Node affinity rules

## Maintenance

### Regular Tasks
- Security updates
- Dependency updates
- Certificate rotation
- Performance monitoring

### Automation
- Automated security scanning
- Dependency vulnerability checks
- Performance regression testing

## Support and Documentation

- **Application Logs**: `kubectl logs -l app=contoso-air -n contoso-air`
- **Metrics Dashboard**: Azure Monitor / Prometheus
- **Health Endpoint**: `/health`
- **Documentation**: This README and inline comments

## Contributing

1. Follow the established patterns in the Kubernetes manifests
2. Update documentation for any configuration changes
3. Test changes in development environment first
4. Ensure security best practices are maintained

---

For detailed deployment instructions, see `k8s/README.md`.
For automated deployment, use `deploy-aks.sh`.
For CI/CD setup, see `.github/workflows/deploy-aks.yml`.
