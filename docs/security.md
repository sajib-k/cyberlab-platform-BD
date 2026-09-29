# CyberLab Security Hardening & Architecture Audit (Phase 28)

This document outlines the security architecture, threat model, vulnerabilities identified, and mitigations implemented for CyberLab.

## 1. Threat Model & Attack Surfaces
- **Public Web**: Unauthenticated routes, public registration, password recovery, and public search/discovery. Protected via rate limiting, input validation, and strict sanitization.
- **Authenticated Users**: Standard users interacting with lab instances, submitting flags, tracking progress, and managing profiles. Protected via rigorous RBAC, ownership/scope checks, and IDOR prevention.
- **Admin CMS**: Sensitive management endpoints for courses, rooms, tasks, machine templates, and user roles. Protected via strict server-side `ADMIN` role verification and audit logging.
- **Infrastructure & Lab Orchestrator**: Docker containers, isolated lab networks, and orchestrator APIs. Protected via strict non-privileged container policies, resource limits, and internal service tokens.

## 2. Key Security Controls Implemented
- **Authentication & Sessions**: Secure hashing (bcrypt/argon2 via existing patterns), HTTP-only cookies, token expiration, and robust rate limiting on sensitive auth endpoints.
- **Authorization & IDOR Protection**: Server-side scoping ensuring users cannot access, modify, or terminate other users' resources or machines.
- **Flag Security**: Server-side flag verification. Plaintext flags, hashes, and verifiers are never exposed to the frontend, browser bundles, or API error responses.
- **Docker Lab Isolation**: Enforced non-privileged execution (`privileged: false`), isolation from host networks/IPC/PID, avoidance of host socket exposure (`/var/run/docker.sock`), and strict resource limits.
- **Input Validation & SQL Injection**: Parameterized queries via Prisma ORM and strict DTO/Zod input validation across all NestJS endpoints.
- **Security Headers & CORS**: Hardened headers (CSP, X-Content-Type-Options, X-Frame-Options) and explicit CORS allowlists.

## 3. Security Checklist Summary
[x] Authentication hardened
[x] Session security verified
[x] RBAC verified
[x] IDOR/BOLA checked
[x] Input validation checked
[x] SQL injection protected
[x] XSS protection verified
[x] Rate limiting configured
[x] Flag security verified
[x] Docker isolation verified
[x] Lab Orchestrator internal security verified
[x] Admin CMS protection verified
[x] Security documentation updated
