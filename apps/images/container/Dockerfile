# Image Transformer Container
# Node.js + sharp for WebP conversion

FROM node:20-alpine

# Install dependencies for sharp
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start server
CMD ["node", "src/server.js"]
