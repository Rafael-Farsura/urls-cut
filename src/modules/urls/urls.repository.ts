import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ShortUrl } from './entities/short-url.entity';

/**
 * Repository Pattern para acesso a dados de URLs encurtadas
 * Abstrai lógica de acesso ao banco de dados
 */
@Injectable()
export class UrlsRepository {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly repository: Repository<ShortUrl>,
  ) {}

  /**
   * Cria uma nova URL encurtada
   */
  async create(shortUrl: ShortUrl): Promise<ShortUrl> {
    const entity = this.repository.create(shortUrl);
    return this.repository.save(entity);
  }

  /**
   * Busca URL por código curto (apenas URLs não deletadas)
   */
  async findByCode(code: string): Promise<ShortUrl | null> {
    return this.repository.findOne({
      where: {
        shortCode: code,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Busca todas as URLs de um usuário (apenas não deletadas)
   */
  async findByUserId(userId: string): Promise<ShortUrl[]> {
    return this.repository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Busca URL por ID (apenas não deletada)
   */
  async findById(id: string): Promise<ShortUrl | null> {
    return this.repository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Atualiza uma URL existente
   */
  async update(id: string, data: Partial<ShortUrl>): Promise<ShortUrl> {
    const url = await this.findById(id);
    if (!url) {
      throw new NotFoundException(`URL com ID ${id} não encontrada`);
    }

    Object.assign(url, data);
    return this.repository.save(url);
  }

  /**
   * Soft delete de uma URL
   */
  async softDelete(id: string): Promise<void> {
    const url = await this.findById(id);
    if (!url) {
      throw new NotFoundException(`URL com ID ${id} não encontrada`);
    }

    url.deletedAt = new Date();
    await this.repository.save(url);
  }

  /**
   * Verifica se um código já existe (para evitar colisões)
   */
  async codeExists(code: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        shortCode: code,
        deletedAt: IsNull(),
      },
    });
    return count > 0;
  }
}

