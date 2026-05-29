/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { HttpStatus } from '../enum/http-status.enum';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({
        status: HttpStatus.SUCCESS,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: data.message || 'Success',
        data: data.data || data,
      })),
    );
  }
}
