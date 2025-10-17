<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../../store/tasks'
import type { TaskStatus } from '../../../types'

interface Props {
	loading?: boolean
}

defineProps<Props>()

const tasksStore = useTasksStore()
const { filteredTasks, tasksCountByStatus } = storeToRefs(tasksStore)

const hasTasks = computed(() => filteredTasks.value.length > 0)

function handleFilterChange(filterType: TaskStatus | null) {
	tasksStore.setFilter({ type: filterType })
}

function handleDueDateChange(date: Date | null) {
	tasksStore.setFilter({ dueDate: date })
}
</script>

<template>
	<section class="space-y-6">

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

		<TasksListEmptyState v-else-if="!hasTasks" />

		<div v-else class="space-y-2">
			<TransitionGroup name="list" tag="div" class="space-y-2">
				<TasksListItem
					v-for="task in filteredTasks"
					:key="task.id"
					:task-id="task.id"
					:disabled="loading"
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
