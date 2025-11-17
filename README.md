# 🐢 Turtle Battleships

Turtle Battleships is a cloud-based implementation of the classic Battleships game, leveraging modern cloud technologies for scalability and performance. In this repository, we store all of the application code (backend and frontend) as well as the infrastructure code using Terraform.

The focus of this project is to demonstrate best practices in cloud architecture, including the use of serverless technologies, containerization, and infrastructure as code. Thus, the application code is not the main focus, but rather a means to showcase the infrastructure setup; because of this, the code may not follow best practices for application development.

---

* [Infrastructure Overview](#infrastructure-overview)
* [Step-by-Step Execution Guide](#step-by-step-execution-guide)
    * [Prerequisites](#prerequisites)
    * [Step 1: Clone the Repository](#step-1-clone-the-repository)
    * [Step 2: Configure AWS Credentials](#step-2-configure-aws-credentials)
    * [Step 3: Review and Customize Configuration](#step-3-review-and-customize-configuration)
    * [Step 4: Initialize Terraform](#step-4-initialize-terraform)
    * [Step 5: Review the Execution Plan](#step-5-review-the-execution-plan)
    * [Step 6: Deploy the Infrastructure](#step-6-deploy-the-infrastructure)
    * [Step 7: Verify Deployment](#step-7-verify-deployment)
* [Final Remarks](#final-remarks)

---

## Infrastructure Overview

![Architecture Diagram](./docs/architecture.png)

## Step-by-Step Execution Guide

This guide walks you through deploying the entire Turtle Battleships infrastructure from scratch.

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Terraform** (>= 1.5.0)
2. **Docker** (required for building Lambda and ECS images)
3. **AWS CLI** (optional but recommended)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd turtle-battle-ships
```

### Step 2: Configure AWS Credentials

Set up your AWS credentials in `./terraform/aws-credentials`.

> [!NOTE]
> The current working directory is assumed to be the root of the cloned repository.

### Step 3: Review and Customize Configuration

Edit the `terraform/terraform.tfvars` file to customize your deployment.

As an example, you can copy and edit the file `terraform/terraform.tfvars.sample`:

```bash
cd terraform
cp terraform.tfvars.sample terraform.tfvars
vim terraform.tfvars  # or use your preferred editor
```

### Step 4: Initialize Terraform

Initialize Terraform to download required providers and modules:

```bash
terraform init
```

### Step 5: Review the Execution Plan

Generate and review the execution plan before applying:

```bash
terraform plan
```

### Step 6: Deploy the Infrastructure

Apply the Terraform configuration to create resources:

```bash
terraform apply -target=terraform_data.build_frontend
```

After this, copy the `backend_url` output and set it in the `terraform.tfvars` file under `cognito_config.callback_url`, it should look like this:

```hcl
cognito_config = {
  enabled       = true
  callback_url = "https://<backend_url>/callback"
}
```

Then, run the full apply:

```bash
terraform apply -target=terraform_data.build_frontend
terraform apply
```

### Step 7: Verify Deployment

After successful deployment, verify the Terraform Outputs

```bash
terraform output
```

**Expected outputs**:
```
frontend_website_url = "http://[...].s3-website-us-east-1.amazonaws.com"
backend_url = "http://[...].us-east-1.amazonaws.com"
websocket_url = "http://[...].us-east-1.elb.amazonaws.com"
```

## Final Remarks

This project was done in an academic environment, as part of the curriculum of Cloud Computing from Instituto Tecnológico de Buenos Aires (ITBA)

The project was carried out by:

* [Alejo Flores Lucey](https://github.com/alejofl)
* [Andrés Carro Wetzel](https://github.com/AndresCarro)
* [Juan Segundo Arnaude](https://github.com/juansarnaude)
* [Nehuén Gabriel Llanos](https://github.com/NehuenLlanos)