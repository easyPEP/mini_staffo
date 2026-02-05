# MiniStaffomatic API

A Rails API for staff scheduling.

## Prerequisites

- Docker and Docker Compose

## Quick Start

```bash
bin/setup
bin/dev up
```

- API: http://localhost:3000
- Docs: http://localhost:8080

## Architecture

### Resources

| Resource    | Description                                   |
|-------------|-----------------------------------------------|
| Account     | Tenant (multi-tenant via subdomain)           |
| User        | Staff/Manager/Admin within an account         |
| Schedule    | Weekly schedule period (draft/published)      |
| Shift       | Time slot within a schedule                   |
| Application | User's application to a shift (state machine) |

### Patterns

- **CommonController** — Convention-based CRUD. Resource controllers inherit and only define `common_params` + collection scope.
- **Decorators** — `BaseDecorator` wraps create/update/destroy with hooks (`before_assign_attributes`, `after_save`, `update_state`). Resource decorators set `account_id`, `creator_id`, and handle state transitions.
- **AASM** — State machines for Schedule (`draft -> published`) and Application (`new -> applied -> assigned -> cancelled`).
- **CanCanCan** — Role-based authorization. Admin manages all, Manager manages schedules/shifts/applications, Staff reads published content + manages own applications.
- **JSON:API** — `jsonapi-serializer` for responses, `jsonapi.rb` for filtering/pagination.
- **Basic Auth** — HTTP Basic with Devise's `valid_password?`. Auth keys: `[email, account_id]`.

### URL Structure

```
/v1/{account_subdomain}/users
/v1/{account_subdomain}/schedules
/v1/{account_subdomain}/schedules/{id}/publish
/v1/{account_subdomain}/shifts
/v1/{account_subdomain}/applications
```

## API Examples

```bash
# List schedules
curl -u admin@demo.com:password http://localhost:3000/v1/demo/schedules

# Show a user
curl -u admin@demo.com:password http://localhost:3000/v1/demo/users/1

# Create a shift
curl -X POST -u admin@demo.com:password \
  -H 'Content-Type: application/json' \
  -d '{"data":{"attributes":{"starts_at":"2024-01-01T09:00:00Z","ends_at":"2024-01-01T17:00:00Z","desired_coverage":1},"relationships":{"schedule":{"data":{"type":"schedule","id":"1"}}}}}' \
  http://localhost:3000/v1/demo/shifts

# Publish a schedule
curl -X PUT -u admin@demo.com:password \
  http://localhost:3000/v1/demo/schedules/1/publish
```

**Demo credentials:** `admin@demo.com` / `manager@demo.com` / `staff@demo.com` / `staff2@demo.com` (password: `password`)

## Development Commands

```bash
# Run tests
bin/dev exec api bundle exec rspec

# Run linter
bin/dev exec api bundle exec rubocop

# Rails console
bin/dev exec api bundle exec rails console

# Reset database
bin/dev exec api bundle exec rails db:reset

# Regenerate Swagger (view at http://localhost:8080)
bin/dev exec api bundle exec rails rswag
```
