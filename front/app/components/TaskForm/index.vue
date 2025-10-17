<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Task, TaskStatus } from '../../../types'

export type TaskFormValues = {
	title: string
	description?: string
	status: TaskStatus
	dueDate: string | null
}

const props = defineProps<{
	task?: Task | null
	mode: 'create' | 'edit'
	loading?: boolean
}>()

const emit = defineEmits<{
	(e: 'submit', values: TaskFormValues): void
	(e: 'cancel'): void
}>()

const defaults = {
	title: '',
	description: '',
	status: 'pending' as TaskStatus,
	dueDate: '' as string | null
}

const form = reactive({ ...defaults })
const formDueDate = ref<Date | null>(null)

const errors = reactive({
	title: ''
})

// Status options moved to reusable <StatusSelect /> component

const isEditing = computed(() => props.mode === 'edit')

watch(
	() => props.task,
	(task) => {
		form.title = task?.title ?? ''
		form.description = task?.description ?? ''
		form.status = task?.status ?? 'pending'
		formDueDate.value = task?.dueDate ? new Date(task.dueDate) : null
		errors.title = ''
	},
	{ immediate: true }
)

function resetForm() {
	form.title = defaults.title
	form.description = defaults.description
	form.status = defaults.status
	formDueDate.value = null
	errors.title = ''
}

function handleSubmit() {
	if (!form.title.trim()) {
		errors.title = 'Title is required'
		return
	}

	errors.title = ''

	const payload: TaskFormValues = {
		title: form.title.trim(),
		description: form.description?.trim() || undefined,
		status: form.status,
		dueDate: formDueDate.value ? formDueDate.value.toISOString() : null
	}

	emit('submit', payload)

	if (!isEditing.value) {
		resetForm()
	}
}
</script>

<template>
	<form
		@submit.prevent="handleSubmit"
		class="flex flex-col gap-6 justify-center p-4"
	>
		<UFormGroup label="Title" required :error="errors.title">
			<UInput
				v-model="form.title"
				placeholder="Enter task title"
				autocomplete="off"
				:disabled="loading"
				class="w-full"
			/>
		</UFormGroup>

		<UFormGroup label="Description">
			<UTextarea
				v-model="form.description"
				placeholder="Describe the task"
				:disabled="loading"
				autoresize
				min-rows="3"
				class="w-full"
			/>
		</UFormGroup>

			<UFormGroup label="Status">
				<StatusSelect
					v-model="form.status"
					:disabled="loading"
				/>
			</UFormGroup>

		<DateSelect
			v-model="formDueDate"
			label="Due date"
		/>

		<div class="flex gap-3 justify-end">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton type="submit" :loading="loading">
        {{ isEditing ? 'Save changes' : 'Create task' }}
      </UButton>
    </div>
	</form>
</template>
