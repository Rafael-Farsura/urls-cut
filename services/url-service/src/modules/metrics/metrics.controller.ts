import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/public.decorator';
import { register } from 'prom-client';

/**
 * Controller para expor métricas Prometheus
 */
@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled =
      this.configService.get<string>('ENABLE_METRICS', 'false') === 'true' ||
      this.configService.get<string>('PROMETHEUS_ENABLED', 'false') === 'true';
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obter métricas Prometheus' })
  @ApiResponse({
    status: 200,
    description: 'Métricas em formato Prometheus',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example:
            '# HELP http_requests_total Total de requisições HTTP\n# TYPE http_requests_total counter',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas não habilitadas',
    schema: {
      example: {
        message: 'Métricas não estão habilitadas',
        enabled: false,
      },
    },
  })
  async getMetrics() {
    if (!this.isEnabled) {
      return {
        message: 'Métricas não estão habilitadas',
        enabled: false,
      };
    }

    return register.metrics();
  }
}
