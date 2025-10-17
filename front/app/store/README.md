# Tasks Store API

## 🚀 Quick Start

```typescript
const store = useTasksStore()

// Initialize
onMounted(() => store.initialize())

// CRUD
await store.createTask({ title, description, status, dueDate })
await store.updateTask(id, { status: 'completed' })
await store.deleteTask(id)

// Filters & Pagination
await store.setFilter({ type: 'pending' })
await store.loadNextPage()
```

## 📦 Main Methods

| Method | Description |
|--------|-------------|
| `initialize()` | Load tasks + counters |
| `createTask(data)` | Create new task |
| `updateTask(id, data)` | Update task |
| `deleteTask(id)` | Delete task |
| `setFilter(filter)` | Filter by status/date |
| `loadNextPage()` | Next page |

## 🎯 Key Getters

- `filteredTasks` - Current page tasks
- `tasksCountByStatus` - Status counters
- `isLoading` - Loading state
- `errorMessage` - Error message

## 🌐 API Config

`.env` file:
```env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```
