import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface UserPayload {
  id: string;
  email: string;
}

@Controller('api/urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  /**
   * POST /api/urls
   * Cria uma nova URL encurtada
   * Público (pode ser usado sem autenticação) ou autenticado
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUrlDto: CreateUrlDto,
    @CurrentUser() user?: UserPayload,
  ) {
    const shortUrl = await this.urlsService.create(
      createUrlDto.originalUrl,
      user?.id,
    );

    return {
      id: shortUrl.id,
      originalUrl: shortUrl.originalUrl,
      shortUrl: this.urlsService.getShortUrl(shortUrl.shortCode),
      shortCode: shortUrl.shortCode,
      userId: shortUrl.userId,
      createdAt: shortUrl.createdAt,
    };
  }

  /**
   * GET /api/urls
   * Lista todas as URLs do usuário autenticado com contagem de cliques
   * Requer autenticação
   */
  @Get()
  async findAll(@CurrentUser() user: UserPayload) {
    const urls = await this.urlsService.findByUserId(user.id);

    return {
      urls: urls.map(url => ({
        id: url.id,
        originalUrl: url.originalUrl,
        shortUrl: this.urlsService.getShortUrl(url.shortCode),
        shortCode: url.shortCode,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
      })),
      total: urls.length,
    };
  }

  /**
   * PUT /api/urls/:id
   * Atualiza a URL original de uma URL encurtada
   * Requer autenticação e permissão (ser dono da URL)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @CurrentUser() user: UserPayload,
  ) {
    const shortUrl = await this.urlsService.update(
      id,
      updateUrlDto.originalUrl,
      user.id,
    );

    return {
      id: shortUrl.id,
      originalUrl: shortUrl.originalUrl,
      shortUrl: this.urlsService.getShortUrl(shortUrl.shortCode),
      shortCode: shortUrl.shortCode,
      updatedAt: shortUrl.updatedAt,
    };
  }

  /**
   * DELETE /api/urls/:id
   * Deleta uma URL encurtada (soft delete)
   * Requer autenticação e permissão (ser dono da URL)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    await this.urlsService.delete(id, user.id);
  }
}

