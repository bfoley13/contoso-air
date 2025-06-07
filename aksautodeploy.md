# Deployments for Azure Kubernetes Service (AKS)

We will containerize the airline booking application and deploy it to AKS.

## Create the Dockerfile

To get an application ready for Kubernetes, you need to build it into a container image and store it in a container registry. You will create a Dockerfile to provide instructions on how to build the container image.

- Decide application environment: Application environment is the programming language of the application and the corresponding runtime version to use to run the application.
- Enter application port: Application port is where the application will be exposed in the AKS cluster after deployment.
- Provide Dockerfile build context: Docker build context refers to the directory of the source code for the application to build it from.

## Create the deployment configuration

An application running on Kubernetes consists of many Kubernetes primitive components. These components describe what container image to use, how many replicas to run, if there's a public IP required to expose the application, etc.

Generate a set of basic Kubernetes manifest files to have your application up and running. At the moment, creates a Deployment, a Service, and a ConfigMap.

The generated manifests are designed to apply recommendations of deployment safeguards:

- Generate liveness, readiness, and startup probes.
- Preferring pod anti-affinity and topology spread constraints that spread replicas onto different nodes for improved resiliency.
- Enforcing the RuntimeDefault secure computing profile which establishes an extra layer of protection against common system call vulnerabilities exploited by malicious actors.
- Dropping all Linux capabilities and only allowing a limited set following the baseline Kubernetes Pod Security Standards.


