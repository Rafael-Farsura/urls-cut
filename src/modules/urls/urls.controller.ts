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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface UserPayload {
  id: string;
  email: string;
}

@ApiTags('urls')
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
  @ApiOperation({ summary: 'Criar URL encurtada' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({
    status: 201,
    description: 'URL criada com sucesso',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        originalUrl: 'https://example.com',
        shortUrl: 'http://localhost:3000/abc123',
        shortCode: 'abc123',
        userId: 'user-id-123',
        createdAt: '2025-11-14T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'URL inválida' })
  async create(@Body() createUrlDto: CreateUrlDto, @CurrentUser() user?: UserPayload) {
    const shortUrl = await this.urlsService.create(createUrlDto.originalUrl, user?.id);

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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar URLs do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de URLs do usuário',
    schema: {
      example: {
        urls: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            originalUrl: 'https://example.com',
            shortUrl: 'http://localhost:3000/abc123',
            shortCode: 'abc123',
            clickCount: 5,
            createdAt: '2025-11-14T10:00:00.000Z',
            updatedAt: '2025-11-14T10:00:00.000Z',
          },
        ],
        total: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar URL encurtada' })
  @ApiParam({ name: 'id', description: 'ID da URL' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({
    status: 200,
    description: 'URL atualizada com sucesso',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        originalUrl: 'https://new-example.com',
        shortUrl: 'http://localhost:3000/abc123',
        shortCode: 'abc123',
        updatedAt: '2025-11-14T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'URL não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @CurrentUser() user: UserPayload,
  ) {
    const shortUrl = await this.urlsService.update(id, updateUrlDto.originalUrl, user.id);

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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar URL encurtada' })
  @ApiParam({ name: 'id', description: 'ID da URL' })
  @ApiResponse({ status: 204, description: 'URL deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'URL não encontrada' })
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    await this.urlsService.delete(id, user.id);
  }
}
