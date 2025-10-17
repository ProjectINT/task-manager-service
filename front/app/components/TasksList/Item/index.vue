<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import { useTasksStore } from '../../../store/tasks'
import type { Task, TaskStatus } from '../../../../types'
import StatusBadge from './StatusBadge.vue'

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

const canComplete = computed(() => task.value?.status !== 'completed')
const canStart = computed(() => task.value?.status === 'pending')

function handleStatusChange(status: TaskStatus) {
	if (!task.value) return
	tasksStore.updateTask(task.value.id, { status })
	toast.add({ title: 'Status updated', color: 'info' })
}

function editTask() {
	emit('edit', props.taskId)
}

async function deleteTask() {
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
		<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
			<div class="flex-1">
				<div class="flex flex-wrap items-center gap-2 mb-2">
					<h3 class="text-lg font-semibold">
						{{ task.title }}
					</h3>
					<StatusBadge :status="task.status" />
				</div>

				<p v-if="task.description" class="text-gray-600 dark:text-gray-400 mb-2">
					{{ task.description }}
				</p>

				<p v-if="dueDateLabel" class="text-sm text-gray-500 dark:text-gray-500">
					Due {{ dueDateLabel }}
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<UButton
					v-if="canStart"
					color="primary"
					size="sm"
					:disabled="disabled"
					@click="handleStatusChange('in-progress')"
				>
					Start
				</UButton>

				<UButton
					v-if="canComplete"
					color="success"
					size="sm"
					:disabled="disabled"
					@click="handleStatusChange('completed')"
				>
					Complete
				</UButton>

				<UButton
					icon="i-heroicons-pencil-square"
					color="neutral"
					size="sm"
					variant="ghost"
					:disabled="disabled"
					@click="editTask"
				/>

				<UButton
					icon="i-heroicons-trash"
					color="error"
					size="sm"
					variant="ghost"
					:disabled="disabled"
					@click="deleteTask"
				/>
			</div>
		</div>
	</UCard>
</template>
