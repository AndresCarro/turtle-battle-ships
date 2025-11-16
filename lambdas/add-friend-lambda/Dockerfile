FROM public.ecr.aws/lambda/nodejs:20

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY dist/ .

# Set the CMD to your handler
CMD [ "handler.handler" ]