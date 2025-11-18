/**
 * Shared Package - URL Shortener
 *
 * Este pacote contém código compartilhado entre os serviços
 */

// Common
export * from './common/decorators/current-user.decorator';
export * from './common/decorators/public.decorator';
export { IS_PUBLIC_KEY } from './common/decorators/public.decorator';
export * from './common/guards/jwt-auth.guard';
export * from './common/filters/http-exception.filter';
export * from './common/interceptors/logging.interceptor';
export * from './common/interceptors/metrics.interceptor';
export * from './common/interceptors/timeout.interceptor';
export * from './common/services/circuit-breaker.service';
export * from './common/services/retry.service';

// Strategies
export * from './common/strategies/short-code/short-code-generator.interface';
export * from './common/strategies/short-code/short-code-generator.factory';
export * from './common/strategies/short-code/hash-based.generator';
export * from './common/strategies/short-code/random.generator';

// Config
export * from './config/app.config';
export * from './config/database.config';
export * from './config/jwt.config';
export * from './config/observability.config';

// Types
export interface UserPayload {
  id: string;
  email: string;
}
