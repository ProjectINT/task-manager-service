<script setup lang="ts">
import type { Task, TaskStatus } from '../../../../types'

interface Props {
	task: Task
	disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
	(e: 'statusChange', status: TaskStatus): void
	(e: 'edit'): void
	(e: 'delete'): void
}>()

const canComplete = computed(() => props.task.status !== 'completed')
const canStart = computed(() => props.task.status === 'pending')

function handleStatusChange(status: TaskStatus) {
	emit('statusChange', status)
}

function handleEdit() {
	emit('edit')
}

function handleDelete() {
	emit('delete')
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
