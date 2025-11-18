import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@urls-cut/shared';

/**
 * Guard simplificado que verifica autenticação via header X-User-Id
 * propagado pelo API Gateway (KrakenD).
 * 
 * O gateway já valida o JWT e propaga o user ID no header X-User-Id.
 * Este guard apenas verifica a presença do header para rotas protegidas.
 */
@Injectable()
export class GatewayAuthGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rotas públicas sempre permitidas
    if (isPublic) {
      // Tenta popular request.user se houver header X-User-Id
      // Node.js/Express normaliza headers para lowercase
      const userId = request.headers['x-user-id'] || request.headers['X-User-Id'];
      if (userId) {
        request.user = {
          id: typeof userId === 'string' ? userId : userId[0],
          // O email não é necessário para o url-service
          // O gateway apenas propaga o user ID
        };
      }
      return true;
    }

    // Para rotas protegidas, verifica se o header X-User-Id existe
    // O gateway já validou o JWT e propagou o user ID
    // Node.js/Express normaliza headers para lowercase
    const userId = request.headers['x-user-id'] || request.headers['X-User-Id'];
    if (!userId) {
      throw new UnauthorizedException(
        'Token inválido ou ausente. O gateway deve validar o JWT e propagar X-User-Id.',
      );
    }

    // Popula request.user com o ID do usuário
    // Garante que userId é uma string (pode ser array em alguns casos)
    request.user = {
      id: typeof userId === 'string' ? userId : userId[0],
    };

    return true;
  }
}

