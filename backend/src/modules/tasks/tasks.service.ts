import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Task, TaskCounter, TaskStatus } from '@prisma/client';

import { RedisService } from '../../infra/cache/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository } from './tasks.repository';
import { TaskDto, TaskListResponseDto } from './tasks.types';

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
    const dueDate = query.dueDate ? new Date(query.dueDate) : undefined;

    const cacheKey = this.buildCacheKey({
      page,
      limit,
      status: query.status,
      dueDate: query.dueDate,
    });

    const cached = await this.redisService.get<TaskListResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const [items, total] = await Promise.all([
      this.tasksRepository.findMany({
        status: query.status,
        dueDate,
        skip,
        take: limit,
      }),
      this.tasksRepository.count({
        status: query.status,
        dueDate,
      }),
    ]);

    const response: TaskListResponseDto = {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: total ? Math.ceil(total / limit) : 0,
      },
    };

    await this.redisService.set(cacheKey, response, LIST_CACHE_TTL_SECONDS);

    return response;
  }

  async getCounters(): Promise<TaskCounter> {
    const cacheKey = 'tasks:counters';

    const cached = await this.redisService.get<TaskCounter>(cacheKey);
    if (cached) {
      return cached;
    }

    const counters = await this.tasksRepository.getCounters();

    await this.redisService.set(cacheKey, counters, LIST_CACHE_TTL_SECONDS);

    return counters;
  }

  async getTaskById(id: string): Promise<TaskDto> {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  async createTask(dto: CreateTaskDto): Promise<TaskDto> {
    const task = await this.tasksRepository.create(dto);
    await this.invalidateListCache();
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    try {
      const task = await this.tasksRepository.update(id, dto);
      await this.invalidateListCache();
      return task;
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
    dueDate?: string;
  }) {
    const parts = [LIST_CACHE_PREFIX, `page=${params.page}`, `limit=${params.limit}`];

    if (params.status) {
      parts.push(`status=${params.status}`);
    }

    if (params.dueDate) {
      parts.push(`dueDate=${params.dueDate}`);
    }

    return parts.join(':');
  }

  private handlePrismaNotFound(error: unknown, id: string) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }
}
