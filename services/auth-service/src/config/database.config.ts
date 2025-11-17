import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = +value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (parsed as any) !== parsed ? defaultValue : parsed;
};

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseNumber(process.env.DB_PORT, 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'url_shortener',
    ssl: process.env.DB_SSL === 'true',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [], // Desabilitar migrações TypeScript - usar schema.sql diretamente
    synchronize: true, // Usar synchronize temporariamente para criar tabelas (apenas primeira vez)
    logging: process.env.NODE_ENV === 'development',
    migrationsRun: false, // Desabilitar execução automática de migrações
  }),
);
