import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getTasks(@Query() query: QueryTasksDto) {
    return this.tasksService.getTasks(query);
  }

  @Get('counters')
  getCounters() {
    return this.tasksService.getCounters();
  }

  @Get(':id')
  getTask(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  createTask(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
  }

  @Patch(':id')
  updateTask(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.tasksService.deleteTask(id);
  }
}
