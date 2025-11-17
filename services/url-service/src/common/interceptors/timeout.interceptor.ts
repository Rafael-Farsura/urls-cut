import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.timeout = this.configService.get<number>('app.requestTimeout') || 30000; // 30 segundos padrão
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeout),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `A requisição excedeu o tempo limite de ${this.timeout}ms`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
