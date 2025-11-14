import { registerAs } from '@nestjs/config';

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = +value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (parsed as any) !== parsed ? defaultValue : parsed;
};

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 3000),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  shortCodeLength: parseNumber(process.env.SHORT_CODE_LENGTH, 6),
  shortCodeStrategy: process.env.SHORT_CODE_STRATEGY || 'hash',
}));
