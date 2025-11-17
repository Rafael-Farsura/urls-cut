import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { IShortCodeGenerator } from './short-code-generator.interface';
import { ConfigService } from '@nestjs/config';

/**
 * Gera código curto aleatório
 * Vantagens: Não determinístico, maior entropia
 */
@Injectable()
export class RandomGenerator implements IShortCodeGenerator {
  private readonly codeLength: number;
  private readonly base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  constructor(private readonly configService: ConfigService) {
    this.codeLength = this.configService.get<number>('app.shortCodeLength') || 6;
  }

  generate(_originalUrl: string): string {
    // Gera bytes aleatórios
    const bytes = randomBytes(this.codeLength);
    let code = '';

    // Converte bytes para base62
    for (let i = 0; i < this.codeLength; i++) {
      code += this.base62Chars[bytes[i] % 62];
    }

    return code;
  }
}
