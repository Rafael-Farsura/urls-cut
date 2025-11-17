import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Para rotas públicas, sempre tenta autenticar (para popular request.user se houver token)
    // mas não falha se não houver token ou se o token for inválido
    if (isPublic) {
      const result = super.canActivate(context);
      if (result instanceof Observable) {
        return result.pipe(
          map(() => true), // Se autenticado com sucesso, permite acesso
          catchError(() => of(true)), // Se falhar (sem token ou token inválido), também permite acesso
        );
      }
      if (result instanceof Promise) {
        return result.then(() => true).catch(() => true);
      }
      return result;
    }

    // Para rotas protegidas, falha se não houver token ou se o token for inválido
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Para rotas públicas, retorna undefined se não houver usuário (não falha)
    // Isso permite que a rota seja acessada sem autenticação, mas ainda popula request.user se houver token
    if (isPublic) {
      if (err || !user) {
        return undefined; // Não falha, apenas retorna undefined
      }
      return user; // Retorna o usuário se autenticado
    }

    // Para rotas protegidas, falha se houver erro ou não houver usuário
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }

    return user;
  }
}
