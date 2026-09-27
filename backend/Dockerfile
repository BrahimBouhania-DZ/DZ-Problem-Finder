# --- Stage 1: Build ---
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (only package.json & package-lock.json to leverage cache)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine AS production

# Set environment to production for optimizations
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Run as non-root user for security
USER node

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
