# Use official Node.js runtime as base image
FROM node:20-slim

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY name-api.js ./
COPY config.json ./

# Expose the API port
EXPOSE 3000

# Set environment variable for host binding
ENV API_HOST=0.0.0.0

# Run the API server
CMD ["node", "name-api.js"]
