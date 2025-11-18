import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly configService;
    private readonly logger;
    private readonly isEnabled;
    constructor(configService: ConfigService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
