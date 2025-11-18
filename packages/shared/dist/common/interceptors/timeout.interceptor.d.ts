import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
export declare class TimeoutInterceptor implements NestInterceptor {
    private readonly configService;
    private readonly timeout;
    constructor(configService: ConfigService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
