import { registerAs } from '@nestjs/config';

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = +value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (parsed as any) !== parsed ? defaultValue : parsed;
};

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT || process.env.URL_SERVICE_PORT, 3002),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
  shortCodeLength: parseNumber(process.env.SHORT_CODE_LENGTH, 6),
  shortCodeStrategy: process.env.SHORT_CODE_STRATEGY || 'hash',
  // Resiliência
  circuitBreakerThreshold: parseNumber(process.env.CIRCUIT_BREAKER_THRESHOLD, 5),
  circuitBreakerTimeout: parseNumber(process.env.CIRCUIT_BREAKER_TIMEOUT, 60000),
  retryMaxAttempts: parseNumber(process.env.RETRY_MAX_ATTEMPTS, 3),
  retryInitialDelay: parseNumber(process.env.RETRY_INITIAL_DELAY, 100),
  retryMaxDelay: parseNumber(process.env.RETRY_MAX_DELAY, 5000),
  retryFactor: parseNumber(process.env.RETRY_FACTOR, 2),
  requestTimeout: parseNumber(process.env.REQUEST_TIMEOUT, 30000),
  // Rate Limiting
  throttleTtl: parseNumber(process.env.THROTTLE_TTL, 60),
  throttleLimit: parseNumber(process.env.THROTTLE_LIMIT, 100),
}));
