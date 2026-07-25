import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { StandardPaginatedResponseDto, StandardResponseDto } from '../dto';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor<unknown, StandardResponseDto<unknown>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<StandardResponseDto<any>> {
    return next.handle().pipe(
      map((res) => {
        // If the response already contains a 'success' property, assume it's correctly structured
        if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "success")) {
          return res;
        }

        // Extract known response fields: message, meta, and data (renamed to inner)
        const { message, meta, data: inner, ...rest } = res ?? {};

        // If data is an array or pagination metadata exists, return a paginated response
        if (rest && (rest.meta !== undefined || rest.page !== undefined)) {
          return {
            message: message ?? "درخواست با موفقیت انجام شد",
            data: inner ?? rest,
            meta: meta ?? ({} as any)
          } as StandardPaginatedResponseDto<any>;
        }

        // Otherwise return a standard response without pagination
        return {
          message: message ?? "درخواست با موفقیت انجام شد",
          data: inner ?? res
        } as StandardResponseDto<any>;
      })
    );
  }
}
