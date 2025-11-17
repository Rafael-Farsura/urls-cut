# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Added
- Circuit Breaker Service para tolerância a falhas
- Retry Service com exponential backoff
- Timeout Interceptor para requisições
- Health Service melhorado (verifica banco de dados e memória)
- Rate Limiting com ThrottlerModule
- GitHub Actions workflows (CI/CD e Release)
- Configurações de resiliência no app.config.ts

## [0.7.0] - 2025-11-17

### Added
- Circuit Breaker Service (CircuitBreakerService)
  - Estados: CLOSED, OPEN, HALF_OPEN
  - Threshold e timeout configuráveis
  - Reset manual disponível
- Retry Service (RetryService)
  - Exponential backoff configurável
  - Retryable errors customizáveis
  - Máximo de tentativas configurável
- Timeout Interceptor
  - Timeout configurável por requisição
  - RequestTimeoutException quando excedido
- Health Service melhorado
  - Verificação de banco de dados com tempo de resposta
  - Verificação de uso de memória
  - Status detalhado de cada componente
- Rate Limiting
  - ThrottlerModule configurado globalmente
  - Limites configuráveis via variáveis de ambiente
  - Proteção contra abuso de requisições
- GitHub Actions
  - Workflow de CI/CD completo (lint, test, build)
  - Workflow de release automático
  - Integração com codecov para cobertura

### Changed
- Health endpoint agora retorna informações detalhadas de cada componente
- Configurações de resiliência adicionadas ao app.config.ts
- Melhorado tratamento de erros no HttpExceptionFilter

## [0.6.0] - 2025-11-16

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
- Endpoint de redirecionamento GET /:shortCode
- Testes unitários completos (66 testes passando)
- Testes E2E para todas as rotas
- Coleção Postman completa
- HttpExceptionFilter global para tratamento de erros
- LoggingInterceptor para observabilidade
- Métricas Prometheus (MetricsInterceptor e MetricsController)
- Documentação Swagger/OpenAPI completa
- Configuração de observabilidade (logs, métricas, tracing)

## [0.7.0] - 2025-11-17

### Added
- Circuit Breaker Service para tolerância a falhas
  - Estados: CLOSED, OPEN, HALF_OPEN
  - Threshold e timeout configuráveis
  - Reset manual disponível
- Retry Service com exponential backoff
  - Retry configurável com exponential backoff
  - Retryable errors customizáveis
  - Máximo de tentativas configurável
- Health Service melhorado
  - Verificação de banco de dados com tempo de resposta
  - Verificação de uso de memória (RSS, heap)
  - Status detalhado de cada componente
- Timeout Interceptor
  - Timeout configurável para requisições (padrão: 30s)
  - RequestTimeoutException quando excedido
- Rate Limiting
  - ThrottlerModule configurado globalmente
  - Limites configuráveis via variáveis de ambiente
  - Proteção contra abuso de requisições
- GitHub Actions CI/CD
  - Workflow completo (lint, test, build)
  - Integração com codecov
  - Release automático por tags
- Testes unitários completos
  - CircuitBreakerService (8 testes)
  - RetryService (7 testes)
  - HealthService (5 testes)
  - TimeoutInterceptor (5 testes)
  - JwtAuthGuard (6 testes)
  - Total: 99 testes unitários passando
- Testes E2E organizados
  - auth.e2e-spec.ts: Autenticação completa
  - urls.e2e-spec.ts: URLs e redirecionamento
  - resilience.e2e-spec.ts: Resiliência e rate limiting
  - 4 suites E2E cobrindo todos os endpoints
- Scripts de teste organizados
  - test:unit, test:e2e, test:all, test:ci
  - Modos watch para desenvolvimento
- Documentação completa de testes
  - TESTING.md: Guia completo com exemplos
  - TESTING_GUIDE.md: Guia rápido de referência
  - Cobertura: ~85% (Services: 92-100%, Controllers: 100%)

### Changed
- JwtAuthGuard melhorado para rotas públicas
  - Popula request.user quando há token válido
  - Permite acesso público sem token
  - Resolve problema de userId null em rotas públicas
- HttpExceptionFilter melhorado
  - Remove uso de 'any' substituindo por tipos específicos
  - Melhor tratamento de mensagens de erro (suporta arrays)
- Health Service refatorado
  - Módulo dedicado criado
  - Verificações mais detalhadas
  - Retorna 503 quando componentes estão down

### Fixed
- Correção de build: ThrottlerModule configurado corretamente
- Correção de JwtAuthGuard para rotas públicas com token

## [0.6.0] - 2025-11-16

### Added
- HttpExceptionFilter global para tratamento consistente de erros
  - Formatação padronizada de respostas de erro
  - Logging de erros (warn para 4xx, error para 5xx)
  - Stack trace em desenvolvimento, oculto em produção
- LoggingInterceptor para observabilidade
  - Log de todas as requisições HTTP (método, URL, IP, User-Agent)
  - Log de respostas (status code, tempo de resposta)
  - Configurável via ENABLE_LOGGING
- Métricas Prometheus
  - MetricsInterceptor para coleta de métricas HTTP
  - MetricsController com endpoint GET /metrics
  - Métricas: http_request_duration_seconds, http_requests_total
  - Configurável via ENABLE_METRICS ou PROMETHEUS_ENABLED
- Documentação Swagger/OpenAPI
  - Configuração completa do SwaggerModule
  - Decorators @ApiTags, @ApiOperation, @ApiResponse em todos os controllers
  - Decorators @ApiProperty em todos os DTOs
  - Autenticação JWT no Swagger
  - Exemplos e descrições detalhadas
  - Endpoint: GET /api-docs
- Configuração de observabilidade (observability.config.ts)
  - Suporte para logs, métricas e tracing
  - Configuração para Sentry, Elastic APM, Datadog (abstrações)
- Testes unitários para novos componentes
  - HttpExceptionFilter (4 testes)
  - LoggingInterceptor (3 testes)
  - Total: 66 testes passando

### Changed
- Melhorado tratamento de erros com HttpExceptionFilter global
- Adicionado logging estruturado de requisições
- Melhorada documentação da API com Swagger

## [0.5.0] - 2025-11-14

### Added
- Endpoint de redirecionamento GET /:shortCode
  - Redireciona para URL original (302 Found)
  - Contabiliza cliques automaticamente
  - Não requer autenticação
  - Registra IP e User-Agent do cliente
- RedirectController para gerenciar redirecionamentos
- Testes unitários completos:
  - UrlsService (criação, busca, atualização, exclusão, validações)
  - UrlsController (todos os endpoints CRUD)
  - RedirectController (redirecionamento e registro de cliques)
  - ClicksService (registro e contagem de cliques)
  - HashBasedGenerator (geração determinística de códigos)
  - RandomGenerator (geração aleatória de códigos)
- Testes E2E completos:
  - Health check
  - Autenticação (registro e login)
  - URLs (criação pública e autenticada, listagem, atualização, exclusão)
  - Redirecionamento e contabilização de cliques
  - Validações de entrada
- Cobertura de testes: ~75% (59 testes passando)

### Changed
- Melhorada estrutura de testes (organizados em __tests__/)
- Adicionada validação de IP e User-Agent no registro de cliques

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

