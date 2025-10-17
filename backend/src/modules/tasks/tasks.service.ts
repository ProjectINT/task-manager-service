import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Task, TaskCounter, TaskStatus } from '@prisma/client';

import { RedisService } from '../../infra/cache/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository } from './tasks.repository';
import { TaskCountersDto, TaskDto, TaskListResponseDto } from './tasks.types';

const LIST_CACHE_PREFIX = 'tasks:list';
const LIST_CACHE_TTL_SECONDS = 60;

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly redisService: RedisService,
  ) {}

  async getTasks(query: QueryTasksDto): Promise<TaskListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    const cacheKey = this.buildCacheKey({
      page,
      limit,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    const cached = await this.redisService.get<TaskListResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const [{ items, total }, counters] = await Promise.all([
      this.tasksRepository.findMany({
        status: query.status,
        dateFrom,
        dateTo,
        skip,
        take: limit,
      }),
      this.tasksRepository.getCounters(),
    ]);

    const response: TaskListResponseDto = {
      data: items.map(mapTask),
      meta: {
        page,
        limit,
        total,
        totalPages: total ? Math.ceil(total / limit) : 0,
      },
      counters: mapCounters(counters),
    };

    await this.redisService.set(cacheKey, response, LIST_CACHE_TTL_SECONDS);

    return response;
  }

  async getTaskById(id: string): Promise<TaskDto> {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return mapTask(task);
  }

  async createTask(dto: CreateTaskDto): Promise<TaskDto> {
    const task = await this.tasksRepository.create(dto);
    await this.invalidateListCache();
    return mapTask(task);
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    try {
      const task = await this.tasksRepository.update(id, dto);
      await this.invalidateListCache();
      return mapTask(task);
    } catch (error) {
      this.handlePrismaNotFound(error, id);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.tasksRepository.delete(id);
      await this.invalidateListCache();
    } catch (error) {
      this.handlePrismaNotFound(error, id);
      throw error;
    }
  }

  private async invalidateListCache() {
    await this.redisService.delPattern(`${LIST_CACHE_PREFIX}:*`);
  }

  private buildCacheKey(params: {
    page: number;
    limit: number;
    status?: TaskStatus;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const parts = [LIST_CACHE_PREFIX, `page=${params.page}`, `limit=${params.limit}`];

    if (params.status) {
      parts.push(`status=${params.status}`);
    }

    if (params.dateFrom) {
      parts.push(`dateFrom=${params.dateFrom}`);
    }

    if (params.dateTo) {
      parts.push(`dateTo=${params.dateTo}`);
    }

    return parts.join(':');
  }

  private handlePrismaNotFound(error: unknown, id: string) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }
}

const mapTask = (task: Task): TaskDto => ({
  id: task.id,
  title: task.title,
  description: task.description ?? null,
  status: task.status,
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

const mapCounters = (counters: TaskCounter | null): TaskCountersDto => ({
  total: counters?.total ?? 0,
  pending: counters?.pending ?? 0,
  inProgress: counters?.inProgress ?? 0,
  completed: counters?.completed ?? 0,
});
