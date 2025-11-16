import { Injectable, Logger } from '@nestjs/common';
import { ClicksRepository } from './clicks.repository';
import { Click } from './entities/click.entity';

/**
 * Service para contabilização de cliques
 * Implementa lógica de negócio para registro e consulta de cliques
 */
@Injectable()
export class ClicksService {
  private readonly logger = new Logger(ClicksService.name);

  constructor(private readonly clicksRepository: ClicksRepository) {}

  /**
   * Registra um novo clique em uma URL
   */
  async recordClick(shortUrlId: string, ipAddress?: string, userAgent?: string): Promise<Click> {
    const click = new Click();
    click.shortUrlId = shortUrlId;
    click.ipAddress = ipAddress || null;
    click.userAgent = userAgent || null;

    const saved = await this.clicksRepository.create(click);
    this.logger.log(`Clique registrado para URL ${shortUrlId}`);
    return saved;
  }

  /**
   * Obtém a contagem de cliques de uma URL
   */
  async getClickCount(shortUrlId: string): Promise<number> {
    return this.clicksRepository.countByShortUrlId(shortUrlId);
  }

  /**
   * Obtém todos os cliques de uma URL (para estatísticas)
   */
  async getClicksByShortUrlId(shortUrlId: string): Promise<Click[]> {
    return this.clicksRepository.findByShortUrlId(shortUrlId);
  }
}
