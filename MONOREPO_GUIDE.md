# Monorepo Setup - Quick Start

## Why Monorepo?

Monorepo architecture creates a **monolithic, consistent structure** that allows:

- **🔄 Code Sharing** - Share validation rules, types, and utilities between backend and frontend
- **📘 Type Safety** - Use the same TypeScript types across the entire stack
- **🎯 Single Source of Truth** - One place for shared constants and business logic
- **⚡ Consistency** - Unified code style, linting, and tooling
- ** Type-Safe Contracts** - Backend and frontend stay in sync automatically

## Quick Start

```bash
# Install all dependencies
npm install
cd backend && npm install
cd ../front && npm install

# Run both servers
npm run dev

# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

## Available Commands

```bash
npm run dev              # Run both servers
npm run build            # Build both apps
npm run lint             # Lint both apps
npm run test:backend     # Run backend tests
```

## Project Structure

```
task-manager-service/
├── package.json            # Root with workspaces
├── validation/             # Shared validation & types
│   └── constants.ts
├── backend/                # NestJS API
│   ├── src/
│   └── package.json
└── front/                  # Nuxt frontend
    ├── app/
    └── package.json
```

## Shared Code Example

### Validation Constants

**Backend:**
```typescript
import { TASK_VALIDATION } from '../../../../../validation/constants';
```

**Frontend:**
```typescript
import { TASK_VALIDATION } from '../../validation/constants';
```

This ensures consistency across the entire application.

## Git Workflow

```bash
# All changes committed from root
git add .
git commit -m "feat: add feature"
git push
```

## IDE Setup

Open the root folder `task-manager-service` in VS Code. Workspaces are configured automatically.

**Recommended extensions:**
- ESLint
- Prettier
- Volar (Vue)
- EditorConfig
