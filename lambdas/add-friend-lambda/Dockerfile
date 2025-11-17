# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build


# Stage 2: Runtime Stage
FROM public.ecr.aws/lambda/nodejs:20

COPY --from=builder /build/node_modules ${LAMBDA_TASK_ROOT}/node_modules

# Copy compiled JavaScript code from builder (preserve directory structure)
COPY --from=builder /build/dist ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler
CMD [ "handler.handler" ]
