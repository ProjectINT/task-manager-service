<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '#imports'
import { useTasksStore } from '../../../store/tasks'
import type { Task, TaskStatus } from '../../../../types'

interface Props {
	taskId: Task['id']
	disabled?: boolean
}

const props = defineProps<Props>()

const tasksStore = useTasksStore()
const toast = useToast()

const task = computed(() => tasksStore.getTaskById(props.taskId))

const canComplete = computed(() => task.value?.status !== 'completed')
const canStart = computed(() => task.value?.status === 'pending')

function handleStatusChange(status: TaskStatus) {
	if (!task.value) return
	tasksStore.updateTask(task.value.id, { status })
	toast.add({ title: 'Status updated', color: 'info' })
}

function handleEdit() {
	if (!task.value) return
	tasksStore.openTaskEditForm(task.value.id)
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
	<div class="flex flex-wrap items-center justify-end gap-2">
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
			@click="handleEdit"
		/>

		<UButton
			icon="i-heroicons-trash"
			color="error"
			size="sm"
			variant="ghost"
			:disabled="disabled"
			@click="handleDelete"
		/>
	</div>
</template>
