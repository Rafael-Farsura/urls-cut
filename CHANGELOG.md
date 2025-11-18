# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased] - 2025-01-17

### Added
- Limpeza e organização de documentação
  - Removidos arquivos não relacionados ao Teste Backend End.md
  - Mantidos apenas documentos essenciais e relacionados ao teste
  - Consolidada documentação do monorepo e Docker no README.md

### Fixed
- Correção de build do pacote shared
  - Adicionadas dependências faltantes no `packages/shared/package.json`:
    - `@nestjs/core`, `@nestjs/passport`, `@nestjs/typeorm`, `express`
    - `@types/express`, `@types/node` como devDependencies
  - Excluídos arquivos de teste (`__tests__/**`, `*.spec.ts`) do build do shared via `tsconfig.json`
  - Adicionado suporte a tipos Node.js (`types: ["node"]`) no `tsconfig.json`
  - Build do shared agora funciona corretamente no Docker
- Correção de runtime do módulo `@urls-cut/shared` no Docker
  - Ajustados Dockerfiles para copiar o pacote shared completo (dist, package.json, node_modules) no stage de produção
  - Ajustada estrutura de diretórios no stage de produção para manter paths relativos (`file:../../packages/shared`)
  - Agora o npm consegue resolver o módulo shared corretamente em runtime
  - Mantida estrutura do monorepo (`/app/services/auth-service` e `/app/packages/shared`)
- Correção de injeção de dependências dos interceptors, filters, guards e generators do shared
  - Ajustado `AppModule` de ambos os serviços para usar `useFactory` em vez de `useClass` para interceptors, filters e guards
  - Ajustado `UrlsModule` para usar `useFactory` para `HashBasedGenerator`, `RandomGenerator` e `ShortCodeGeneratorFactory`
  - Agora o `ConfigService` e `Reflector` são injetados explicitamente via `inject: [ConfigService]` e `inject: [Reflector]`
  - Isso garante que as dependências sejam resolvidas corretamente pelo NestJS dependency injection
  - Aplicado para:
    - Guards: `JwtAuthGuard` (auth-service), `GatewayAuthGuard` (url-service)
    - Interceptors: `LoggingInterceptor`, `MetricsInterceptor`, `TimeoutInterceptor`
    - Filters: `HttpExceptionFilter`
    - Generators: `HashBasedGenerator`, `RandomGenerator`, `ShortCodeGeneratorFactory` (url-service)
- Fase 2: Migração de código compartilhado para `packages/shared/`
  - Adicionada dependência `@urls-cut/shared` em ambos os serviços
  - Criado arquivo `.env.example` com todas as variáveis de ambiente documentadas
  - Estrutura de diretórios padronizada entre serviços
  - Exportado `IS_PUBLIC_KEY` do shared para uso no GatewayAuthGuard

- Fase 3: Atualizações de Documentação
  - Atualizado `docs/PROJECT_STRUCTURE.md` para refletir uso de `packages/shared/`
  - Atualizado `MONOREPO_MIGRATION.md` com informações sobre código compartilhado
  - Atualizado `docs/ARCHITECTURE.md` com detalhes do pacote shared
  - Atualizado `README.md` e `README_MONOREPO.md` com estrutura do shared
  - Atualizado `docs/ADVANCED_FEATURES.md` com detalhes do pacote compartilhado

- Fase 4: Verificação Final de Documentação
  - Verificada consistência entre todas as documentações principais e técnicas
  - Atualizado `AUDIT_REPORT.md` seção 4.2 com status resolvido (Fase 3)
  - Garantida consistência entre todos os documentos
  - Todas as documentações agora refletem a arquitetura atual do monorepo

### Changed
- Fase 2: Refatoração de imports para usar `packages/shared/`
  - Atualizados todos os imports no `auth-service` para usar `@urls-cut/shared`
  - Atualizados todos os imports no `url-service` para usar `@urls-cut/shared`
  - Removido código duplicado (decorators, filters, interceptors, strategies)
  - Atualizado `packages/shared/src/index.ts` para exportar strategies e IS_PUBLIC_KEY
  - Atualizado `packages/shared/package.json` com dependências necessárias

- Fase 3: Melhorias de Documentação
  - Substituída referência à estrutura antiga `/src/common` por `/packages/shared` nas documentações
  - Documentado uso de `@urls-cut/shared` nos serviços
  - Adicionadas seções explicando benefícios da centralização do código

### Removed
- Fase 2: Remoção de código duplicado
  - Removidos arquivos duplicados de `services/auth-service/src/common/` (decorators, filters, interceptors, guards)
  - Removidos arquivos duplicados de `services/url-service/src/common/` (decorators, filters, interceptors, strategies)
  - Todo código compartilhado agora está centralizado em `packages/shared/`

- Limpeza de arquivos Docker legados
  - Removidos arquivos Docker da aplicação monolítica (`docker-compose.yml`, `docker-compose.dev.yml`, `Dockerfile`, `Dockerfile.dev`)
  - Mantido apenas `docker-compose.yml` (obrigatório pelo teste) e Dockerfiles dos serviços (`services/auth-service/Dockerfile`, `services/url-service/Dockerfile`)
  - Atualizado README.md removendo referências aos arquivos Docker legados

- Limpeza de documentação não relacionada ao Teste Backend End.md
  - Removidos arquivos de auditoria e correções não requeridos (`AUDIT_REPORT.md`, `CORRECTIONS_PLAN.md`)
  - Removidos arquivos de fases não requeridos (`PHASE1_COMPLETED.md`, `PHASE2_COMPLETED.md`, `PHASE3_COMPLETED.md`, `PHASE4_COMPLETED.md`, `RESUMO_FINAL_TODAS_FASES.md`)
  - Removidos arquivos de verificação não requeridos (`FEATURES_VERIFICATION.md`, `VERIFICATION_REPORT.md`)
  - Removidos e consolidados arquivos de monorepo/Docker no README (`MONOREPO_MIGRATION.md`, `MONOREPO_STATUS.md`, `README_MONOREPO.md`, `README_DOCKER.md`, `TEST_QUICK_START.md`)
  - Removido `commits.md` (roadmap não requerido)
  - Removidos da pasta `docs/`: `ADVANCED_FEATURES.md`, `TESTING_GATEWAY_CICD.md`, `TYPESCRIPT_CONFIG.md`, `TESTING_GUIDE.md` (redundantes ou não essenciais)
  - Mantidos apenas documentos essenciais: README.md, CHANGELOG.md, TAGS.md e documentação técnica em `docs/`

### Changed

- **Auditoria e Análise do Projeto**
  - ✅ Auditoria completa do projeto realizada
  - ✅ Identificação de problemas de código duplicado/legado
  - ✅ Identificação de problemas de segurança (secrets hardcoded)
  - ✅ Identificação de problemas de arquitetura (autenticação duplicada)
  - ✅ Criação de relatórios: `AUDIT_REPORT.md` e `CORRECTIONS_PLAN.md`
  - ✅ Documentações atualizadas com avisos sobre código legado
  - ✅ Avisos de segurança adicionados ao README.md

- **Fase 1: Correções Críticas Implementadas** ✅
  - ✅ Removida autenticação JWT duplicada do `url-service`
    - Criado `GatewayAuthGuard` simplificado que verifica apenas header `X-User-Id`
    - Removido `AuthModule`, `JwtStrategy` e `JwtAuthGuard` do `url-service`
    - Gateway (KrakenD) já valida JWT e propaga user ID
  - ✅ Removidos secrets hardcoded
    - Validação obrigatória de `JWT_SECRET` em produção
    - Fallback apenas em desenvolvimento (com aviso)
    - Script do gateway substitui secret em runtime
  - ✅ Adicionada validação de variáveis de ambiente obrigatórias
    - Validação no startup de ambos os serviços
    - Falha rápida com mensagens claras se variáveis críticas estiverem ausentes

### Security

- ✅ **Corrigido**: Secrets JWT hardcoded removidos
  - Validação obrigatória de `JWT_SECRET` em produção
  - Fallback apenas em desenvolvimento com aviso
  - Script do gateway valida e substitui secret em runtime
- ✅ **Corrigido**: Validação de variáveis de ambiente obrigatórias implementada
  - Validação no startup de `auth-service` e `url-service`
  - Validação no script do gateway
  - Mensagens de erro claras com instruções

### Documentation

- ✅ README.md atualizado com avisos sobre código legado em `src/`
- ✅ FEATURES_VERIFICATION.md atualizado com problemas identificados
- ✅ Criado `AUDIT_REPORT.md` com relatório completo de auditoria
- ✅ Criado `CORRECTIONS_PLAN.md` com plano de correções

### Fixed

- ✅ Removida autenticação JWT duplicada do `url-service`
- ✅ Removidos secrets hardcoded (validação obrigatória em produção)
- ✅ Adicionada validação de variáveis de ambiente obrigatórias

### Known Issues

- ⚠️ Diretório `src/` ainda existe como código legado (não utilizado no monorepo)
- ⚠️ Código duplicado entre `services/auth-service` e `services/url-service` (Fase 2)
- ⚠️ Falta arquivo `.env.example` na raiz (criar manualmente)

> 📝 **Consulte**: `AUDIT_REPORT.md` e `CORRECTIONS_PLAN.md` para detalhes completos e plano de correções.

## [0.8.0] - 2025-11-17

### Added

- ✅ **Monorepo completamente implementado e funcional**
  - Auth Service (porta 3001) - Autenticação e gerenciamento de usuários
  - URL Service (porta 3002) - Encurtamento e gerenciamento de URLs
  - Pacote shared - Código compartilhado entre serviços
  - Código migrado de `src/` para serviços correspondentes
  - Dockerfiles para cada serviço
  - Configurações TypeScript e NestJS CLI por serviço
- ✅ **API Gateway KrakenD completamente configurado e funcional**
  - Roteamento para auth-service e url-service
  - Validação de JWT com secret key (HS256)
  - Rate limiting por endpoint configurado
  - Health checks agregados (combina respostas de ambos os serviços)
  - Porta 8080 (ponto único de entrada)
  - Cache configurado (300s)
  - Timeout configurado (3000ms)
- ✅ **Docker Compose para monorepo** (docker-compose.yml)
  - PostgreSQL compartilhado
  - Auth Service containerizado
  - URL Service containerizado
  - API Gateway (KrakenD) containerizado
  - Health checks configurados
  - Dependências entre serviços
- ✅ **Documentação completa atualizada**
  - README.md atualizado com informações do monorepo
  - README_MONOREPO.md - Documentação do monorepo
  - MONOREPO_MIGRATION.md - Guia de migração
  - MONOREPO_STATUS.md - Status da implementação
  - API_SPECIFICATION.md atualizado com porta 8080
  - ARCHITECTURE.md atualizado com arquitetura de monorepo
  - PROJECT_STRUCTURE.md atualizado com estrutura de monorepo
  - EXECUTION_STRUCTURE.md atualizado com fluxo do gateway
  - DIAGRAMS.md atualizado com diagramas do monorepo
  - ADVANCED_FEATURES.md marcado como implementado
  - REQUIREMENTS_CHECKLIST.md atualizado
  - FEATURES_VERIFICATION.md atualizado
  - Coleção Postman atualizada (base_url = http://localhost:8080)
  - postman/README.md atualizado

### Changed

- Estrutura do projeto migrada para monorepo
- Configuração KrakenD com validação JWT por secret key
- Portas ajustadas: 3001 (auth), 3002 (url), 8080 (gateway)
- DatabaseModule configurado separadamente para cada serviço
- AppModule e main.ts criados para cada serviço
- Base URL da API atualizada para porta 8080 (API Gateway)
- Todas as documentações atualizadas para refletir monorepo

### Fixed

- Correção de moduleResolution no TypeScript (node16 → node) para compatibilidade com NestJS
- Build errors do monorepo resolvidos
- Imports relativos corrigidos nos serviços
- Correção de sintaxe JSON no krakend.json (vírgulas extras removidas)
- Correção de erro "invalid status code" no KrakenD para requisições POST
- Configuração do KrakenD para passar corretamente o body em requisições POST/PUT
- Adicionado Content-Type aos input_headers para garantir passagem do body

## [0.7.1] - 2025-11-17

### Fixed

- Corrigido uso de ForbiddenException em vez de ConflictException para erros de permissão
- Adicionada validação de usuário autenticado no UrlsController
- Corrigidos testes unitários para usar ForbiddenException
- Melhorados testes E2E com ValidationPipe global
- Corrigida limpeza de banco de dados nos testes E2E
- Adicionados delays e sequencialidade nos testes de rate limiting

### Changed

- Melhorado tratamento de erros de autorização (403 em vez de 409)
- Configurado ESLint para ignorar arquivos de teste E2E
- Removidos console.log desnecessários dos testes

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

- Melhorada estrutura de testes (organizados em **tests**/)
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
