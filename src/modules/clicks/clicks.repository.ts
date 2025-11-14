import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Click } from './entities/click.entity';

/**
 * Repository Pattern para acesso a dados de cliques
 * Abstrai lógica de acesso ao banco de dados
 */
@Injectable()
export class ClicksRepository {
  constructor(
    @InjectRepository(Click)
    private readonly repository: Repository<Click>,
  ) {}

  /**
   * Registra um novo clique
   */
  async create(click: Click): Promise<Click> {
    const entity = this.repository.create(click);
    return this.repository.save(entity);
  }

  /**
   * Conta o número de cliques de uma URL
   */
  async countByShortUrlId(shortUrlId: string): Promise<number> {
    return this.repository.count({
      where: { shortUrlId },
    });
  }

  /**
   * Busca todos os cliques de uma URL (para estatísticas)
   */
  async findByShortUrlId(shortUrlId: string): Promise<Click[]> {
    return this.repository.find({
      where: { shortUrlId },
      order: {
        clickedAt: 'DESC',
      },
    });
  }
}

