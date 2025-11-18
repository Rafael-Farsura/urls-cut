import { ConfigService } from '@nestjs/config';
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export declare class CircuitBreakerService {
    private readonly configService;
    private readonly logger;
    private failures;
    private lastFailureTime;
    private state;
    private readonly threshold;
    private readonly timeout;
    constructor(configService: ConfigService);
    execute<T>(operation: () => Promise<T>, serviceName?: string): Promise<T>;
    reset(serviceName?: string): void;
    getState(): CircuitState;
    getFailures(): number;
    private onSuccess;
    private onFailure;
}
