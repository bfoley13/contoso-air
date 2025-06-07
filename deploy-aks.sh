#!/bin/bash

# Contoso Air AKS Deployment Script
# This script deploys the Contoso Air application to Azure Kubernetes Service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP_NAME:-rg-contoso-air}"
AKS_CLUSTER_NAME="${AKS_CLUSTER_NAME:-aks-contoso-air}"
ACR_NAME="${ACR_NAME:-acrcontosoair$(date +%s)}"
LOCATION="${AZURE_LOCATION:-westus2}"
IMAGE_NAME="contoso-air"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo -e "${BLUE}=== Contoso Air AKS Deployment ===${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged into Azure
    if ! az account show &> /dev/null; then
        print_error "Please log in to Azure CLI first: az login"
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Create Azure Container Registry
create_acr() {
    print_status "Creating Azure Container Registry..."
    
    # Create resource group if it doesn't exist
    az group create --name $RESOURCE_GROUP --location $LOCATION --output table
    
    # Create ACR
    az acr create \
        --resource-group $RESOURCE_GROUP \
        --name $ACR_NAME \
        --sku Basic \
        --admin-enabled true \
        --output table
    
    print_status "Azure Container Registry created: $ACR_NAME"
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    # Build the Docker image
    docker build -t $IMAGE_NAME:$IMAGE_TAG .
    
    # Get ACR login server
    ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
    
    # Tag the image for ACR
    docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG
    
    # Log in to ACR
    az acr login --name $ACR_NAME
    
    # Push the image
    docker push $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG
    
    print_status "Image pushed to ACR: $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
}

# Create AKS cluster
create_aks_cluster() {
    print_status "Creating AKS cluster..."
    
    az aks create \
        --resource-group $RESOURCE_GROUP \
        --name $AKS_CLUSTER_NAME \
        --node-count 3 \
        --node-vm-size Standard_B2s \
        --enable-managed-identity \
        --attach-acr $ACR_NAME \
        --enable-addons monitoring \
        --generate-ssh-keys \
        --output table
    
    # Get AKS credentials
    az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME --overwrite-existing
    
    print_status "AKS cluster created and configured: $AKS_CLUSTER_NAME"
}

# Update Kubernetes manifests with ACR image
update_manifests() {
    print_status "Updating Kubernetes manifests..."
    
    ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
    
    # Update the deployment manifest with the correct image
    sed -i "s|image: contoso-air:latest|image: $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG|g" k8s/deployment.yaml
    
    print_status "Manifests updated with image: $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    print_status "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl apply -f k8s/namespace.yaml
    
    # Apply ConfigMap and Secrets (you'll need to update secrets with actual values)
    kubectl apply -f k8s/configmap.yaml
    
    print_warning "Please update k8s/secret.yaml with base64 encoded Azure CosmosDB credentials before applying secrets"
    print_warning "Example: echo -n 'your-connection-string-url' | base64"
    
    # Apply the rest of the manifests
    kubectl apply -f k8s/secret.yaml
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/hpa.yaml
    kubectl apply -f k8s/pdb.yaml
    
    # Optionally apply ingress (you may want to configure this separately)
    # kubectl apply -f k8s/ingress.yaml
    
    print_status "Application deployed to Kubernetes!"
}

# Check deployment status
check_deployment() {
    print_status "Checking deployment status..."
    
    kubectl get pods -n contoso-air
    kubectl get services -n contoso-air
    
    print_status "Waiting for pods to be ready..."
    kubectl wait --for=condition=ready pod -l app=contoso-air -n contoso-air --timeout=300s
    
    print_status "Deployment completed successfully!"
}

# Get service details
get_service_info() {
    print_status "Service Information:"
    echo "Namespace: contoso-air"
    echo "Service: contoso-air-web-service"
    echo ""
    kubectl get service contoso-air-web-service -n contoso-air
    
    print_status "To access the application, you can port-forward:"
    echo "kubectl port-forward svc/contoso-air-web-service -n contoso-air 8080:80"
    echo "Then access: http://localhost:8080"
}

# Main execution
main() {
    check_prerequisites
    
    if [[ "${1:-}" == "--skip-infrastructure" ]]; then
        print_status "Skipping infrastructure creation..."
    else
        create_acr
        create_aks_cluster
        build_and_push_image
        update_manifests
    fi
    
    deploy_to_kubernetes
    check_deployment
    get_service_info
    
    print_status "Deployment completed! 🎉"
}

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Deploy Contoso Air application to Azure Kubernetes Service"
    echo ""
    echo "Options:"
    echo "  --skip-infrastructure    Skip ACR and AKS creation (use existing resources)"
    echo "  --help                   Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  AZURE_RESOURCE_GROUP_NAME    Resource group name (default: rg-contoso-air)"
    echo "  AKS_CLUSTER_NAME            AKS cluster name (default: aks-contoso-air)"
    echo "  ACR_NAME                    ACR name (default: auto-generated)"
    echo "  AZURE_LOCATION              Azure region (default: westus2)"
    echo "  IMAGE_TAG                   Docker image tag (default: latest)"
}

# Parse command line arguments
case "${1:-}" in
    --help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
