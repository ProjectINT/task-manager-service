<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import { useTasksStore } from '../../../store/tasks'
import type { Task, TaskStatus } from '../../../../types'
import StatusBadge from './StatusBadge.vue'
import TaskActions from './TaskActions.vue'

interface Props {
	taskId: Task['id']
	disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
	(e: 'edit', taskId: Task['id']): void
}>()

const tasksStore = useTasksStore()
const toast = useToast()

const task = computed(() => tasksStore.getTaskById(props.taskId))

const dueDateLabel = computed(() => {
	if (!task.value?.dueDate) {
		return null
	}

	const date = new Date(task.value.dueDate)
	if (Number.isNaN(date.getTime())) {
		return null
	}
	return date.toLocaleDateString()
})

function handleStatusChange(status: TaskStatus) {
	if (!task.value) return
	tasksStore.updateTask(task.value.id, { status })
	toast.add({ title: 'Status updated', color: 'info' })
}

function handleEdit() {
	emit('edit', props.taskId)
}

async function handleDelete() {
	if (!task.value) return
	try {
		await tasksStore.deleteTask(task.value.id)
		toast.add({ title: 'Task deleted', color: 'success' })
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to delete task'
		toast.add({ title: 'Error', description: message, color: 'error' })
	}
}
</script>

<template>
	<UCard v-if="task">
    <template #header>
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <h3 class="text-lg font-semibold">
          {{ task.title }}
        </h3>
        <StatusBadge :status="task.status" />
      </div>
    </template>

		<div class="flex-1">
			<p v-if="task.description" class="text-gray-600 dark:text-gray-400 mb-2">
				{{ task.description }}
			</p>

			<p v-if="dueDateLabel" class="text-sm text-gray-500 dark:text-gray-500">
				Due {{ dueDateLabel }}
			</p>
		</div>

    <template #footer>
      <TaskActions
        v-if="task"
        :task="task"
        :disabled="disabled"
        @status-change="handleStatusChange"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </template>
	</UCard>
</template>
