<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import { useTasksStore } from '../../store/tasks'
import type { Task, TaskStatus } from '../../../types'

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

const statusMeta = computed(() => {
	if (!task.value) return null
	switch (task.value.status) {
		case 'completed':
			return { label: 'Completed', color: 'success' as const }
		case 'in_progress':
			return { label: 'In progress', color: 'primary' as const }
		default:
			return { label: 'Pending', color: 'warning' as const }
	}
})

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
		<div class="flex flex-col md:flex-row md:items-start md:justify-between">
			<div>
				<div class="flex flex-wrap items-center">
					<h3>
						{{ task.title }}
					</h3>
					<UBadge v-if="statusMeta">
						{{ statusMeta.label }}
					</UBadge>
				</div>

				<p v-if="task.description">
					{{ task.description }}
				</p>

				<p v-if="dueDateLabel">
					Due {{ dueDateLabel }}
				</p>
			</div>

			<div class="flex flex-wrap items-center">
				<UButton
					v-if="canStart"
					:disabled="disabled"
					@click="handleStatusChange('in_progress')"
				>
					Start
				</UButton>

				<UButton
					v-if="canComplete"
					:disabled="disabled"
					@click="handleStatusChange('completed')"
				>
					Complete
				</UButton>

				<UButton
					icon="i-heroicons-pencil-square"
					:disabled="disabled"
					@click="editTask"
				/>

				<UButton
					icon="i-heroicons-trash"
					:disabled="disabled"
					@click="deleteTask"
				/>
			</div>
		</div>
	</UCard>
</template>
