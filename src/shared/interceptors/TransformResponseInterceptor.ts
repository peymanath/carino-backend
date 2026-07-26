import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StandardPaginatedResponseDto, StandardResponseDto } from '../dto';

type ResponsePayload = {
  message?: string;
  meta?: unknown;
  data?: unknown;
  success?: boolean;
  page?: number;
  [key: string]: unknown;
};

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor<unknown, StandardResponseDto<unknown>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<StandardResponseDto<unknown>> {
    return next.handle().pipe(
      map((res: unknown): StandardResponseDto<unknown> => {
        const response = (res && typeof res === 'object' ? res : {}) as ResponsePayload;

        if (Object.prototype.hasOwnProperty.call(response, 'success')) {
          return response as StandardResponseDto<unknown>;
        }

        const { message, meta, data: inner, ...rest } = response;

        if (rest.meta !== undefined || rest.page !== undefined) {
          return {
            message: message ?? 'درخواست با موفقیت انجام شد',
            data: inner ?? rest,
            meta: meta ?? {},
          } as StandardPaginatedResponseDto<unknown>;
        }

        return {
          message: message ?? 'درخواست با موفقیت انجام شد',
          data: inner ?? res,
        };
      })
    );
  }
}
