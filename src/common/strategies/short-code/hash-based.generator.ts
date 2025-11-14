import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { IShortCodeGenerator } from './short-code-generator.interface';
import { ConfigService } from '@nestjs/config';

/**
 * Gera código curto baseado em hash SHA-256 da URL original
 * Vantagens: Determinístico (mesma URL = mesmo código), rápido
 */
@Injectable()
export class HashBasedGenerator implements IShortCodeGenerator {
  private readonly codeLength: number;

  constructor(private readonly configService: ConfigService) {
    this.codeLength = this.configService.get<number>('app.shortCodeLength') || 6;
  }

  generate(originalUrl: string): string {
    // Gera hash SHA-256 da URL
    const hash = createHash('sha256').update(originalUrl).digest('hex');

    // Converte para base62 (0-9, a-z, A-Z)
    const base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Pega os primeiros caracteres do hash e converte para base62
    let code = '';
    let hashIndex = 0;

    while (code.length < this.codeLength && hashIndex < hash.length) {
      // Pega 2 caracteres hex (0-255) e converte para base62
      const hexValue = parseInt(hash.substr(hashIndex, 2), 16);
      code += base62Chars[hexValue % 62];
      hashIndex += 2;
    }

    // Se ainda não tem 6 caracteres, completa com hash
    if (code.length < this.codeLength) {
      const remaining = this.codeLength - code.length;
      for (let i = 0; i < remaining; i++) {
        const hexValue = parseInt(hash.substr((hashIndex + i * 2) % hash.length, 2), 16);
        code += base62Chars[hexValue % 62];
      }
    }

    return code.substring(0, this.codeLength);
  }
}

