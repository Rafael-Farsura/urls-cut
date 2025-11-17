import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  retryableErrors?: (error: any) => boolean;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly defaultMaxRetries: number;
  private readonly defaultInitialDelay: number;
  private readonly defaultMaxDelay: number;
  private readonly defaultFactor: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultMaxRetries = this.configService.get<number>('app.retryMaxAttempts') || 3;
    this.defaultInitialDelay = this.configService.get<number>('app.retryInitialDelay') || 100;
    this.defaultMaxDelay = this.configService.get<number>('app.retryMaxDelay') || 5000;
    this.defaultFactor = this.configService.get<number>('app.retryFactor') || 2;
  }

  /**
   * Executa uma operação com retry e exponential backoff
   */
  async execute<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const {
      maxRetries = this.defaultMaxRetries,
      initialDelay = this.defaultInitialDelay,
      maxDelay = this.defaultMaxDelay,
      factor = this.defaultFactor,
      retryableErrors = () => true,
    } = options;

    let lastError: any;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        attempts++;

        // Verifica se o erro é retryable
        if (!retryableErrors(error)) {
          this.logger.debug(`Erro não é retryable, abortando retry`);
          throw error;
        }

        // Se excedeu o número máximo de tentativas, lança o erro
        if (attempts >= maxRetries) {
          this.logger.warn(
            `Operação falhou após ${attempts} tentativas. Último erro: ${error.message}`,
          );
          throw error;
        }

        // Calcula delay com exponential backoff
        const delay = Math.min(initialDelay * Math.pow(factor, attempts - 1), maxDelay);

        this.logger.debug(
          `Tentativa ${attempts}/${maxRetries} falhou. Tentando novamente em ${delay}ms`,
        );

        // Aguarda antes de tentar novamente
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Helper para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
