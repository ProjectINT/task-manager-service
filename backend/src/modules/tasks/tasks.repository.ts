import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskCounter, TaskStatus } from '@prisma/client';

import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface FindTasksParams {
  status?: TaskStatus;
  dueDate?: Date;
  skip: number;
  take: number;
}

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany({ status, dueDate, skip, take }: FindTasksParams): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (dueDate) {
      where.dueDate = {
        lte: dueDate,
      };
    }

    return this.prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count({ status, dueDate }: Omit<FindTasksParams, 'skip' | 'take'>): Promise<number> {
    const where: Prisma.TaskWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (dueDate) {
      where.dueDate = {
        lte: dueDate,
      };
    }

    return this.prisma.task.count({ where });
  }

  findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  create(data: CreateTaskDto): Promise<Task> {
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate,
      },
    });
  }

  update(id: string, data: UpdateTaskDto): Promise<Task> {
    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: string): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }

  async getCounters(): Promise<TaskCounter> {
    const counters = await this.prisma.taskCounter.findUnique({ where: { id: 0 } });

    if (!counters) {
      throw new Error('Task counters not found');
    }

    return counters;
  }
}
