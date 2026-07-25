import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ProblemDetailsDto } from '../dto/ProblemDetails.dto';
import { ProblemDetails } from '../interfaces/http-exception.interface';
import { ValidationErrorResponse } from '../interfaces/validation.interface';
import { MESSAGES } from '../errors';
import { Var } from '../errors/errors.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    /**
     * Parse Input Data
     */
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    /**
     * Parse Exception Data
     */
    const status = this.getHttpStatus(exception);
    const responseBody = this.getResponseBody(exception);

    /**
     * Generate Response Model
     */
    const problemDetails: ProblemDetails = Object.assign(new ProblemDetailsDto(), {
      title: this.getTitleWithStatusCode(status),
      status: this.extractStatus(responseBody, status),
      detail: this.extractDetail(responseBody),
      errors: this.extractErrors(exception, responseBody),
    });

    /**
     * Send Response for Client
     */
    response.status(status).json(problemDetails satisfies ProblemDetails);
  }

  /**
   * Resolves appropriate HTTP status code based on the exception type.
   */
  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = this.mapPrismaErrorToHttpException(exception);
      return mapped.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Extracts the internal response object from known exception types.
   * For Prisma errors, it maps the error and extracts the wrapped HttpException response.
   */
  private getResponseBody(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = this.mapPrismaErrorToHttpException(exception);
      return mapped.getResponse();
    }

    this.logger.error('Unhandled exception occurred', exception);
    return 'An unexpected error occurred';
  }

  /**
   * Returns a user-friendly title based on HTTP status code.
   */
  private getTitleWithStatusCode(status: number): string {
    const titles: Record<number, string> = {
      [HttpStatus.CONTINUE]: 'Continue',
      [HttpStatus.SWITCHING_PROTOCOLS]: 'Switching Protocols',
      [HttpStatus.PROCESSING]: 'Processing',
      [HttpStatus.EARLYHINTS]: 'Early Hints',
      [HttpStatus.OK]: 'OK',
      [HttpStatus.CREATED]: 'Created',
      [HttpStatus.ACCEPTED]: 'Accepted',
      [HttpStatus.NON_AUTHORITATIVE_INFORMATION]: 'Non-Authoritative Information',
      [HttpStatus.NO_CONTENT]: 'No Content',
      [HttpStatus.RESET_CONTENT]: 'Reset Content',
      [HttpStatus.PARTIAL_CONTENT]: 'Partial Content',
      [HttpStatus.MULTI_STATUS]: 'Multi-Status',
      [HttpStatus.ALREADY_REPORTED]: 'Already Reported',
      [HttpStatus.CONTENT_DIFFERENT]: 'Content Different',
      [HttpStatus.AMBIGUOUS]: 'Multiple Choices',
      [HttpStatus.MOVED_PERMANENTLY]: 'Moved Permanently',
      [HttpStatus.FOUND]: 'Found',
      [HttpStatus.SEE_OTHER]: 'See Other',
      [HttpStatus.NOT_MODIFIED]: 'Not Modified',
      [HttpStatus.TEMPORARY_REDIRECT]: 'Temporary Redirect',
      [HttpStatus.PERMANENT_REDIRECT]: 'Permanent Redirect',
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.PAYMENT_REQUIRED]: 'Payment Required',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
      [HttpStatus.NOT_ACCEPTABLE]: 'Not Acceptable',
      [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
      [HttpStatus.REQUEST_TIMEOUT]: 'Request Timeout',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.GONE]: 'Gone',
      [HttpStatus.LENGTH_REQUIRED]: 'Length Required',
      [HttpStatus.PRECONDITION_FAILED]: 'Precondition Failed',
      [HttpStatus.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
      [HttpStatus.URI_TOO_LONG]: 'URI Too Long',
      [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
      [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]: 'Requested Range Not Satisfiable',
      [HttpStatus.EXPECTATION_FAILED]: 'Expectation Failed',
      [HttpStatus.I_AM_A_TEAPOT]: "I'm a Teapot",
      [HttpStatus.MISDIRECTED]: 'Misdirected Request',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.LOCKED]: 'Locked',
      [HttpStatus.FAILED_DEPENDENCY]: 'Failed Dependency',
      [HttpStatus.PRECONDITION_REQUIRED]: 'Precondition Required',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [HttpStatus.UNRECOVERABLE_ERROR]: 'Unrecoverable Error',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.NOT_IMPLEMENTED]: 'Not Implemented',
      [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
      [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
      [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
      [HttpStatus.INSUFFICIENT_STORAGE]: 'Insufficient Storage',
      [HttpStatus.LOOP_DETECTED]: 'Loop Detected',
    };

    return titles[status] || 'Error';
  }

  /**
   * Extracts a descriptive error message from the response body.
   */
  private extractDetail(responseBody: unknown): string {
    if (typeof responseBody === 'string') {
      return responseBody;
    }

    if (this.isObject(responseBody)) {
      const { detail, message } = responseBody as {
        detail?: string;
        message?: string | string[];
      };
      return Array.isArray(message) ? message.join(', ') : detail || (message as string) || 'An unexpected error occurred.';
    }

    return 'An unexpected error occurred.';
  }

  /**
   * Extracts a descriptive error status from the response body.
   */
  private extractStatus(responseBody: unknown, status: number): number {
    if (typeof responseBody === 'string') {
      return status;
    }

    if (this.isObject(responseBody)) {
      const { statusCode } = responseBody as {
        statusCode?: number;
      };
      return statusCode ?? status;
    }

    return status;
  }

  /**
   * Extracts validation, Prisma, or general errors in a structured format.
   */
  private extractErrors(exception: unknown, responseBody: unknown): Record<string, string[]> | undefined {
    // Handle class-validator & Zod validation responses
    if (this.isValidationErrorResponse(responseBody)) {
      return { validationErrors: responseBody.message };
    }

    // Handle standard HttpException
    if (exception instanceof HttpException) {
      return { generalErrors: [this.extractDetail(responseBody)] };
    }

    // Handle Prisma error — map detail from error.code
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const httpException = this.mapPrismaErrorToHttpException(exception);
      const body = httpException.getResponse();

      // Safely extract the message from the exception body
      const detail = typeof body === 'string' ? body : (body as any)?.detail || 'خطای ناشناخته از Prisma';

      return {
        prisma: [detail],
      };
    }

    // Fallback for unknown errors
    return { unknownError: ['An unexpected error occurred'] };
  }

  /**
   * Detects whether an object is a validation error response.
   */
  private isValidationErrorResponse(obj: unknown): obj is ValidationErrorResponse {
    return this.isObject(obj) && typeof obj.statusCode === 'number' && obj.statusCode === HttpStatus.BAD_REQUEST && Array.isArray(obj.message) && obj.message.every(msg => typeof msg === 'string') && typeof obj.error === 'string';
  }

  /**
   * Utility to ensure a value is a non-null object.
   */
  private isObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null;
  }

  /**
   * Maps known Prisma errors to appropriate HttpExceptions.
   * Used in getHttpStatus() and getResponseBody() to unify flow.
   */
  private mapPrismaErrorToHttpException(error: Prisma.PrismaClientKnownRequestError): HttpException {
    const { code, meta } = error;

    switch (code) {
      case 'P2000':
        return new HttpException({ detail: MESSAGES.fmtNamed('PRISMA_CODE_P2000', { target: (meta?.target as string) ?? '' }), error: 'ValueTooLong' }, HttpStatus.BAD_REQUEST);

      case 'P2001':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2001, error: 'MissingRelation' }, HttpStatus.NOT_FOUND);

      case 'P2002':
        return new HttpException({ detail: MESSAGES.fmtNamed('PRISMA_CODE_P2002', { target: (meta?.target as string) ?? '' }), error: 'UniqueConstraintViolation' }, HttpStatus.CONFLICT);

      case 'P2003':
        return new HttpException({ detail: MESSAGES.fmtNamed('PRISMA_CODE_P2003', { field_name: (meta?.field_name as string) ?? meta?.modelName ?? 'Unknown' }), error: 'ForeignKeyConstraintViolation' }, HttpStatus.BAD_REQUEST);

      case 'P2004':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2004, error: 'ConstraintViolation' }, HttpStatus.BAD_REQUEST);

      case 'P2005':
        return new HttpException({ detail: MESSAGES.fmtNamed('PRISMA_CODE_P2005', { field_name: (meta?.field_name as string) ?? '' }), error: 'InvalidFieldValue' }, HttpStatus.BAD_REQUEST);

      case 'P2006':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2006, error: 'InvalidValueType' }, HttpStatus.BAD_REQUEST);

      case 'P2007':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2007, error: 'DataValidationError' }, HttpStatus.BAD_REQUEST);

      case 'P2008':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2008, error: 'QueryParseError' }, HttpStatus.INTERNAL_SERVER_ERROR);

      case 'P2009':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2009, error: 'QueryValidationError' }, HttpStatus.BAD_REQUEST);

      case 'P2010':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2010, error: 'RawQueryError' }, HttpStatus.BAD_REQUEST);

      case 'P2011':
        return new HttpException({ detail: MESSAGES.fmtNamed('PRISMA_CODE_P2011', { target: (meta?.target as string) ?? '' }), error: 'NullConstraintViolation' }, HttpStatus.BAD_REQUEST);

      case 'P2012':
        return new HttpException({ detail: MESSAGES.fmtNamed('PRISMA_CODE_P2012', { path: (meta?.path as string) ?? '' }), error: 'MissingRequiredValue' }, HttpStatus.BAD_REQUEST);

      case 'P2013':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2013, error: 'MissingQueryArgument' }, HttpStatus.BAD_REQUEST);

      case 'P2014':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2014, error: 'RelationViolation' }, HttpStatus.BAD_REQUEST);

      case 'P2015':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2015, error: 'RecordNotFound' }, HttpStatus.NOT_FOUND);

      case 'P2025':
        return new HttpException({ detail: MESSAGES.PRISMA_CODE_P2025, error: 'MissingRecordForOperation' }, HttpStatus.NOT_FOUND);

      case 'P2022':
        return new HttpException({ detail: MESSAGES.fmtNamed('PRISMA_CODE_P2022', { column: (meta?.column ?? meta?.modelName ?? 'Unknown') as Var }), error: 'UniqueConstraintConflict' }, HttpStatus.CONFLICT);

      default:
        return new HttpException({ detail: MESSAGES.PRISMA_DEFAULT, error: `PrismaError_${code}` }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
