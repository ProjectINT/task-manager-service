import { Injectable } from '@nestjs/common';
import { Prisma, Task, TaskCounter, TaskStatus } from '@prisma/client';

import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface FindTasksParams {
  status?: TaskStatus;
  dateFrom?: Date;
  dateTo?: Date;
  skip: number;
  take: number;
}

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany({ status, dateFrom, dateTo, skip, take }: FindTasksParams) {
    const where: Prisma.TaskWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.dueDate = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { items, total };
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

  getCounters(): Promise<TaskCounter | null> {
    return this.prisma.taskCounter.findUnique({ where: { id: 0 } });
  }
}
