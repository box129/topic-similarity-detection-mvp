# Testing Guide

## Purpose

Testing in this repo should protect the topic similarity workflow: backend API behavior, similarity scoring and tiering, frontend form/results behavior, SBERT embedding service behavior, and the end-to-end path from topic submission to displayed results.

## Backend Tests

Run from the backend folder:

```powershell
cd backend
npm test
```

Coverage-specific command:

```powershell
cd backend
npm run test:coverage
```

These commands are defined in `backend/package.json` and use Jest.

## Frontend Tests

Run from the frontend folder:

```powershell
cd frontend
npm test
```

Coverage-specific command:

```powershell
cd frontend
npm run test:coverage
```

These commands are defined in `frontend/package.json` and use Vitest.

## Frontend Build Verification

Run:

```powershell
cd frontend
npm run build
```

Use this after frontend code changes to verify the Vite build still completes.

## SBERT Service Verification

The SBERT service contains these verification scripts:

```powershell
cd sbert-service
python test_service.py
python test_integration.py
python quick_test.py
python comprehensive_test.py
```

Which script is required for a specific task needs verification. For small changes, start with the most relevant service or integration check.

## Manual End-To-End Checks

For changes that affect runtime behavior, manually verify:

- Backend health endpoint responds.
- SBERT health endpoint responds.
- Frontend dev server starts.
- A topic can be submitted from the frontend.
- Similarity results render with risk level and tiered matches.
- Error states behave correctly when backend or SBERT service is unavailable.

## Needs Verification

- Current pass/fail status of backend tests: needs verification.
- Current pass/fail status of frontend tests: needs verification.
- Current pass/fail status of SBERT verification scripts: needs verification.
- Exact local startup sequence and active ports in the current environment: needs verification.
- Whether frontend proxy configuration matches the backend port: needs verification.
- Whether database connection, schema, and seed data are aligned: needs verification.
