import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  checks: {
    database?: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory?: {
      status: 'up' | 'down';
      usage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection()
    private readonly dataSource: DataSource,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};
    const startTime = Date.now();

    // Verifica banco de dados
    try {
      const dbStartTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const dbResponseTime = Date.now() - dbStartTime;

      checks.database = {
        status: 'up',
        responseTime: dbResponseTime,
      };
    } catch (error: any) {
      this.logger.error('Database health check failed', error);
      checks.database = {
        status: 'down',
        error: error.message || 'Database connection failed',
      };
    }

    // Verifica memória
    try {
      const memoryUsage = process.memoryUsage();
      checks.memory = {
        status: 'up',
        usage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
      };
    } catch (error: any) {
      this.logger.error('Memory health check failed', error);
      checks.memory = {
        status: 'down',
        usage: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
        },
      };
    }

    const overallStatus =
      checks.database?.status === 'up' && checks.memory?.status === 'up' ? 'ok' : 'error';

    const totalTime = Date.now() - startTime;
    this.logger.debug(`Health check completed in ${totalTime}ms - Status: ${overallStatus}`);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
