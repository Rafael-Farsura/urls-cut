# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Added
- Documentação completa do projeto
- Arquitetura NestJS definida
- Schema SQL do banco de dados
- Especificação da API REST
- Diagramas de arquitetura e sequência
- Documentação de design patterns
- Guia de observabilidade
- Guia de validação de entrada
- Documentação de funcionalidades avançadas (API Gateway, Monorepo, CI/CD, Resiliência)
- Configuração Docker e Docker Compose (desenvolvimento e produção)
- Endpoint de health check (/health)
- Entidades TypeORM: User, ShortUrl, Click
- Migração inicial do banco de dados com triggers e view
- Módulo de Usuários com Repository e Service
- Soft delete implementado em todas as entidades

## [0.4.0] - 2025-11-14

### Added
- Contabilização de cliques em URLs encurtadas
- ClicksModule com ClicksRepository e ClicksService
- Métodos: recordClick, getClickCount, getClicksByShortUrlId
- Integração de contagem de cliques na listagem de URLs
- Agregação de estatísticas de acesso

### Changed
- Melhorada estrutura de resposta de listagem de URLs (inclui clickCount)
- Otimizado índice de cliques por data

## [0.3.0] - 2025-11-14

### Added
- Operações CRUD completas para URLs
- Strategy Pattern para geração de código curto
  - HashBasedGenerator (SHA-256 truncado)
  - RandomGenerator (bytes aleatórios)
  - ShortCodeGeneratorFactory
- UrlsModule com UrlsRepository e UrlsService
- Endpoints de URLs:
  - POST /api/urls (público ou autenticado)
  - GET /api/urls (autenticado - lista do usuário)
  - PUT /api/urls/:id (autenticado)
  - DELETE /api/urls/:id (autenticado)
- DTOs de URL (CreateUrlDto, UpdateUrlDto) com validação class-validator
- Retry logic para lidar com colisões de código (max 3 tentativas)
- Validação de ownership em operações de modificação
- Soft delete implementado para URLs
- Validação de URL (protocolo HTTP/HTTPS obrigatório)

### Changed
- Melhorada estrutura de resposta de listagem de URLs
- Adicionada contagem de cliques na listagem

## [0.2.0] - 2025-11-14

### Added
- Sistema de autenticação com JWT
- Endpoints de registro e login (POST /api/auth/register, POST /api/auth/login)
- Guard de autenticação (JwtAuthGuard) configurado como global
- Decorator @CurrentUser() para extrair usuário do request
- Decorator @Public() para rotas públicas (bypass auth)
- Validação de senha com bcrypt (hash e verificação)
- AuthModule com JwtStrategy (Passport JWT)
- AuthService com métodos: hashPassword, verifyPassword, generateToken, validateUser, register, login
- DTOs de autenticação (RegisterDto, LoginDto) com validações class-validator
- AuthController com endpoints de registro e login
- ValidationPipe global configurado
- Testes unitários para AuthService e AuthController (14 testes)

## [0.1.0] - 2024-12-13

### Added
- Estrutura base do projeto NestJS com TypeScript
- Configuração de variáveis de ambiente (@nestjs/config)
- Configuração TypeORM com PostgreSQL
- Endpoint de health check (/health)
- Configuração Docker e Docker Compose
- Entidades TypeORM: User, ShortUrl, Click
- Migração inicial do schema do banco de dados
- Triggers para atualização automática de updated_at
- View short_urls_with_stats para estatísticas
- Módulo de Usuários (UsersModule)
- Repository Pattern para acesso a dados (UsersRepository)
- Service Layer para lógica de negócio (UsersService)
- Soft delete implementado
- Índices otimizados para queries frequentes

---

[Keep a Changelog]: https://keepachangelog.com/pt-BR/1.0.0/
[Semantic Versioning]: https://semver.org/lang/pt-BR/

