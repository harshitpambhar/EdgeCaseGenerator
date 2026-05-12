# Frontend - AI-Powered Smart Test Case Generator

This folder contains the web client for the AI-Powered Smart Test Case Generator.

## Purpose

The frontend provides:
- Repository/project input screens
- Test-case generation workflow UI
- Progress and job status tracking
- Coverage/risk dashboards and reports
- Authentication and user session flows

## Planned Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios

## Suggested Folder Structure

```text
frontend/
  src/
    api/
    components/
    pages/
    features/
    hooks/
    store/
    utils/
  public/
  index.html
  package.json
```

## Getting Started

1. Install dependencies:
   npm install

2. Start development server:
   npm run dev

3. Build production bundle:
   npm run build

## Environment Variables

Create a .env file in this folder.

Example:

VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=AI Smart Test Case Generator

## Scripts (Expected)

- npm run dev: Start local development server
- npm run build: Build for production
- npm run preview: Preview production build
- npm run test: Run frontend tests
- npm run lint: Run lint checks

## Integration Notes

- Backend API base URL should be configured via VITE_API_BASE_URL.
- Keep API calls in src/api to centralize error handling and auth tokens.
- Use feature-based modules to keep components maintainable as the app grows.

## Status

Scaffold not initialized yet in this folder.
