# Backend - AI-Powered Smart Test Case Generator

This folder contains backend services and APIs for repository analysis, intelligent test generation, and reporting.

## Purpose

The backend is responsible for:
- Project/repository ingestion
- Source parsing and metadata extraction
- AI-assisted test case generation
- Coverage and risk analysis
- Report generation
- Authentication and authorization

## Planned Stack

- Python (FastAPI)
- PostgreSQL
- Redis
- Celery (for background jobs)
- Optional Java API gateway (if introduced separately)

## Suggested Folder Structure

```text
backend/
  api/
  auth/
  services/
  parsers/
  generators/
  coverage/
  reports/
  workers/
  models/
  middleware/
  utils/
  tests/
  requirements.txt
```

## Getting Started

1. Create and activate virtual environment:
   python -m venv .venv
   .venv\Scripts\activate

2. Install dependencies:
   pip install -r requirements.txt

3. Run API server:
   uvicorn api.main:app --reload --port 8000

4. Run background worker (example):
   celery -A workers.celery_app worker --loglevel=info

## Environment Variables

Create a .env file in this folder.

Example:

APP_ENV=development
API_PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/smart_test_gen
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=change_me

## API and Service Notes

- Keep route definitions in api and business logic in services.
- Keep parser-specific logic isolated in parsers for easier language expansion.
- Use workers for long-running jobs such as large repository analysis.

## Testing

- Run unit/integration tests:
  pytest

- Run lint/format checks (if configured):
  ruff check .
  black --check .

## Status

Scaffold not initialized yet in this folder.
