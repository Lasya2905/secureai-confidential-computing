# SecureAI Cloud — PRD

## Original Problem Statement
Build a full-stack web application "SecureAI Cloud" — an educational and demonstrative platform for the topic "Confidential Computing for Secure AI Workloads in Cloud Environments." Frontend React, backend FastAPI, MongoDB persistence, plus DevOps: Jenkinsfile, Dockerfiles, docker-compose, tests, README.

## User Choices (2026-02)
- Dark cyber/security theme (deep navy + neon cyan accents)
- MongoDB persistence
- Simulation only (no real AI integration)
- Pre-populate 5 sample workloads

## User Personas
- **DevOps Student (primary):** B.E. AI/ML student demoing CI/CD + confidential computing concepts.
- **Security Educator:** Uses the app to visualise TEEs and attestation flows in class.
- **Reviewer / Examiner:** Evaluates the assignment.

## Core Requirements (Static)
- Dashboard with security KPIs, TEE distribution, recent activity, CI/CD summary
- Confidential Computing educational page
- TEE Technologies (Intel SGX, AMD SEV, Intel TDX, ARM TrustZone)
- Submit AI Workload form (name, model, dataset, size, security level, TEE)
- Workload Monitor (Secure / Processing / Completed / Failed)
- Security Analysis (5 indicators + radar + attestation)
- CI/CD Pipeline status (GitHub + Jenkins + 8 stages)
- Jenkinsfile, Dockerfiles, docker-compose, backend tests, README

## Architecture
```
React 19 (Router, Tailwind, shadcn/ui, Recharts, Sonner)
   │  REST /api/*
FastAPI (Pydantic v2, Motor) — port 8001
   │
MongoDB 7
DevOps: Jenkinsfile + docker-compose (mongo, backend, frontend/nginx)
```

## What's Been Implemented (2026-02)
### Backend (/app/backend/server.py)
- GET /api/health, GET /api/, GET /api/tee-technologies
- POST /api/workloads (validated), GET /api/workloads, GET /api/workloads/{id}
- POST /api/workloads/{id}/security-analysis
- GET /api/dashboard/stats (totals, tee_distribution, recent_activity)
- GET /api/deployment-status (GitHub + Jenkins + 8 stages)
- Automatic seeding of 5 sample workloads at startup
- Simulated security scoring (deterministic-ish) with 5 indicators

### Frontend
- AppLayout with sidebar nav + mobile top nav + live health indicator
- Dashboard (4 stat cards, TEE distribution bars, CI/CD summary, recent activity feed)
- Confidential Computing (hero + 5 concept cards + academic disclaimer)
- TEE Technologies (4 vendor cards, scanner-line accents)
- Submit Workload (validated form + result card with copy-ID, redirect to detail)
- Workloads Monitor (search + status filters + dense table)
- Workload Detail (Recharts radar + 5 indicator cards + attestation badge + rerun)
- CI/CD Pipeline (source/tool/env cards, 3 status metrics, 8 pipeline stages)

### DevOps
- /app/Jenkinsfile with 8 stages (Checkout → Install → Tests → Build → Package → Deploy → Health Check)
- /app/backend/Dockerfile, /app/frontend/Dockerfile (multi-stage + nginx), /app/frontend/nginx.conf
- /app/docker-compose.yml (mongo + backend + frontend)
- /app/tests/backend/test_api.py (health, tee, create/get workload, deployment, invalid)
- /app/.env.example, /app/.gitignore, /app/README.md (~200 lines)

### Design
- Dark navy `#0a0f1c`, cyan `#00f0ff`, glassmorphism, scanner-line animation, pulse dots
- Fonts: Chivo (display, black), Inter (body), JetBrains Mono (labels/data)
- 1px borders, 4px radius, sharp buttons, uppercase mono labels

## Verified
- Backend healthy, MongoDB connected, 5 seeds inserted
- Testing agent: 100% backend (9/9 endpoints) + 100% frontend (all pages/flows)
- Dashboard screenshot confirms UI, data, TEE bars, CI/CD summary all rendering

## Backlog (P1/P2)
- P1: Auto-refresh dashboard every 30s (currently manual reload)
- P1: Export workload report as PDF/JSON
- P2: WebSocket live status updates on workloads
- P2: Multi-tenant / user auth (Emergent Google Auth)
- P2: Dockerize + wire real Jenkins pipeline on GitHub push
