# MiniStaffomatic Frontend

A React frontend for the MiniStaffomatic API.

## Prerequisites

- Docker and Docker Compose
- The MiniStaffomatic API running at `http://localhost:3000`

## Quick Start

```bash
bin/setup
bin/dev up
```

Open http://localhost:5173 and log in with:
- **Subdomain**: `demo`
- **Email**: `admin@demo.com` / `manager@demo.com` / `staff@demo.com` / `staff2@demo.com`
- **Password**: `password` (for all users)

## Commands

| Command            | Description                               |
|--------------------|-------------------------------------------|
| `bin/setup`        | Build containers and install dependencies |
| `bin/dev up`       | Start the development server              |
| `bin/dev down`     | Stop all containers                       |
| `bin/generate-api` | Regenerate API client from OpenAPI spec   |

## Development

Run commands inside the container:

```bash
# Type checking
bin/dev exec frontend pnpm typecheck

# Linting
bin/dev exec frontend pnpm lint

# Formatting
bin/dev exec frontend pnpm format

# Tests
bin/dev exec frontend pnpm test

# All checks
bin/dev exec frontend pnpm lint && bin/dev exec frontend pnpm typecheck && bin/dev exec frontend pnpm test
```

## Tech Stack

- React 19 + TypeScript + Vite
- TanStack Router (file-based routing)
- TanStack Query (server state)
- TanStack Table (data tables)
- Tailwind CSS v4 + Shadcn/ui
- Orval (API client generation)
- i18next (internationalization)
- Vitest + Testing Library (testing)

## Project Structure

```
src/
├── routes/           # File-based routes (TanStack Router)
├── components/       # React components
│   └── ui/           # Shadcn/ui components
├── lib/              # Utilities (auth, fetch, etc.)
├── generated/        # Orval output (API hooks + types)
├── test/             # Test utilities
└── main.tsx          # App entry point

public/
└── locales/          # i18n translation files (en, de)
```
