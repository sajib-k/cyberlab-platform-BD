# CyberLab Production Deployment Guide (Phase 31)

This document details the production deployment architecture, security requirements, and step-by-step operational setup for CyberLab.

## 1. Production Architecture
- **Reverse Proxy (Nginx/Caddy)**: Terminates HTTPS, handles public routing, enforces SSL/TLS, and secures internal ports.
- **Frontend (Next.js)**: Optimized production build exposed via reverse proxy.
- **Backend (NestJS API)**: Provides core application logic, authentication, and secure lab triggering.
- **Database (PostgreSQL)**: Isolated internal data layer.
- **Cache (Redis)**: Isolated session/cache layer.
- **Lab Orchestrator & Docker Provider**: Internal service managing isolated, non-privileged, resource-limited student lab containers.

## 2. Environment & Secrets Management
- Use dedicated production `.env.production` files. Never commit real secrets or database credentials to git.
- Secrets must be generated securely (long, randomized strings).

## 3. Database & Migrations
- Run Prisma migrations securely during deployment:
  ```bash
  npx prisma migrate deploy
