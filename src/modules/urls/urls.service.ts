import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UrlsRepository } from './urls.repository';
import { ShortUrl } from './entities/short-url.entity';
import { ClicksService } from '../clicks/clicks.service';
import { ShortCodeGeneratorFactory } from '../../common/strategies/short-code/short-code-generator.factory';
import { IShortCodeGenerator } from '../../common/strategies/short-code/short-code-generator.interface';

@Injectable()
export class UrlsService {
  private readonly logger = new Logger(UrlsService.name);
  private readonly codeGenerator: IShortCodeGenerator;
  private readonly maxRetries = 3;
  private readonly apiBaseUrl: string;

  constructor(
    private readonly urlsRepository: UrlsRepository,
    private readonly generatorFactory: ShortCodeGeneratorFactory,
    private readonly configService: ConfigService,
    private readonly clicksService: ClicksService,
  ) {
    this.codeGenerator = this.generatorFactory.create();
    this.apiBaseUrl = this.configService.get<string>('app.apiBaseUrl') || 'http://localhost:3000';
  }

  /**
   * Cria uma nova URL encurtada
   * Implementa retry logic para lidar com colisões de código
   */
  async create(originalUrl: string, userId?: string): Promise<ShortUrl> {
    // Valida URL
    this.validateUrl(originalUrl);

    let attempts = 0;
    let shortCode: string;

    // Retry logic para evitar colisões
    while (attempts < this.maxRetries) {
      try {
        // Gera código curto
        shortCode = this.codeGenerator.generate(originalUrl);

        // Verifica colisão
        const exists = await this.urlsRepository.codeExists(shortCode);
        if (exists) {
          attempts++;
          this.logger.warn(
            `Colisão detectada no código ${shortCode}, tentativa ${attempts}/${this.maxRetries}`,
          );

          if (attempts >= this.maxRetries) {
            throw new ConflictException(
              'Não foi possível gerar código único após várias tentativas',
            );
          }

          // Pequeno delay antes de tentar novamente
          await this.delay(100 * attempts);
          continue;
        }

        // Cria URL encurtada
        const shortUrl = new ShortUrl();
        shortUrl.originalUrl = originalUrl;
        shortUrl.shortCode = shortCode;
        shortUrl.userId = userId || null;

        const saved = await this.urlsRepository.create(shortUrl);
        this.logger.log(`URL criada com sucesso: ${saved.shortCode}`);
        return saved;
      } catch (error) {
        if (error instanceof ConflictException) {
          throw error;
        }

        attempts++;
        this.logger.error(`Erro ao criar URL (tentativa ${attempts}):`, error);

        if (attempts >= this.maxRetries) {
          throw new ConflictException('Erro ao criar URL. Tente novamente.');
        }

        await this.delay(100 * attempts);
      }
    }

    throw new ConflictException('Não foi possível criar URL após várias tentativas');
  }

  /**
   * Busca URL por código curto
   */
  async findByCode(code: string): Promise<ShortUrl> {
    const url = await this.urlsRepository.findByCode(code);
    if (!url) {
      throw new NotFoundException(`URL com código ${code} não encontrada`);
    }
    return url;
  }

  /**
   * Lista todas as URLs de um usuário com contagem de cliques
   */
  async findByUserId(userId: string): Promise<(ShortUrl & { clickCount: number })[]> {
    const urls = await this.urlsRepository.findByUserId(userId);

    // Adiciona contagem de cliques para cada URL
    const urlsWithClickCount = await Promise.all(
      urls.map(async url => {
        const clickCount = await this.clicksService.getClickCount(url.id);
        return {
          ...url,
          clickCount,
        };
      }),
    );

    return urlsWithClickCount;
  }

  /**
   * Atualiza a URL original de uma URL encurtada
   */
  async update(id: string, originalUrl: string, userId?: string): Promise<ShortUrl> {
    // Valida URL
    this.validateUrl(originalUrl);

    // Verifica se a URL existe e pertence ao usuário
    const url = await this.urlsRepository.findById(id);
    if (!url) {
      throw new NotFoundException(`URL com ID ${id} não encontrada`);
    }

    // Verifica permissão (se userId fornecido, deve ser o dono)
    if (userId && url.userId !== userId) {
      throw new ConflictException('Você não tem permissão para atualizar esta URL');
    }

    return this.urlsRepository.update(id, { originalUrl });
  }

  /**
   * Soft delete de uma URL
   */
  async delete(id: string, userId?: string): Promise<void> {
    const url = await this.urlsRepository.findById(id);
    if (!url) {
      throw new NotFoundException(`URL com ID ${id} não encontrada`);
    }

    // Verifica permissão
    if (userId && url.userId !== userId) {
      throw new ConflictException('Você não tem permissão para deletar esta URL');
    }

    await this.urlsRepository.softDelete(id);
    this.logger.log(`URL ${id} deletada com sucesso`);
  }

  /**
   * Gera a URL encurtada completa (com domínio)
   */
  getShortUrl(shortCode: string): string {
    return `${this.apiBaseUrl}/${shortCode}`;
  }

  /**
   * Valida formato de URL
   */
  private validateUrl(url: string): void {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      throw new BadRequestException('URL não pode ser vazia');
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new BadRequestException('URL deve usar protocolo HTTP ou HTTPS');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('URL inválida');
    }
  }

  /**
   * Delay helper para retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
