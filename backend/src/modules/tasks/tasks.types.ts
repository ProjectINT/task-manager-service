import { Task } from '@prisma/client';

// Используем тип Task напрямую из Prisma
// NestJS автоматически сериализует Date в string при возврате JSON
export type TaskDto = Task;

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
}
