<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Task, TaskStatus } from '../../../types'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

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
}>()

const defaults = {
	title: '',
	description: '',
	status: 'pending' as TaskStatus
}

const state = reactive({ ...defaults })
const formDueDate = ref<Date | null>(null)

const isEditing = computed(() => props.mode === 'edit')

watch(
	() => props.task,
	(task) => {
		state.title = task?.title ?? ''
		state.description = task?.description ?? ''
		state.status = task?.status ?? 'pending'
		formDueDate.value = task?.dueDate ? new Date(task.dueDate) : null
	},
	{ immediate: true }
)

function resetForm() {
	state.title = defaults.title
	state.description = defaults.description
	state.status = defaults.status
	formDueDate.value = null
}

const validate = (state: any): FormError[] => {
	const errors = []
	if (!state.title || !state.title.trim()) {
		errors.push({ name: 'title', message: 'Title is required' })
	}
	return errors
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
	const payload: TaskFormValues = {
		title: event.data.title.trim(),
		description: event.data.description?.trim() || undefined,
		status: event.data.status,
		dueDate: formDueDate.value ? formDueDate.value.toISOString() : null
	}

	emit('submit', payload)

	if (!isEditing.value) {
		resetForm()
	}
}
</script>

<template>
	<UForm
		id="task-form"
		:validate="validate"
		:state="state"
		:disabled="loading"
		class="flex flex-col gap-6 justify-center p-4"
		@submit="onSubmit"
	>
		<UFormField label="Title" name="title" required>
			<UInput
				v-model="state.title"
				placeholder="Enter task title"
				autocomplete="off"
				class="w-full"
			/>
		</UFormField>

		<UFormField label="Description" name="description">
			<UTextarea
				v-model="state.description"
				placeholder="Describe the task"
				autoresize
				min-rows="3"
				class="w-full"
			/>
		</UFormField>

		<UFormField label="Status" name="status">
			<StatusSelect
				v-model="state.status"
			/>
		</UFormField>

		<DateSelect
			v-model="formDueDate"
			label="Due date"
		/>
	</UForm>
</template>
