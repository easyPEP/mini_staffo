# MiniStaffomatic

A simplified staff scheduling application. Managers create weekly schedules and shifts, staff members apply for shifts, and managers assign them.

This repository contains two independent services:

| Service      | Tech                                 | Directory   |
|--------------|--------------------------------------|-------------|
| **API**      | Ruby on Rails 7 (API-only, JSON:API) | `api/`      |
| **Frontend** | React 19, TypeScript, Vite, TanStack | `frontend/` |

Both services run in Docker containers.

## Core Business Models

```
Account
  └── User (role: admin / manager / staff)
  └── Schedule (state: draft → published)
        └── Shift (starts_at, ends_at, desired_coverage)
              └── Application (state: new → applied → assigned → cancelled)
```

### Account

The top-level tenant. Everything is scoped to an account, identified by its `subdomain`. Multi-tenancy is enforced via URL structure (`/v1/{subdomain}/...`).

### User

Belongs to an account. Has a `role` that determines permissions:

- **Admin** — full access to everything within the account.
- **Manager** — manages schedules, shifts, and applications.
- **Staff** — can view published schedules/shifts and manage their own applications.

Authentication is HTTP Basic (`email` + `password`, scoped to `account_id`).

### Schedule

A weekly scheduling period, defined by a `bop` (beginning of period) date. Schedules start as **draft** and can be **published** — once published, they become visible to staff.

### Shift

A concrete time slot within a schedule (e.g. Monday 9:00–17:00). Has a `desired_coverage` indicating how many people are needed.

### Application

A staff member's request to work a shift. Follows a state machine: **new** → **applied** → **assigned** (or **cancelled** at any point). Managers review applications and assign staff to shifts.

## Getting Started

Both services require **Docker and Docker Compose**. Each has its own setup script.

### 1. Start the API

```bash
cd api
bin/setup
bin/dev up
```

This starts the Rails API on **http://localhost:3000** and Swagger UI on **http://localhost:8080**.

The database is seeded with a `demo` account, four users, a published schedule with daily shifts, and some sample applications.

### 2. Start the Frontend

```bash
cd frontend
bin/setup
bin/dev up
```

This starts the React app on **http://localhost:5173**.

### 3. Log in

- **Subdomain**: `demo`
- **Users**: `admin@demo.com` / `manager@demo.com` / `staff@demo.com` / `staff2@demo.com`
- **Password**: `password` (for all)

## Where to Go Next

- **[api/README.md](api/README.md)** — API architecture, patterns (CommonController, Decorators, AASM), URL structure, curl examples, and dev commands (rspec, rubocop, rails console).
- **[frontend/README.md](frontend/README.md)** — Frontend tech stack, project structure, and dev commands (typecheck, lint, test).
- **[api/public/v1/openapi.json](api/public/v1/openapi.json)** — OpenAPI spec (also available via Swagger UI at http://localhost:8080 when running).
