import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@urls-cut/shared';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está funcionando',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-11-14T10:00:00.000Z',
        checks: {
          database: {
            status: 'up',
            responseTime: 5,
          },
          memory: {
            status: 'up',
            usage: {
              rss: 100,
              heapTotal: 50,
              heapUsed: 30,
              external: 10,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação com problemas',
  })
  async check() {
    return this.healthService.check();
  }
}
