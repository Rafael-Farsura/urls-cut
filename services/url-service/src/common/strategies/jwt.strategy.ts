import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
      issuer: 'urls-cut',
      audience: 'urls-cut-api',
    });
  }

  async validate(payload: JwtPayload) {
    // Em uma arquitetura de microserviços, não precisamos buscar o usuário no banco
    // O token já foi validado pelo gateway (KrakenD) e contém as informações necessárias
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido: userId não encontrado');
    }
    return { id: payload.sub, email: payload.email };
  }
}

