import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IShortCodeGenerator } from './short-code-generator.interface';
import { HashBasedGenerator } from './hash-based.generator';
import { RandomGenerator } from './random.generator';

/**
 * Factory para criar instâncias de geradores de código curto
 * Implementa Factory Pattern para seleção de estratégia
 */
@Injectable()
export class ShortCodeGeneratorFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly hashBasedGenerator: HashBasedGenerator,
    private readonly randomGenerator: RandomGenerator,
  ) {}

  /**
   * Cria instância do gerador baseado na configuração
   * @returns Instância de IShortCodeGenerator
   */
  create(): IShortCodeGenerator {
    const strategy = this.configService.get<string>('app.shortCodeStrategy') || 'hash';

    switch (strategy) {
      case 'hash':
        return this.hashBasedGenerator;
      case 'random':
        return this.randomGenerator;
      default:
        // Default para hash se estratégia inválida
        return this.hashBasedGenerator;
    }
  }
}

