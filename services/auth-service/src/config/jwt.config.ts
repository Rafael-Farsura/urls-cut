import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const jwtSecret = process.env.JWT_SECRET;

  // Em produção, JWT_SECRET é obrigatório
  if (nodeEnv === 'production' && !jwtSecret) {
    throw new Error(
      'JWT_SECRET is required in production. Please set the JWT_SECRET environment variable.',
    );
  }

  // Em desenvolvimento, usa fallback seguro apenas se não estiver definido
  const secret = jwtSecret || (nodeEnv === 'production' 
    ? (() => { throw new Error('JWT_SECRET must be set in production'); })() 
    : 'dev-secret-key-change-in-production-DO-NOT-USE-IN-PRODUCTION');

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
});
