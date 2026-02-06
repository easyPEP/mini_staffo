# MiniStaffomatic

A simplified staff scheduling application. Managers create weekly schedules and shifts, staff members apply for shifts, and managers assign them.

## Table of Contents

- [Interview Options](#interview-options)
  - [Option 1: Pair Programming Session](#option-1-pair-programming-session)
  - [Option 2: Code Challenge](#option-2-code-challenge)
- [Core Business Models](#core-business-models)
- [Getting Started](#getting-started)
- [Where to Go Next](#where-to-go-next)

---

This repository contains two independent services:

| Service      | Tech                                 | Directory   |
| ------------ | ------------------------------------ | ----------- |
| **API**      | Ruby on Rails 7 (API-only, JSON:API) | `api/`      |
| **Frontend** | React 19, TypeScript, Vite, TanStack | `frontend/` |

Both services run in Docker containers.

## Interview Options

### Option 1: Pair Programming Session

If you're here for a pair programming session, your interviewer will guide you through the codebase and the task. No additional setup is required beforehand — just make sure you have Docker installed and the services running (see [Getting Started](#getting-started)).

### Option 2: Code Challenge

If you're completing the code challenge independently, follow the steps below.

#### Steps to Complete

1. **Create your own repository** (do not fork this one)

   Create a new private repository on GitHub, then mirror this repo:

   ```bash
   git clone --bare git@github.com:staffomatic/mini_staffomatic.git
   cd mini_staffomatic.git
   git push --mirror git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
   cd ..
   rm -rf mini_staffomatic.git
   ```

   Then clone your new repository:

   ```bash
   git clone git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Get the app running** — follow the [Getting Started](#getting-started) section below

3. **Read the task** — your recruiter will share the task details with you

4. **Implement your solution** — create a new branch and make your changes

#### Submit Your Work

1. Create a pull request from your feature branch to `main` in your repository
2. Invite the following GitHub users as collaborators so we can review:
   - `@martingregoire`
   - `@fluxsaas`

3. Send the PR link to your recruiter

---

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

Both services require **Docker and Docker Compose**. Each has its own setup script. Make sure to start the API first, as the frontend depends on it.

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
