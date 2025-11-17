import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ShortUrl } from '../modules/urls/entities/short-url.entity';
import { Click } from '../modules/clicks/entities/click.entity';

config();

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'url_shortener',
  ssl: process.env.DB_SSL === 'true',
  entities: [ShortUrl, Click],
  migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

export default new DataSource(databaseConfig);
