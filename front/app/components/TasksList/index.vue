<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../../store/tasks'
import type { Task, TaskStatus } from '../../../types'

interface Props {
	loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
	(e: 'edit-task', taskId: Task['id']): void
}>()

const tasksStore = useTasksStore()
const { filteredTasks, tasksCountByStatus } = storeToRefs(tasksStore)

const hasTasks = computed(() => filteredTasks.value.length > 0)

const emptyStateMessage = computed(() =>
	tasksStore.filter.type === null && !tasksStore.filter.dueDate
		? 'Create your first task to get organized.'
		: 'No tasks match these filters yet.'
)

function handleFilterChange(filterType: TaskStatus | null) {
	tasksStore.setFilter({ type: filterType })
}

function handleDueDateChange(date: Date | null) {
	tasksStore.setFilter({ dueDate: date })
}

function handleEdit(taskId: Task['id']) {
	emit('edit-task', taskId)
}
</script>

<template>
	<section class="space-y-4">

		<TasksListFilter
			:model-value="tasksStore.filter.type"
			:counts="tasksCountByStatus"
			:loading="loading"
			:due-date="tasksStore.filter.dueDate"
			@update:model-value="handleFilterChange"
			@update:due-date="handleDueDateChange"
		/>

		<div v-if="loading" class="space-y-2">
				<USkeleton v-for="index in 3" :key="index" class="h-20" />
		</div>

		<div v-else-if="!hasTasks" class="text-center py-8">
			<UIcon name="i-heroicons-clipboard-document-check" class="text-4xl mb-2" />
			<h3 class="text-lg font-semibold mb-2">No tasks yet</h3>
			<p class="text-gray-500 dark:text-gray-400">
				{{ emptyStateMessage }}
			</p>
			<slot name="empty-action" />
		</div>

		<div v-else class="space-y-2">
			<TransitionGroup name="list" tag="div" class="space-y-2">
				<TasksListItem
					v-for="task in filteredTasks"
					:key="task.id"
					:task-id="task.id"
					:disabled="loading"
					@edit="handleEdit"
				/>
			</TransitionGroup>
		</div>
	</section>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
	transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateY(8px);
}
</style>
