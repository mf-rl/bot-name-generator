# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY name-api.js ./
COPY config.json ./

# Expose the API port
EXPOSE 3000

# Set environment variable for host binding
ENV API_HOST=0.0.0.0

# Run the API server
CMD ["node", "name-api.js"]
