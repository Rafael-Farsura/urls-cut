import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Counter, Histogram, register } from 'prom-client';

/**
 * Interceptor de métricas Prometheus
 * Coleta métricas HTTP para observabilidade
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled =
      this.configService.get<string>('ENABLE_METRICS', 'false') === 'true' ||
      this.configService.get<string>('PROMETHEUS_ENABLED', 'false') === 'true';

    if (this.isEnabled) {
      // Métrica: Duração das requisições HTTP
      this.httpRequestDuration = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duração das requisições HTTP em segundos',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.5, 1, 2, 5, 10],
        registers: [register],
      });

      // Métrica: Total de requisições HTTP
      this.httpRequestTotal = new Counter({
        name: 'http_requests_total',
        help: 'Total de requisições HTTP',
        labelNames: ['method', 'route', 'status_code'],
        registers: [register],
      });

      // Registrar métricas globalmente
      register.setDefaultLabels({ app: 'url-shortener' });
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.isEnabled) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, route } = request;
    const routePath = route?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode.toString();

          this.httpRequestDuration
            .labels(method, routePath, statusCode)
            .observe(duration);

          this.httpRequestTotal.labels(method, routePath, statusCode).inc();
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error?.status?.toString() || '500';

          this.httpRequestDuration
            .labels(method, routePath, statusCode)
            .observe(duration);

          this.httpRequestTotal.labels(method, routePath, statusCode).inc();
        },
      }),
    );
  }
}

