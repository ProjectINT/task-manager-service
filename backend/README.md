# Backend - Task Manager API

NestJS REST API with PostgreSQL and Redis caching.

## Tech Stack

- **NestJS** - Application framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **TypeScript** - Language
- **Jest** - Testing framework

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- Redis server

## Installation

```bash
npm install
```

## Environment Variables

Create `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
DIRECT_URL="postgresql://user:password@localhost:5432/taskmanager"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_USERNAME="default"
REDIS_PASSWORD=""
PORT="3001"
```

For Docker Compose setup, see `.env.docker`.

## Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

## Development

```bash
# Watch mode
npm run start:dev

# Standard mode
npm run start

# Production mode
npm run start:prod
```

API will be available at `http://localhost:3001/api`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Test Data Scripts

Located in `../scripts/`:

### Generate and Load Test Data
```bash
# Generate 100 tasks and save to generated-tasks.json
npm run generate-tasks

# Load tasks from generated-tasks.json to database
npm run update-db
```

### Run API Tests
```bash
# Run comprehensive API test suite
npm run test-api
```

Tests all endpoints: GET, POST, PATCH, DELETE, counters, pagination, filtering.

## API Endpoints

### Tasks
- `GET /api/tasks` - List tasks (pagination + filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Counters
- `GET /api/tasks/counters` - Get task counters by status

## Project Structure

```
src/
├── modules/
│   └── tasks/           # Tasks feature module
│       ├── tasks.controller.ts
│       ├── tasks.service.ts
│       ├── tasks.repository.ts
│       └── dto/
├── infra/
│   ├── prisma/          # Database module
│   └── cache/           # Redis module
└── common/              # Shared utilities
```

## Architecture

- **Layered Architecture**: Controller → Service → Repository → Database
- **Repository Pattern**: Data access abstraction
- **DTO Pattern**: Type-safe input/output validation
- **Cache-Aside**: Redis caching with TTL
- **Database Triggers**: Maintain task counters in real-time
