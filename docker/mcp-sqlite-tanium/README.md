# Tanium TCO SQLite MCP Server - Docker Container

**Phase 1: Hybrid Architecture** - SQLite MCP containerized for database isolation

**Version:** 1.0.0
**Created:** 2025-10-08
**Status:** Production-ready

---

## 📋 Overview

This Docker container provides the SQLite MCP (Model Context Protocol) server for the Tanium TCO Learning Management System. It's part of a phased approach to containerize MCP servers, starting with database infrastructure for maximum isolation and security.

**Why Docker for SQLite MCP?**
- ✅ **Database Isolation** - Separate process space and file system
- ✅ **Backup Automation** - Docker volumes for easy backup/restore
- ✅ **Resource Limits** - CPU and memory constraints prevent runaway processes
- ✅ **Health Monitoring** - Automatic database integrity checks
- ✅ **Production Ready** - Enterprise-grade reliability

---

## 🚀 Quick Start

### Prerequisites
- Docker v20.10 or later
- Docker Compose v1.29 or later
- Tanium TCO database file (created automatically if not exists)

### 1. Build the Container

```bash
# Navigate to docker directory
cd docker/mcp-sqlite-tanium

# Build the image
docker compose build

# Verify build
docker images | grep mcp-sqlite
```

### 2. Start the MCP Server

```bash
# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Check health status
docker compose ps
```

### 3. Verify Connectivity

```bash
# Run health check manually
docker compose exec mcp-sqlite-tanium /usr/local/bin/healthcheck.sh

# Check database integrity
docker compose exec mcp-sqlite-tanium sqlite3 /data/db/tanium_tco.db "PRAGMA integrity_check;"
```

---

## 🏗️ Architecture

### Container Specifications

| Aspect | Configuration |
|--------|---------------|
| **Base Image** | node:22-alpine3.20 |
| **User** | Non-root (uid:1001, gid:1001) |
| **Filesystem** | Read-only root, writable /data only |
| **Network** | None (stdio transport) |
| **Resources** | 0.25-0.5 CPU, 256-512MB RAM |
| **Security** | no-new-privileges, minimal packages |

### Volume Mounts

```
tanium-tco-db:/data/db    # Persistent database storage
```

### Health Checks

Automated health checks every 30 seconds:
1. Database file exists
2. Database is readable
3. SQLite can open database
4. Integrity check passes
5. mcp-sqlite binary available

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SQLITE_DATABASE_PATH` | `/data/db/tanium_tco.db` | Database file path |
| `NODE_ENV` | `production` | Node environment |
| `NODE_OPTIONS` | `--max-old-space-size=512` | Node memory limit |

### Resource Limits

Default limits (can be adjusted in docker-compose.yml):

```yaml
limits:
  cpus: '0.5'        # Maximum 50% of one CPU core
  memory: 512M       # Maximum 512MB RAM
reservations:
  cpus: '0.25'       # Guaranteed 25% CPU
  memory: 256M       # Guaranteed 256MB RAM
```

---

## 🔧 Common Operations

### View Logs

```bash
# Real-time logs
docker compose logs -f mcp-sqlite-tanium

# Last 100 lines
docker compose logs --tail=100 mcp-sqlite-tanium

# Since specific time
docker compose logs --since=1h mcp-sqlite-tanium
```

### Restart Container

```bash
# Graceful restart
docker compose restart mcp-sqlite-tanium

# Full recreate
docker compose down && docker compose up -d
```

### Stop Container

```bash
# Stop gracefully
docker compose stop

# Stop and remove
docker compose down

# Stop and remove volumes (⚠️ DELETES DATA)
docker compose down -v
```

### Database Backup

```bash
# Backup database to host
docker compose exec mcp-sqlite-tanium \
  sqlite3 /data/db/tanium_tco.db \
  ".backup /data/db/tanium_tco_backup_$(date +%Y%m%d_%H%M%S).db"

# Copy backup to host
docker cp mcp-sqlite-tanium:/data/db/tanium_tco_backup_*.db ./backups/

# Or use Docker volume backup
docker run --rm \
  -v tanium-tco-db:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/tanium-tco-db-$(date +%Y%m%d).tar.gz -C /data .
```

### Database Restore

```bash
# Copy backup to container
docker cp ./backups/tanium_tco_backup.db mcp-sqlite-tanium:/data/db/

# Restore from backup
docker compose exec mcp-sqlite-tanium \
  cp /data/db/tanium_tco_backup.db /data/db/tanium_tco.db

# Restart container
docker compose restart
```

---

## 🔍 Troubleshooting

### Container Won't Start

**Problem:** Container exits immediately

**Solutions:**
```bash
# Check logs for errors
docker compose logs

# Verify database file permissions
ls -la ../../data/db/tanium_tco.db

# Check Docker daemon
systemctl status docker

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Health Check Failing

**Problem:** Health check status shows "unhealthy"

**Solutions:**
```bash
# Run health check manually
docker compose exec mcp-sqlite-tanium /usr/local/bin/healthcheck.sh

# Check database integrity
docker compose exec mcp-sqlite-tanium \
  sqlite3 /data/db/tanium_tco.db "PRAGMA integrity_check;"

# Inspect container filesystem
docker compose exec mcp-sqlite-tanium ls -la /data/db/

# Review health check logs
docker inspect mcp-sqlite-tanium | jq '.[0].State.Health'
```

### Database Lock Issues

**Problem:** "database is locked" errors

**Solutions:**
```bash
# Check for stale lock files
docker compose exec mcp-sqlite-tanium ls -la /data/db/*.db-*

# Remove lock files (⚠️ only if container is stopped)
docker compose down
docker compose exec mcp-sqlite-tanium rm -f /data/db/*.db-shm /data/db/*.db-wal

# Restart container
docker compose up -d
```

### Performance Issues

**Problem:** Slow database queries

**Solutions:**
```bash
# Check resource usage
docker stats mcp-sqlite-tanium

# Increase resource limits in docker-compose.yml
# Then apply changes
docker compose up -d

# Optimize database
docker compose exec mcp-sqlite-tanium \
  sqlite3 /data/db/tanium_tco.db "VACUUM; ANALYZE;"
```

---

## 🔒 Security

### Hardening Features

1. **Non-root User** - Container runs as uid:1001
2. **Read-only Root** - Filesystem is immutable except /data
3. **No Network** - stdio transport only, no network exposure
4. **Resource Limits** - Prevent resource exhaustion attacks
5. **Minimal Image** - Alpine base with only required packages
6. **Security Options** - no-new-privileges flag enabled

### Vulnerability Scanning

```bash
# Scan image for vulnerabilities (requires grype)
grype tanium-tco/mcp-sqlite:latest

# Generate SBOM (requires syft)
syft tanium-tco/mcp-sqlite:latest -o json > sbom.json

# Docker scan (if Docker Scout available)
docker scout cves tanium-tco/mcp-sqlite:latest
```

---

## 📊 Monitoring

### Health Check Status

```bash
# Quick status check
docker compose ps

# Detailed health info
docker inspect mcp-sqlite-tanium --format='{{json .State.Health}}' | jq

# Health history
docker inspect mcp-sqlite-tanium | jq '.[0].State.Health.Log'
```

### Resource Metrics

```bash
# Real-time stats
docker stats mcp-sqlite-tanium --no-stream

# Continuous monitoring
docker stats mcp-sqlite-tanium

# Export metrics
docker stats mcp-sqlite-tanium --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

---

## 🔄 Rollback Procedure

If Docker deployment fails, revert to npx:

### 1. Stop Docker Container

```bash
cd docker/mcp-sqlite-tanium
docker compose down
```

### 2. Restore .mcp.json Backup

```bash
cd /home/robne/projects/active/tanium-tco/modern-tco
cp .mcp.json.backup-pre-docker .mcp.json
```

### 3. Restart Claude Code

```bash
# Exit current session
/exit

# Start new session
claude
```

### 4. Verify npx MCP Works

```bash
# Check .mcp.json loaded correctly
# sqlite-tanium should be back to npx transport
```

---

## 📚 Related Documentation

- **MCP Deployment Strategy:** `docs/MCP_DEPLOYMENT_STRATEGY.md`
- **Vibe Check Constitution:** `.claude/vibe-check-constitution.md` (see "MCP DEPLOYMENT STRATEGY" section)
- **Docker MCP Best Practices:** [Docker Blog](https://www.docker.com/blog/mcp-server-best-practices/)
- **MCP Official Roadmap:** [MCP Roadmap](https://modelcontextprotocol.io/development/roadmap)

---

## 🚦 Production Checklist

Before deploying to production:

- [ ] Database backup created and tested
- [ ] Resource limits appropriate for load
- [ ] Health checks passing consistently
- [ ] Logs reviewed for errors
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Performance benchmarks met (<5ms latency)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-08 | Initial Docker containerization (Phase 1) |

---

## 🤝 Contributing

This is part of the Tanium TCO LMS project. For questions or issues:

1. Check the troubleshooting section above
2. Review `.claude/vibe-check-constitution.md` MCP deployment strategy
3. Use `vibe_check` before making architectural changes
4. Use `vibe_learn` to document patterns and solutions

---

**Last Updated:** 2025-10-08
**Maintained By:** Tanium TCO LMS Development Team
**Phase:** 1 - Hybrid Architecture
