import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@urls-cut/shared';

/**
 * Controller para expor JWKS (JSON Web Key Set)
 * Usado pelo API Gateway para validar JWT
 */
@ApiTags('auth')
@Controller('.well-known')
@Public()
export class JwksController {
  constructor(private readonly configService: ConfigService) {}

  @Get('jwks.json')
  @ApiOperation({ summary: 'JWKS endpoint para validação de JWT' })
  @ApiResponse({
    status: 200,
    description: 'JWKS para validação de tokens JWT',
  })
  getJwks() {
    // Para JWT com HS256, o gateway precisa da chave secreta
    // Em produção, considere usar RS256 com chaves públicas/privadas
    const secret = this.configService.get<string>('jwt.secret');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Retorna um formato simplificado para o KrakenD
    // Em produção com RS256, retornaria as chaves públicas
    return {
      keys: [
        {
          kty: 'oct',
          use: 'sig',
          alg: 'HS256',
          // Nota: Em produção com RS256, retornaria a chave pública
          // Para HS256, o gateway precisa da mesma chave secreta
        },
      ],
    };
  }
}
