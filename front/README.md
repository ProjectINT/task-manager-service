# Task Manager - Frontend (Nuxt 3)

Modern frontend for Task Manager with full REST API integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run dev server
npm run dev
```

Application will be available at http://localhost:3000

## 📋 Requirements

- Node.js >= 18.0.0
- Backend API running on http://localhost:3001

## 🏗️ Architecture

### Tech Stack

- **Framework**: Nuxt 3
- **State Management**: Pinia
- **UI**: Nuxt UI
- **TypeScript**: Full typing
- **API**: REST (fetch)

### Project Structure

```
app/
├── composables/
│   └── useApi.ts              # API client
├── components/
│   ├── TaskForm/              # Create/edit form
│   ├── TasksList/             # Tasks list
│   └── TasksHeader.vue        # Header
├── store/
│   └── tasks.ts               # Pinia store with API integration
└── utils/
    └── taskStatus.ts          # Status utilities

types/
└── index.ts                   # TypeScript types

assets/
└── css/
    └── main.css              # Global styles
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

## 📦 Pinia Store

### Main Features

```typescript
const tasksStore = useTasksStore()

// Initialize
await tasksStore.initialize()

// CRUD operations
await tasksStore.createTask(newTask)
await tasksStore.updateTask(id, updates)
await tasksStore.deleteTask(id)

// Filtering
await tasksStore.setFilter({ type: 'pending' })
await tasksStore.clearFilters()

// Pagination
await tasksStore.loadNextPage()
await tasksStore.loadPreviousPage()

// Counters
const counters = tasksStore.tasksCountByStatus
```

### State

```typescript
{
  tasks: Task[]              // Current tasks
  counters: TaskCounters     // Status counters
  currentPage: number        // Current page
  totalPages: number         // Total pages
  totalTasks: number         // Total tasks
  pageSize: number          // Page size
  filter: TaskFilter        // Active filters
  loading: boolean          // Loading state
  error: string | null      // Error
}
```

## 🎨 Component Usage

### Basic Example

```vue
<template>
  <div>
    <!-- Loading -->
    <div v-if="store.isLoading">Loading...</div>
    
    <!-- Error -->
    <div v-else-if="store.errorMessage">
      {{ store.errorMessage }}
    </div>
    
    <!-- Tasks -->
    <div v-else>
      <div v-for="task in store.filteredTasks" :key="task.id">
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <span>{{ task.status }}</span>
      </div>
    </div>
    
    <!-- Pagination -->
    <button 
      @click="store.loadPreviousPage()"
      :disabled="store.currentPage === 1"
    >
      Previous
    </button>
    <span>Page {{ store.currentPage }} / {{ store.totalPages }}</span>
    <button 
      @click="store.loadNextPage()"
      :disabled="!store.hasMorePages"
    >
      Next
    </button>
  </div>
</template>

<script setup lang="ts">
const store = useTasksStore()

onMounted(() => {
  store.initialize()
})
</script>
```

### Create Task

```vue
<script setup lang="ts">
const store = useTasksStore()

const createNewTask = async () => {
  try {
    await store.createTask({
      title: 'New Task',
      description: 'Task description',
      status: 'pending',
      dueDate: '2025-12-31T00:00:00Z'
    })
    // Success!
  } catch (error) {
    // Handle error
    console.error(store.errorMessage)
  }
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
const filterByDate = (date: Date) => {
  store.setFilter({ dueDate: date })
}

// Clear
const clearFilters = () => {
  store.clearFilters()
}
</script>
```

## 🌐 API Integration

### API Client (`useApi`)

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

// Get task
const task = await api.tasks.getById(id)

// Create
const newTask = await api.tasks.create(data)

// Update
const updated = await api.tasks.update(id, updates)

// Delete
await api.tasks.delete(id)
```

## 📝 Types

### Task

```typescript
interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus  // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate: string | null
  createdAt: string
  updatedAt: string
}
```

### TaskCounters

```typescript
interface TaskCounters {
  pending: number
  in_progress: number
  completed: number
  cancelled: number
  total: number
}
```

## 🧪 Testing

```bash
# Run tests
npm run test

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

## 📚 Documentation

- [Store API Guide](./app/store/README.md) - Store API documentation
- [Component Examples](./app/components/TasksApiDemo.vue) - Usage examples

## 🔍 Debugging

### Logging

Store automatically logs all operations:

```
✅ Loaded 10 tasks (page 1/10)
✅ Task created: { id: '...', title: '...' }
✅ Task updated: { id: '...', title: '...' }
✅ Task deleted: ...
✅ Counters loaded: { pending: 24, ... }
```

### Errors

All errors are available via:

```typescript
if (store.errorMessage) {
  console.error(store.errorMessage)
}
```

## 🚀 Deployment

### Production Build

```bash
# Build application
npm run build

# Preview production build
npm run preview
```

### Environment Variables

For production set:

```env
NUXT_PUBLIC_API_BASE=https://your-api-domain.com/api
```

## 🛠️ Development

### Development Server

```bash
npm run dev
```

Server will start at http://localhost:3000

### Hot Module Replacement

All changes are applied automatically without page reload.

## 📦 Scripts

```bash
npm run dev          # Run dev server
npm run build        # Production build
npm run preview      # Preview production
npm run lint         # Linting
npm run generate     # Static generation
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Ensure no linting errors
4. Create Pull Request

## 📄 License

MIT

---

**Made with ❤️ using Nuxt 3 + Pinia**
