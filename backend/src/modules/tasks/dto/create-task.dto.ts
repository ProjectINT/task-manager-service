import { TaskStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const normalizeStatus = (value: unknown): TaskStatus | unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim().toUpperCase().replace(/-/g, '_');
  return TaskStatus[normalized as keyof typeof TaskStatus] ?? value;
};

export class CreateTaskDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeStatus(value))
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsISO8601()
  dueDate?: string;
}
