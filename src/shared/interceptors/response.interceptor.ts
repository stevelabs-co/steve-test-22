import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map(
        (data) => ({
          code: data.code || 200,
          message: data.message,
          data: data.data || null,
        }),
        //  as Response
        // Todo: Response 타입 다시 지정하기
      ),
    );
  }
}
