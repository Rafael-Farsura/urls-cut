import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '@urls-cut/shared';

/**
 * Guard que verifica autenticação via:
 * 1. Header X-User-Id propagado pelo API Gateway (KrakenD) - para rotas protegidas
 * 2. Validação direta do JWT no header Authorization - para rotas públicas quando token presente
 * 
 * Para rotas públicas: Se houver token JWT válido, valida e popula request.user.
 * Para rotas protegidas: Requer header X-User-Id do gateway ou valida JWT diretamente.
 */
@Injectable()
export class GatewayAuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Tenta obter userId do header X-User-Id (propagado pelo gateway)
    let userId = request.headers['x-user-id'] || request.headers['X-User-Id'];
    
    // Se não houver X-User-Id, tenta validar JWT diretamente do header Authorization
    if (!userId) {
      const authHeader = request.headers['authorization'] || request.headers['Authorization'];
      if (authHeader && typeof authHeader === 'string') {
        const token = authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : authHeader;
        
        if (token) {
          try {
            const jwtSecret = this.configService.get<string>('jwt.secret');
            if (jwtSecret) {
              // Valida o token com as mesmas opções que o auth-service usa
              const payload = this.jwtService.verify(token, { 
                secret: jwtSecret,
                issuer: 'urls-cut',
                audience: 'urls-cut-api',
              });
              userId = payload.sub; // sub contém o user ID
            }
          } catch (error) {
            // Token inválido - ignora silenciosamente para rotas públicas
            // Para rotas protegidas, será tratado abaixo
            if (!isPublic) {
              throw new UnauthorizedException('Token inválido ou expirado');
            }
          }
        }
      }
    }

    // Rotas públicas sempre permitidas
    if (isPublic) {
      // Se houver userId (de X-User-Id ou JWT), popula request.user
      if (userId) {
        request.user = {
          id: typeof userId === 'string' ? userId : userId[0],
        };
      }
      return true;
    }

    // Para rotas protegidas, userId é obrigatório
    if (!userId) {
      throw new UnauthorizedException(
        'Token inválido ou ausente. Forneça um token JWT válido no header Authorization.',
      );
    }

    // Popula request.user com o ID do usuário
    request.user = {
      id: typeof userId === 'string' ? userId : userId[0],
    };

    return true;
  }
}

