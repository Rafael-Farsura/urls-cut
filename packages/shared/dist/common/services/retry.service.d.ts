import { ConfigService } from '@nestjs/config';
export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    retryableErrors?: (error: any) => boolean;
}
export declare class RetryService {
    private readonly configService;
    private readonly logger;
    private readonly defaultMaxRetries;
    private readonly defaultInitialDelay;
    private readonly defaultMaxDelay;
    private readonly defaultFactor;
    constructor(configService: ConfigService);
    execute<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
    private delay;
}
