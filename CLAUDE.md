# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MiniStaffomatic is a staff scheduling application with two independent services:

- **API** (`/api`): Ruby on Rails 7, MySQL 8.0, Redis — see [api/README.md](api/README.md)
- **Frontend** (`/frontend`): React 19, TypeScript, Vite, TanStack — see [frontend/README.md](frontend/README.md)

Both services run in Docker containers. Start the API first as the frontend depends on it.

For getting started, demo credentials, and data model details, see the main [README.md](README.md).

## Quick Reference

### API

```bash
bin/dev exec api bundle exec rspec spec/requests/api/v1/shifts_spec.rb  # Single test
bin/dev exec api bundle exec rspec                                       # All tests
bin/dev exec api bundle exec rubocop                                     # Lint
```

### Frontend

```bash
bin/dev exec frontend pnpm test              # Tests
bin/dev exec frontend pnpm typecheck         # TypeScript
bin/dev exec frontend pnpm lint              # ESLint
bin/generate-api                             # Regenerate API client after API changes
```

## Key Patterns

**CommonController** (`api/app/controllers/api/v1/common_controller.rb`) — Convention-based CRUD. Resource controllers inherit and define only `common_params` and collection scope.

**BaseDecorator** (`api/app/decorators/base_decorator.rb`) — Wraps create/update/destroy with hooks (`before_assign_attributes`, `after_save`, `update_state` for AASM transitions).

**Orval API Client** (`frontend/src/generated/`) — Generated from OpenAPI spec. Run `bin/generate-api` in frontend after API changes.

**TanStack Router** (`frontend/src/routes/`) — File-based routing. Protected routes under `_authenticated/` layout.
