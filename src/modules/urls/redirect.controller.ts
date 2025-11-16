import { Controller, Get, Param, Res, Req, NotFoundException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { UrlsService } from './urls.service';
import { ClicksService } from '../clicks/clicks.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controller para redirecionamento de URLs encurtadas
 * Rota na raiz: GET /:shortCode
 */
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

