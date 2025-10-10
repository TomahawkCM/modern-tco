# Dockerfile for sqlite-tanium MCP Server
# Based on Docker MCP best practices (July 2025)
# Hardened Alpine Linux base with security optimizations

# Build stage
FROM node:22-alpine3.20 AS builder

LABEL org.opencontainers.image.title="Tanium TCO SQLite MCP Server"
LABEL org.opencontainers.image.description="Model Context Protocol server for Tanium TCO database access"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Tanium TCO LMS Project"
LABEL org.opencontainers.image.created="2025-10-08"

# Security: Run as non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -u 1001 -S mcp -G mcp

# Set working directory
WORKDIR /app

# Install dependencies (latest versions for security patches)
RUN apk add --no-cache \
    sqlite \
    sqlite-libs \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Install mcp-sqlite package
# Using -y flag for auto-accept as recommended by Docker MCP best practices
RUN npm install --global mcp-sqlite@latest --loglevel=error && \
    npm cache clean --force

# Production stage
FROM node:22-alpine3.20

# Copy security labels
LABEL org.opencontainers.image.title="Tanium TCO SQLite MCP Server"
LABEL org.opencontainers.image.description="Model Context Protocol server for Tanium TCO database access"
LABEL org.opencontainers.image.version="1.0.0"

# Security: Run as non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -u 1001 -S mcp -G mcp

# Install runtime dependencies only (latest versions for security patches)
RUN apk add --no-cache \
    sqlite \
    sqlite-libs \
    dumb-init \
    su-exec \
    && rm -rf /var/cache/apk/*

# Copy mcp-sqlite from builder
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin /usr/local/bin

# Create database directory with proper permissions
RUN mkdir -p /data/db && \
    chown -R mcp:mcp /data

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Health check script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

WORKDIR /data

# Environment variables
ENV SQLITE_DATABASE_PATH=/data/db/tanium_tco.db
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Note: Container starts as root, entrypoint fixes volume permissions, then switches to mcp user

# Health check: Verify database is accessible
# Docker MCP best practice: Test tool functionality, not just process alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Volume for database persistence
VOLUME ["/data/db"]

# Expose MCP stdio transport (no network port needed for stdio)
# MCP servers use stdio by default as per MCP specification

# Use entrypoint script to fix permissions, then dumb-init for signal handling
ENTRYPOINT ["/usr/local/bin/entrypoint.sh", "/usr/bin/dumb-init", "--"]

# Keep container running - MCP server will be executed via docker exec by wrapper script
# This follows Docker MCP pattern where container stays alive and server is invoked on-demand
CMD ["tail", "-f", "/dev/null"]
