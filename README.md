# Task Manager Service

> ⚠️ **This repository is an architectural concept, not production-ready code.**

A task management application demonstrating clean architecture patterns with NestJS backend and Nuxt 3 frontend.

## 📁 Project Structure

Monorepo with two main applications:
- **backend/** - NestJS REST API (PostgreSQL + Redis)
- **front/** - Nuxt 3 frontend (Vue 3 + Pinia)

## 🏗️ Architecture

### Frontend (Nuxt 3)

**Independent Components Pattern** - components connect directly to centralized store without prop drilling:

```
Component → Store → API → Backend
    ↑         ↓
    └─────────┘
  Subscribe to state
```

**Structure:**
```
app/
├── components/          # Atomic design structure
│   ├── TasksList/       # Smart component (store-connected)
│   │   ├── Item/        # Presentational components
│   │   └── Filter/
│   └── TaskForm/
├── store/
│   └── tasks.ts         # Pinia store (state + actions)
├── composables/
│   └── useApi.ts        # API client
└── types/               # Shared TypeScript types
```

**Benefits:** Clean Vue code without complex component interactions, simplified data flow, easier testing.

**Styling:** Minimal (Nuxt UI components with basic alignment only).

### Backend (NestJS)

**Layered Architecture:**

```
Controller → Service → Repository → Database
```

**Key Patterns:**

- **Module Pattern** - Feature-based encapsulation (TasksModule, PrismaModule, RedisModule)
- **Repository Pattern** - Data access abstraction, easy to mock and test
- **DTO Pattern** - Type-safe I/O with class-validator decorators (CreateTaskDto, UpdateTaskDto, QueryTasksDto)
- **Cache-Aside Pattern** - Redis caching with TTL and pattern-based invalidation
- **Database Triggers** - PostgreSQL triggers maintain `TaskCounter` table for O(1) counter queries without table scans
- **Pagination** - Cursor-based pagination with metadata

**Structure:**
```
src/
├── modules/
│   └── tasks/
│       ├── tasks.controller.ts
│       ├── tasks.service.ts
│       ├── tasks.repository.ts
│       └── dto/
├── infra/
│   ├── prisma/
│   └── cache/
└── common/
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm run install:all
```

### Development

Run both applications:
```bash
npm run dev
```

Or separately:
```bash
npm run dev:backend  # Port 3001
npm run dev:front    # Port 3000
```

### Docker Compose

Run backend with PostgreSQL and Redis:

```bash
docker compose up --build
```

Configuration in `backend/.env.docker`. Stop with `docker compose down` (add `-v` to reset database).

## Populate database
 - scripts/update-db.ts

```bash
npm run update:db
```

## 🛠 Tech Stack

**Backend:** NestJS, Prisma, PostgreSQL, Redis, TypeScript, Jest
**Frontend:** Nuxt 3, Vue 3, Pinia, TypeScript

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./front/README.md)

## 📝 License

MIT

