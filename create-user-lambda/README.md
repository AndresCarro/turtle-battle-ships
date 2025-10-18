# Create User Lambda Function

This is an AWS Lambda function written in TypeScript to create users.

## Prerequisites

- Node.js (v18 or later)
- Docker installed and running
- AWS CLI configured with appropriate credentials
- AWS Lambda function created in your AWS account

## Installation

```bash
npm install
```

## Local Development

### Run Locally with Docker

```bash
# Start the Lambda function in a local container
./run-local.sh
```

This will:

1. Build the Docker image
2. Start the container on port 9000
3. Load environment variables from your `.env` file
4. Display test commands

### Test Locally

```bash
# Run automated tests
./test-local.sh
```

Or test manually with curl:

```bash
# Create a user
curl -XPOST 'http://localhost:9000/2015-03-31/functions/function/invocations' \
  -H "Content-Type: application/json" \
  -d '{
    "body": "{\"username\":\"testuser\"}"
  }'
```

### View Logs

```bash
docker logs -f create-user-lambda-local
```

### Stop Local Container

```bash
docker stop create-user-lambda-local
```

#### Manual Docker Commands (Optional)

```bash
# Tag for ECR
docker tag create-user-lambda:latest <account-id>.dkr.ecr.<region>.amazonaws.com/create-user-lambda:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/create-user-lambda:latest
```

### ZIP Package (Alternative)

```bash
npm run build
npm run package
npm run deploy
```

This will create a `function.zip` file and deploy it to Lambda.

## Quick Start Guide

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup database credentials**

   ```bash
   cp .env.example .env
   # Edit .env with your database details
   ```

3. **Test locally**

   ```bash
   ./run-local.sh
   ./test-local.sh
   ```
