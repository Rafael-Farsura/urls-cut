import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class SentryExceptionFilter implements ExceptionFilter {
    private readonly configService;
    private readonly logger;
    private readonly isEnabled;
    private readonly sentryDsn;
    constructor(configService: ConfigService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
