import { Controller, Get, Param, Res, Req, NotFoundException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { UrlsService } from './urls.service';
import { ClicksService } from '../clicks/clicks.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controller para redirecionamento de URLs encurtadas
 * Rota na raiz: GET /:shortCode
 */
@ApiTags('urls')
@Controller()
export class RedirectController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly clicksService: ClicksService,
  ) {}

  /**
   * GET /:shortCode
   * Redireciona para a URL original e contabiliza o clique
   * Público (não requer autenticação)
   */
  @Public()
  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirecionar para URL original' })
  @ApiParam({ name: 'shortCode', description: 'Código curto da URL' })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para URL original',
    headers: {
      Location: {
        description: 'URL original',
        schema: { type: 'string', example: 'https://example.com' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'URL encurtada não encontrada' })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      // Busca a URL pelo código
      const shortUrl = await this.urlsService.findByCode(shortCode);

      // Registra o clique (assíncrono, não bloqueia o redirecionamento)
      this.clicksService
        .recordClick(
          shortUrl.id,
          request.ip || request.headers['x-forwarded-for']?.toString() || undefined,
          request.headers['user-agent'] || undefined,
        )
        .catch(error => {
          // Log do erro mas não falha o redirecionamento
          console.error('Erro ao registrar clique:', error);
        });

      // Redireciona para a URL original
      return response.redirect(HttpStatus.FOUND, shortUrl.originalUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`URL encurtada com código ${shortCode} não encontrada`);
      }
      throw error;
    }
  }
}
