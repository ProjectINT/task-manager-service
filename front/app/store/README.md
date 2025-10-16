# Pinia Store для Task Manager

## Usage

### In Components

```vue
<script setup lang="ts">
import { useTasksStore } from '~/store/tasks'
import type { Task } from '~/types'

const tasksStore = useTasksStore()

// Get data
const tasks = computed(() => tasksStore.filteredTasks)
const loading = computed(() => tasksStore.loading)
const totalTasks = computed(() => tasksStore.totalTasks)

// Change filter
const setFilter = (filter: 'all' | 'pending' | 'in-progress' | 'completed') => {
  tasksStore.setFilter(filter)
}

// Create task
const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  await tasksStore.createTask(taskData)
}

// Update task
const updateTask = (id: string | number, updates: Partial<Task>) => {
  tasksStore.updateTask(id, updates)
}

// Delete task
const deleteTask = async (id: string | number) => {
  await tasksStore.deleteTask(id)
}

// Load tasks on mount
onMounted(async () => {
  await tasksStore.fetchTasks()
})
</script>
```

### In Composition API

```typescript
import { useTasksStore } from '~/store/tasks'

export function useTaskManagement() {
  const store = useTasksStore()
  
  const addNewTask = (title: string, description?: string) => {
    store.addTask({
      id: Date.now(),
      title,
      description,
      status: 'pending'
    })
  }
  
  return {
    tasks: computed(() => store.filteredTasks),
    addNewTask,
    updateTask: store.updateTask,
    removeTask: store.removeTask
  }
}
```

## Available Methods

### State
- `tasks` - array of all tasks
- `filter` - current filter ('all' | 'pending' | 'in-progress' | 'completed')
- `loading` - loading state
- `error` - error message

### Getters
- `filteredTasks` - filtered tasks
- `getTaskById(id)` - get task by ID
- `tasksCountByStatus` - task count by status
- `hasTasks` - whether there are any tasks
- `totalTasks` - total number of tasks

### Actions
- `setFilter(filter)` - set filter
- `addTask(task)` - add task
- `updateTask(id, updates)` - update task
- `removeTask(id)` - remove task
- `clearTasks()` - clear all tasks
- `fetchTasks()` - fetch tasks from API
- `createTask(task)` - create task via API
- `deleteTask(id)` - delete task via API

## Notes

- API methods (`fetchTasks`, `createTask`, `deleteTask`) contain mock implementations
- Replace them with actual API calls
- Store automatically updates `updatedAt` when tasks are modified
