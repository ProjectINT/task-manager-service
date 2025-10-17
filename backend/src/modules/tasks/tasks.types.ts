import { TaskStatus } from '@prisma/client';

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCountersDto {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface TaskListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListResponseDto {
  data: TaskDto[];
  meta: TaskListMeta;
  counters: TaskCountersDto;
}
