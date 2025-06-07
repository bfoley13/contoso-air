# Kubernetes Deployment for Contoso Air

This directory contains Kubernetes manifests for deploying the Contoso Air application to Azure Kubernetes Service (AKS).

## Prerequisites

- Azure CLI installed and configured
- kubectl installed
- Docker installed
- Azure subscription with appropriate permissions
- Azure CosmosDB instance set up (see main README.md)

## Quick Start

1. **Deploy using the automated script:**
   ```bash
   ./deploy-aks.sh
   ```

2. **Or deploy manually following the steps below.**

## Manual Deployment Steps

### 1. Set Environment Variables

```bash
export AZURE_RESOURCE_GROUP_NAME="rg-contoso-air"
export AKS_CLUSTER_NAME="aks-contoso-air"
export ACR_NAME="acrcontosoair$(date +%s)"
export AZURE_LOCATION="westus2"
```

### 2. Create Azure Container Registry

```bash
# Create resource group
az group create --name $AZURE_RESOURCE_GROUP_NAME --location $AZURE_LOCATION

# Create ACR
az acr create \
    --resource-group $AZURE_RESOURCE_GROUP_NAME \
    --name $ACR_NAME \
    --sku Basic \
    --admin-enabled true
```

### 3. Build and Push Docker Image

```bash
# Build the image
docker build -t contoso-air:latest .

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $AZURE_RESOURCE_GROUP_NAME --query "loginServer" --output tsv)

# Tag and push the image
docker tag contoso-air:latest $ACR_LOGIN_SERVER/contoso-air:latest
az acr login --name $ACR_NAME
docker push $ACR_LOGIN_SERVER/contoso-air:latest
```

### 4. Create AKS Cluster

```bash
az aks create \
    --resource-group $AZURE_RESOURCE_GROUP_NAME \
    --name $AKS_CLUSTER_NAME \
    --node-count 3 \
    --node-vm-size Standard_B2s \
    --enable-managed-identity \
    --attach-acr $ACR_NAME \
    --enable-addons monitoring \
    --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group $AZURE_RESOURCE_GROUP_NAME --name $AKS_CLUSTER_NAME
```

### 5. Configure Secrets

Update the `secret.yaml` file with base64 encoded Azure CosmosDB credentials:

```bash
# Encode your Azure CosmosDB connection details
echo -n "your-connection-string-url" | base64
echo -n "https://management.azure.com/.default" | base64
echo -n "your-client-id" | base64
```

Update the `k8s/secret.yaml` file with these encoded values.

### 6. Update Deployment Image

Update the image reference in `k8s/deployment.yaml`:

```bash
# Replace the image reference with your ACR image
sed -i "s|image: contoso-air:latest|image: $ACR_LOGIN_SERVER/contoso-air:latest|g" k8s/deployment.yaml
```

### 7. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/pdb.yaml

# Optionally apply ingress (configure domain first)
kubectl apply -f k8s/ingress.yaml
```

### 8. Verify Deployment

```bash
# Check pod status
kubectl get pods -n contoso-air

# Check service
kubectl get services -n contoso-air

# View logs
kubectl logs -l app=contoso-air -n contoso-air

# Port forward to test locally
kubectl port-forward svc/contoso-air-web-service -n contoso-air 8080:80
```

## Architecture Overview

The deployment includes:

- **Namespace**: Isolated environment for the application
- **ConfigMap**: Non-sensitive configuration data
- **Secret**: Azure CosmosDB connection credentials
- **Deployment**: Application pods with security best practices
- **Service**: Internal load balancer for the application
- **Ingress**: External access configuration
- **HPA**: Horizontal Pod Autoscaler for scaling
- **PDB**: Pod Disruption Budget for availability

## Security Features

- Non-root container execution
- RuntimeDefault seccomp profile
- Dropped Linux capabilities
- Pod anti-affinity for resilience
- Resource limits and requests
- Health checks (startup, liveness, readiness)

## Monitoring and Scaling

- **Horizontal Pod Autoscaler**: Scales based on CPU (70%) and memory (80%) usage
- **Pod Disruption Budget**: Ensures minimum availability during updates
- **Health Checks**: Comprehensive health monitoring
- **Azure Monitor**: Integration with AKS monitoring addon

## Networking

- **ClusterIP Service**: Internal access within the cluster
- **Ingress**: External access with Azure Application Gateway or NGINX
- **NetworkPolicies**: Can be added for additional security

## Troubleshooting

### Common Issues

1. **Pod stuck in ImagePullBackOff**:
   ```bash
   # Check if ACR is attached to AKS
   az aks show --resource-group $AZURE_RESOURCE_GROUP_NAME --name $AKS_CLUSTER_NAME --query "servicePrincipalProfile"
   ```

2. **Pod failing health checks**:
   ```bash
   # Check pod logs
   kubectl logs -l app=contoso-air -n contoso-air
   
   # Describe pod for events
   kubectl describe pod -l app=contoso-air -n contoso-air
   ```

3. **Service not accessible**:
   ```bash
   # Check service endpoints
   kubectl get endpoints -n contoso-air
   
   # Test internal connectivity
   kubectl run test-pod --image=busybox --rm -it -- wget -qO- http://contoso-air-web-service.contoso-air.svc.cluster.local/health
   ```

### Useful Commands

```bash
# Scale deployment
kubectl scale deployment contoso-air-web --replicas=5 -n contoso-air

# Update image
kubectl set image deployment/contoso-air-web contoso-air-web=$ACR_LOGIN_SERVER/contoso-air:new-tag -n contoso-air

# Check HPA status
kubectl get hpa -n contoso-air

# View resource usage
kubectl top pods -n contoso-air
```

## Clean Up

```bash
# Delete the application
kubectl delete namespace contoso-air

# Delete AKS cluster
az aks delete --resource-group $AZURE_RESOURCE_GROUP_NAME --name $AKS_CLUSTER_NAME --yes --no-wait

# Delete resource group (if desired)
az group delete --name $AZURE_RESOURCE_GROUP_NAME --yes --no-wait
```
