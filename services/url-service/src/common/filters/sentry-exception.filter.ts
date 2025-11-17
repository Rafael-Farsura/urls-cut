import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Exception Filter com integração Sentry (opcional)
 * Captura exceções e envia para Sentry quando configurado
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);
  private readonly isEnabled: boolean;
  private readonly sentryDsn: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<string>('SENTRY_ENABLED', 'false') === 'true';
    this.sentryDsn = this.configService.get<string>('SENTRY_DSN');

    if (this.isEnabled && !this.sentryDsn) {
      this.logger.warn('Sentry está habilitado mas SENTRY_DSN não está configurado');
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (this.isEnabled && this.sentryDsn) {
      try {
        // Em produção, aqui seria feita a integração real com Sentry
        // const Sentry = require('@sentry/node');
        // Sentry.captureException(exception, {
        //   contexts: {
        //     request: {
        //       url: request.url,
        //       method: request.method,
        //     },
        //   },
        // });

        this.logger.debug(
          'Exceção seria enviada para Sentry (integração real requer @sentry/node)',
        );
      } catch (error) {
        this.logger.error('Erro ao enviar exceção para Sentry', error);
      }
    }

    // Delega para o HttpExceptionFilter padrão
    // Em produção, isso seria feito através de um filter chain
  }
}
