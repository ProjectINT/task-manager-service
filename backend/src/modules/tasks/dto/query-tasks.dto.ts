import { TaskStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

const normalizeStatus = (value: unknown): TaskStatus | unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim().toUpperCase().replace(/-/g, '_');
  return TaskStatus[normalized as keyof typeof TaskStatus] ?? value;
};

export class QueryTasksDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => normalizeStatus(value))
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsISO8601()
  dateTo?: string;
}
