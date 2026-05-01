import { Problem } from './problem.interface.js';

export type OperationResult<T> = {
  isSuccess: boolean;
  error?: Problem;
  response?: T | void;
  value?: T | void;
};

export interface PaginatedMetaDto {
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export interface StandardResponseDto<T> {
  message: string;
  data: T;
}
export interface StandardPaginatedResponseDto<T> extends StandardResponseDto<T> {
  meta: PaginatedMetaDto;
}
