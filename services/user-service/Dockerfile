# =====================
# BASE BUILD STAGE (MATCHING ANALYTICS PATTERN)
# =====================
FROM node:18-alpine AS builder

# Set working directory to the container root
WORKDIR /app

# ---------------------
# Install shared dependencies (Needed if user-service relies on 'shared')
# ---------------------
# Assuming shared/package*.json is available from the build context (root)
COPY shared/package*.json ./shared/
RUN cd shared && npm ci && npm cache clean --force

# ---------------------
# Install user-service dependencies
# ---------------------
# Assuming the user-service compose file sets context to the project root
COPY services/user-service/package*.json ./services/user-service/
RUN cd services/user-service && npm ci && npm cache clean --force

# ---------------------
# Copy source code and config
# ---------------------
COPY shared/ ./shared/
# Copy the source code and config files into the correct subdirectory
COPY services/user-service/src/ ./services/user-service/src/
COPY services/user-service/tsconfig.json ./services/user-service/
COPY services/user-service/prisma ./services/user-service/prisma
COPY services/user-service/docker-entrypoint.sh ./services/user-service/
# Note: You might need to install 'libc6-compat' here if Prisma throws errors

# ---------------------
# Build shared modules
# ---------------------
WORKDIR /app/shared
RUN npm run build

# ---------------------
# Build user-service
# ---------------------
WORKDIR /app/services/user-service

# The user-service depends on its local node_modules (installed above) and the shared build
# Run Prisma generate inside the service directory
RUN npx prisma generate

# Build TypeScript project
RUN npm run build


# =====================
# PRODUCTION STAGE (Adapted for User Service)
# =====================
FROM node:18-alpine AS production

# Install necessary runtime dependencies (openssl3 is default in Alpine 3.19+)
RUN apk add --no-cache dumb-init openssl
# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory to the container root
WORKDIR /app

# Copy the entire built application structure from the builder stage
COPY --from=builder --chown=nodejs:nodejs /app /app

# Make entrypoint script executable
RUN chmod +x /app/services/user-service/docker-entrypoint.sh

# Expose port (use 3001 consistently with docker-compose)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use entrypoint script to run migrations before starting app
ENTRYPOINT ["dumb-init", "--", "/app/services/user-service/docker-entrypoint.sh"]
CMD ["node", "services/user-service/dist/index.js"]