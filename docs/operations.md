# CyberLab Operations & Runbook (Phase 31)

This document provides operational guidelines and troubleshooting procedures for maintaining the CyberLab platform in production.

## 1. Routine Health Checks
- Verify API and Web service liveness/readiness through internal health endpoints (`/health`).
- Monitor PostgreSQL and Redis connectivity status.

## 2. Troubleshooting Common Incidents
- **Database Unavailable**: Verify PostgreSQL container/service status, check connection strings and disk space.
- **Lab Provisioning Failures**: Ensure Docker daemon is running securely and container cleanup policies (`cyberlab.managed=true`) are functioning properly.
- **High Memory/CPU Usage**: Inspect container resource limits and review active container counts.

## 3. Rollback Procedure
- Revert to the previous stable container image tag or commit hash.
- Verify backward compatibility of database schemas before executing any rollbacks.
