import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private failures = 0;
  private lastFailureTime: Date | null = null;
  private state: CircuitState = 'CLOSED';
  private readonly threshold: number;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.threshold = this.configService.get<number>('app.circuitBreakerThreshold') || 5;
    this.timeout = this.configService.get<number>('app.circuitBreakerTimeout') || 60000; // 1 minuto
  }

  /**
   * Executa uma operação protegida pelo Circuit Breaker
   */
  async execute<T>(operation: () => Promise<T>, serviceName?: string): Promise<T> {
    const service = serviceName || 'service';

    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - (this.lastFailureTime?.getTime() || 0);
      if (timeSinceLastFailure > this.timeout) {
        this.state = 'HALF_OPEN';
        this.logger.log(`Circuit breaker [${service}]: HALF_OPEN - Tentando recuperação`);
      } else {
        this.logger.warn(`Circuit breaker [${service}]: OPEN - Serviço indisponível`);
        throw new ServiceUnavailableException(
          `Serviço ${service} temporariamente indisponível. Tente novamente mais tarde.`,
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess(service);
      return result;
    } catch (error) {
      this.onFailure(service, error);
      throw error;
    }
  }

  /**
   * Reseta o Circuit Breaker manualmente
   */
  reset(serviceName?: string): void {
    const service = serviceName || 'service';
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
    this.logger.log(`Circuit breaker [${service}]: RESET - Estado resetado manualmente`);
  }

  /**
   * Retorna o estado atual do Circuit Breaker
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Retorna o número de falhas consecutivas
   */
  getFailures(): number {
    return this.failures;
  }

  private onSuccess(service: string): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.logger.log(`Circuit breaker [${service}]: CLOSED - Serviço recuperado`);
    }
  }

  private onFailure(service: string, error: any): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.logger.warn(
        `Circuit breaker [${service}]: OPEN - ${this.failures} falhas consecutivas. Último erro: ${error.message}`,
      );
    } else {
      this.logger.debug(`Circuit breaker [${service}]: Falha ${this.failures}/${this.threshold}`);
    }
  }
}
