/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, map, throwError } from 'rxjs';

export type Response<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: exception.message,
      data: null,
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const status = response.statusCode || HttpStatus.OK;

    // Extract override message if present
    const overrideMessage = res?.message;

    // Get decorator message as fallback
    const decoratorMessage =
      this.reflector.get<string>('responseMessage', context.getHandler()) ||
      'Thành công';

    // Determine final message: use override if exists, otherwise use decorator
    const finalMessage = overrideMessage || decoratorMessage;

    // Build response data, excluding the message field if it was used as override
    const responseData = overrideMessage
      ? Object.keys(res).reduce((acc, key) => {
          if (key !== 'message') {
            acc[key] = res[key];
          }
          return acc;
        }, {})
      : res;

    return {
      success: true,
      statusCode: status,
      message: finalMessage,
      data: responseData,
    };
  }
}
