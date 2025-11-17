import { registerAs } from '@nestjs/config';

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = +value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (parsed as any) !== parsed ? defaultValue : parsed;
};

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT || process.env.AUTH_SERVICE_PORT, 3001),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  // Rate Limiting
  throttleTtl: parseNumber(process.env.THROTTLE_TTL, 60),
  throttleLimit: parseNumber(process.env.THROTTLE_LIMIT, 100),
}));
