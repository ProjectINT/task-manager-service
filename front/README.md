# Frontend - Task Manager

Modern Nuxt 3 frontend with Pinia state management and REST API integration.

## Tech Stack

- **Nuxt 3** - Vue 3 framework with SSR
- **Pinia** - State management
- **Nuxt UI** - UI components
- **TypeScript** - Full type safety
- **Fetch API** - HTTP client

## Prerequisites

- Node.js >= 18.0.0
- Backend API running on `http://localhost:3001`

## Installation

```bash
npm install
```

## Environment Variables

Create `.env` file:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

## Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

Application will be available at `http://localhost:3000`

## Architecture

### Independent Components Pattern

Components connect directly to centralized store without prop drilling:

```
Component → Store → API → Backend
    ↑         ↓
    └─────────┘
  Subscribe to state
```

**Benefits:**
- Clean component code
- Simplified data flow
- Easy testing
- No prop drilling

## Project Structure

```
app/
├── components/
│   ├── TasksList/           # Task list with filters
│   │   ├── Item/            # Task item
│   │   └── Filter/          # Status filter
│   ├── TaskForm/            # Create/edit form
│   └── TasksHeader.vue      # Header with counters
├── store/
│   └── tasks.ts             # Pinia store (state + actions)
├── composables/
│   └── useApi.ts            # API client
├── utils/
│   └── taskStatus.ts        # Status utilities
└── types/
    └── index.ts             # TypeScript types
```

## Store API (Pinia)

### Initialize

```typescript
const store = useTasksStore()
await store.initialize()
```

### State

```typescript
{
  tasks: Task[]              // Current tasks
  counters: TaskCounters     // Status counters
  currentPage: number        // Current page
  totalPages: number         // Total pages
  totalTasks: number         // Total tasks count
  pageSize: number          // Items per page
  filter: TaskFilter        // Active filters
  loading: boolean          // Loading state
  error: string | null      // Error message
}
```

### Actions

```typescript
// CRUD
await store.createTask(data)
await store.updateTask(id, updates)
await store.deleteTask(id)

// Filtering
await store.setFilter({ type: 'pending' })
await store.setFilter({ dueDate: '2025-12-31' })
await store.clearFilters()

// Pagination
await store.loadNextPage()
await store.loadPreviousPage()
```

### Getters

```typescript
store.filteredTasks         // Filtered tasks
store.tasksCountByStatus    // Status counters
store.isLoading             // Loading state
store.errorMessage          // Error message
store.hasMorePages          // Has next page
```

## Component Usage

### Basic Example

```vue
<template>
  <div>
    <div v-if="store.isLoading">Loading...</div>
    <div v-else-if="store.errorMessage">{{ store.errorMessage }}</div>
    <div v-else>
      <div v-for="task in store.filteredTasks" :key="task.id">
        {{ task.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useTasksStore()

onMounted(() => {
  store.initialize()
})
</script>
```

### CRUD Operations

```vue
<script setup lang="ts">
const store = useTasksStore()

// Create
const createTask = async () => {
  await store.createTask({
    title: 'New Task',
    description: 'Description',
    status: 'pending',
    dueDate: '2025-12-31T00:00:00Z'
  })
}

// Update
const updateTask = async (id: string) => {
  await store.updateTask(id, { status: 'completed' })
}

// Delete
const deleteTask = async (id: string) => {
  await store.deleteTask(id)
}
</script>
```

### Filtering

```vue
<script setup lang="ts">
const store = useTasksStore()

// By status
const filterByStatus = (status: TaskStatus) => {
  store.setFilter({ type: status })
}

// By date
const filterByDate = (date: string) => {
  store.setFilter({ dueDate: date })
}

// Clear
const clearFilters = () => {
  store.clearFilters()
}
</script>
```

## API Client

```typescript
const api = useApi()

// Get tasks
const response = await api.tasks.getAll({ 
  page: 1, 
  limit: 10,
  status: 'pending' 
})

// Get counters
const counters = await api.tasks.getCounters()

// Get by ID
const task = await api.tasks.getById(id)

// Create
const newTask = await api.tasks.create(data)

// Update
const updated = await api.tasks.update(id, updates)

// Delete
await api.tasks.delete(id)
```

## TypeScript Types

### Task

```typescript
interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
```

### Counters

```typescript
interface TaskCounters {
  pending: number
  in_progress: number
  completed: number
  cancelled: number
  total: number
}
```

### Filter

```typescript
interface TaskFilter {
  type?: TaskStatus
  dueDate?: string
}
```

## Debugging

Store logs all operations:

```
✅ Loaded 10 tasks (page 1/10)
✅ Task created: { id: '...', title: '...' }
✅ Task updated: { id: '...', title: '...' }
✅ Task deleted: ...
✅ Counters loaded: { pending: 24, ... }
```

Access errors:

```typescript
if (store.errorMessage) {
  console.error(store.errorMessage)
}
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run generate     # Static site generation
npm run lint         # ESLint check
```

## Deployment

### Production Build

```bash
npm run build
npm run preview
```

### Environment

For production:

```env
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Linting
npm run lint
```
