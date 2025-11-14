# Roadmap de Implementação - URL Shortener

Este documento descreve a ordem de implementação do projeto, organizada por commits seguindo boas práticas de Git.

## Estratégia de Commits

- **Commits pequenos e focados**: Um commit por feature/funcionalidade
- **Mensagens descritivas**: Título claro + descrição detalhada
- **Convenção**: `tipo(escopo): descrição`

### Tipos de Commits

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Configuração/build
- `config`: Configuração de ferramentas

---

## Fase 1: Setup Inicial do Projeto

### Commit 1.1: Inicializar projeto NestJS

**Título:** `chore: inicializar projeto NestJS com TypeScript`

**Descrição:**
```
Inicializa projeto NestJS com configurações base
- Cria estrutura de diretórios
- Configura TypeScript
- Configura ESLint e Prettier
- Adiciona scripts básicos no package.json
```

**Arquivos modificados:**
- `package.json` (criado)
- `tsconfig.json` (criado)
- `nest-cli.json` (criado)
- `.eslintrc.js` (criado)
- `.prettierrc` (criado)
- `.gitignore` (criado)
- `src/main.ts` (criado)

---

### Commit 1.2: Configurar variáveis de ambiente

**Título:** `config: adicionar configuração de variáveis de ambiente`

**Descrição:**
```
Configura @nestjs/config para gerenciar variáveis de ambiente
- Cria módulo de configuração
- Define schema de validação de variáveis
- Adiciona .env.example
```

**Arquivos modificados:**
- `src/config/app.config.ts` (criado)
- `src/config/database.config.ts` (criado)
- `src/config/jwt.config.ts` (criado)
- `.env.example` (criado)
- `src/app.module.ts` (modificado)

---

### Commit 1.3: Configurar TypeORM e PostgreSQL

**Título:** `config: configurar TypeORM com PostgreSQL`

**Descrição:**
```
Configura TypeORM para conexão com PostgreSQL
- Configura módulo TypeORM
- Define configuração de conexão
- Adiciona suporte a migrações
```

**Arquivos modificados:**
- `src/database/database.module.ts` (criado)
- `src/database/database.config.ts` (criado)
- `src/app.module.ts` (modificado)
- `package.json` (modificado - dependências)

---

## Fase 2: Entidades e Schema do Banco

### Commit 2.1: Criar entidade User

**Título:** `feat(database): criar entidade User`

**Descrição:**
```
Cria entidade User com TypeORM
- Define campos: id, email, passwordHash, timestamps
- Implementa soft delete (deletedAt)
- Adiciona índices e constraints
```

**Arquivos modificados:**
- `src/modules/users/entities/user.entity.ts` (criado)

---

### Commit 2.2: Criar entidade ShortUrl

**Título:** `feat(database): criar entidade ShortUrl`

**Descrição:**
```
Cria entidade ShortUrl com TypeORM
- Define campos: id, originalUrl, shortCode, userId, timestamps
- Implementa soft delete (deletedAt)
- Adiciona relacionamento com User
- Define constraints de validação
```

**Arquivos modificados:**
- `src/modules/urls/entities/short-url.entity.ts` (criado)
- `src/modules/users/entities/user.entity.ts` (modificado - relacionamento)

---

### Commit 2.3: Criar entidade Click

**Título:** `feat(database): criar entidade Click`

**Descrição:**
```
Cria entidade Click para contabilização de acessos
- Define campos: id, shortUrlId, ipAddress, userAgent, clickedAt
- Adiciona relacionamento com ShortUrl
```

**Arquivos modificados:**
- `src/modules/clicks/entities/click.entity.ts` (criado)
- `src/modules/urls/entities/short-url.entity.ts` (modificado - relacionamento)

---

### Commit 2.4: Criar migração inicial do banco

**Título:** `feat(database): criar migração inicial do schema`

**Descrição:**
```
Cria migração TypeORM para schema inicial
- Tabela users
- Tabela short_urls
- Tabela clicks
- Índices e constraints
- Triggers para updated_at
- View short_urls_with_stats
```

**Arquivos modificados:**
- `database/migrations/1234567890-CreateInitialSchema.ts` (criado)

---

## Fase 3: Módulo de Usuários

### Commit 3.1: Criar módulo Users

**Título:** `feat(users): criar módulo Users com repository`

**Descrição:**
```
Cria módulo Users com TypeORM repository
- UsersModule
- UsersRepository
- Métodos básicos de acesso a dados
```

**Arquivos modificados:**
- `src/modules/users/users.module.ts` (criado)
- `src/modules/users/users.repository.ts` (criado)
- `src/app.module.ts` (modificado)

---

### Commit 3.2: Implementar UsersService

**Título:** `feat(users): implementar UsersService`

**Descrição:**
```
Implementa lógica de negócio para usuários
- findByEmail
- findById
- create
- Validações de negócio
```

**Arquivos modificados:**
- `src/modules/users/users.service.ts` (criado)
- `src/modules/users/users.module.ts` (modificado)

---

## Fase 4: Módulo de Autenticação

### Commit 4.1: Criar módulo Auth

**Título:** `feat(auth): criar módulo Auth`

**Descrição:**
```
Cria módulo de autenticação
- AuthModule
- Configuração JWT
- Estratégia Passport JWT
```

**Arquivos modificados:**
- `src/modules/auth/auth.module.ts` (criado)
- `src/modules/auth/strategies/jwt.strategy.ts` (criado)
- `src/app.module.ts` (modificado)

---

### Commit 4.2: Implementar AuthService

**Título:** `feat(auth): implementar AuthService`

**Descrição:**
```
Implementa lógica de autenticação
- hashPassword (bcrypt)
- verifyPassword
- generateToken
- validateUser
```

**Arquivos modificados:**
- `src/modules/auth/auth.service.ts` (criado)
- `src/modules/auth/auth.module.ts` (modificado)

---

### Commit 4.3: Criar DTOs de autenticação

**Título:** `feat(auth): criar DTOs de autenticação`

**Descrição:**
```
Cria DTOs com validação para autenticação
- RegisterDto (email, password)
- LoginDto (email, password)
- Validações com class-validator
```

**Arquivos modificados:**
- `src/modules/auth/dto/register.dto.ts` (criado)
- `src/modules/auth/dto/login.dto.ts` (criado)

---

### Commit 4.4: Implementar AuthController

**Título:** `feat(auth): implementar AuthController`

**Descrição:**
```
Implementa endpoints de autenticação
- POST /api/auth/register
- POST /api/auth/login
- Retorna Bearer Token no login
```

**Arquivos modificados:**
- `src/modules/auth/auth.controller.ts` (criado)
- `src/modules/auth/auth.module.ts` (modificado)

---

## Fase 5: Guards e Decorators

### Commit 5.1: Criar JwtAuthGuard

**Título:** `feat(common): criar JwtAuthGuard`

**Descrição:**
```
Implementa guard de autenticação JWT
- Valida token Bearer
- Extrai usuário do token
- Implementa CanActivate
```

**Arquivos modificados:**
- `src/common/guards/jwt-auth.guard.ts` (criado)

---

### Commit 5.2: Criar decorators customizados

**Título:** `feat(common): criar decorators customizados`

**Descrição:**
```
Cria decorators para facilitar uso
- @CurrentUser() - extrai usuário do request
- @Public() - marca rotas públicas (bypass auth)
```

**Arquivos modificados:**
- `src/common/decorators/current-user.decorator.ts` (criado)
- `src/common/decorators/public.decorator.ts` (criado)

---

### Commit 5.3: Configurar guard global

**Título:** `config(auth): configurar JwtAuthGuard como global`

**Descrição:**
```
Configura JwtAuthGuard como guard global
- Aplica autenticação em todas as rotas por padrão
- Rotas marcadas com @Public() são exceções
```

**Arquivos modificados:**
- `src/app.module.ts` (modificado)
- `src/main.ts` (modificado)

---

## Fase 6: Módulo de URLs

### Commit 6.1: Criar estratégia de geração de código curto

**Título:** `feat(common): criar estratégia de geração de código curto`

**Descrição:**
```
Implementa Strategy Pattern para geração de código
- Interface IShortCodeGenerator
- HashBasedGenerator
- RandomGenerator
- Factory para seleção de estratégia
```

**Arquivos modificados:**
- `src/common/strategies/short-code/short-code-generator.interface.ts` (criado)
- `src/common/strategies/short-code/hash-based.generator.ts` (criado)
- `src/common/strategies/short-code/random.generator.ts` (criado)

---

### Commit 6.2: Criar módulo Urls

**Título:** `feat(urls): criar módulo Urls`

**Descrição:**
```
Cria módulo de URLs com TypeORM
- UrlsModule
- UrlsRepository
- Registra estratégia de geração de código
```

**Arquivos modificados:**
- `src/modules/urls/urls.module.ts` (criado)
- `src/modules/urls/urls.repository.ts` (criado)
- `src/app.module.ts` (modificado)

---

### Commit 6.3: Implementar UrlsService

**Título:** `feat(urls): implementar UrlsService`

**Descrição:**
```
Implementa lógica de negócio para URLs
- create (com verificação de colisão)
- findByCode
- findByUserId
- update
- softDelete
- Retry logic para colisões
```

**Arquivos modificados:**
- `src/modules/urls/urls.service.ts` (criado)
- `src/modules/urls/urls.module.ts` (modificado)

---

### Commit 6.4: Criar DTOs de URL

**Título:** `feat(urls): criar DTOs de URL`

**Descrição:**
```
Cria DTOs com validação para URLs
- CreateUrlDto (originalUrl)
- UpdateUrlDto (originalUrl)
- Validações de URL com class-validator
```

**Arquivos modificados:**
- `src/modules/urls/dto/create-url.dto.ts` (criado)
- `src/modules/urls/dto/update-url.dto.ts` (criado)

---

### Commit 6.5: Implementar UrlsController

**Título:** `feat(urls): implementar UrlsController`

**Descrição:**
```
Implementa endpoints de URLs
- POST /api/urls (público ou autenticado)
- GET /api/urls (autenticado - lista do usuário)
- PUT /api/urls/:id (autenticado)
- DELETE /api/urls/:id (autenticado)
- Retorna URL encurtado com domínio completo
```

**Arquivos modificados:**
- `src/modules/urls/urls.controller.ts` (criado)
- `src/modules/urls/urls.module.ts` (modificado)

---

## Fase 7: Módulo de Cliques

### Commit 7.1: Criar módulo Clicks

**Título:** `feat(clicks): criar módulo Clicks`

**Descrição:**
```
Cria módulo de cliques
- ClicksModule
- ClicksRepository
```

**Arquivos modificados:**
- `src/modules/clicks/clicks.module.ts` (criado)
- `src/modules/clicks/clicks.repository.ts` (criado)
- `src/app.module.ts` (modificado)

---

### Commit 7.2: Implementar ClicksService

**Título:** `feat(clicks): implementar ClicksService`

**Descrição:**
```
Implementa lógica de contabilização
- recordClick
- getClickCount
- Agregação de estatísticas
```

**Arquivos modificados:**
- `src/modules/clicks/clicks.service.ts` (criado)
- `src/modules/clicks/clicks.module.ts` (modificado)

---

### Commit 7.3: Integrar contabilização na listagem

**Título:** `feat(urls): integrar contabilização de cliques na listagem`

**Descrição:**
```
Adiciona contagem de cliques na listagem de URLs
- GET /api/urls retorna clickCount para cada URL
- Usa ClicksService para agregar dados
```

**Arquivos modificados:**
- `src/modules/urls/urls.service.ts` (modificado)
- `src/modules/urls/urls.module.ts` (modificado - importa ClicksModule)

---

## Fase 8: Redirecionamento

### Commit 8.1: Implementar endpoint de redirecionamento

**Título:** `feat(urls): implementar endpoint de redirecionamento`

**Descrição:**
```
Implementa endpoint GET /:shortCode
- Busca URL por código
- Verifica se não está deletada
- Registra clique (assíncrono)
- Retorna 302 Redirect para URL original
```

**Arquivos modificados:**
- `src/modules/urls/urls.controller.ts` (modificado - adiciona método redirect)
- `src/modules/urls/urls.service.ts` (modificado)
- `src/app.module.ts` (modificado - rota global)

---

## Fase 9: Validação e Tratamento de Erros

### Commit 9.1: Configurar ValidationPipe global

**Título:** `config(validation): configurar ValidationPipe global`

**Descrição:**
```
Configura ValidationPipe como pipe global
- Validação automática de DTOs
- Transformação de tipos
- Whitelist de propriedades
```

**Arquivos modificados:**
- `src/main.ts` (modificado)

---

### Commit 9.2: Criar Exception Filter

**Título:** `feat(common): criar HttpExceptionFilter`

**Descrição:**
```
Implementa exception filter global
- Trata exceções HTTP
- Formata respostas de erro
- Logging de erros
```

**Arquivos modificados:**
- `src/common/filters/http-exception.filter.ts` (criado)
- `src/main.ts` (modificado)

---

### Commit 9.3: Adicionar validações de negócio

**Título:** `feat(validation): adicionar validações de negócio`

**Descrição:**
```
Adiciona validações adicionais nos services
- Verificação de ownership
- Verificação de soft delete
- Validação de unicidade
```

**Arquivos modificados:**
- `src/modules/urls/urls.service.ts` (modificado)
- `src/modules/auth/auth.service.ts` (modificado)

---

## Fase 10: Observabilidade

### Commit 10.1: Criar LoggingInterceptor

**Título:** `feat(observability): criar LoggingInterceptor`

**Descrição:**
```
Implementa interceptor de logging
- Log de requisições HTTP
- Tempo de resposta
- Status codes
```

**Arquivos modificados:**
- `src/common/interceptors/logging.interceptor.ts` (criado)
- `src/main.ts` (modificado)

---

### Commit 10.2: Implementar métricas (Prometheus)

**Título:** `feat(observability): implementar métricas Prometheus`

**Descrição:**
```
Adiciona suporte a métricas Prometheus
- Endpoint /metrics
- Métricas HTTP
- Métricas de aplicação
- Configuração via variáveis de ambiente
```

**Arquivos modificados:**
- `src/common/interceptors/metrics.interceptor.ts` (criado)
- `src/config/observability.config.ts` (criado)
- `src/main.ts` (modificado)

---

### Commit 10.3: Integrar Sentry (opcional)

**Título:** `feat(observability): integrar Sentry para error tracking`

**Descrição:**
```
Adiciona integração com Sentry
- Captura de exceções
- Contexto de requisições
- Configuração via variáveis de ambiente
```

**Arquivos modificados:**
- `src/common/filters/http-exception.filter.ts` (modificado)
- `src/config/observability.config.ts` (modificado)

---

## Fase 11: Testes

### Commit 11.1: Configurar ambiente de testes

**Título:** `test: configurar ambiente de testes`

**Descrição:**
```
Configura Jest e ambiente de testes
- jest.config.js
- Setup de banco de testes
- Helpers e fixtures
```

**Arquivos modificados:**
- `jest.config.js` (criado)
- `test/helpers/test-db.ts` (criado)
- `test/helpers/fixtures.ts` (criado)

---

### Commit 11.2: Testes unitários - Services

**Título:** `test(unit): adicionar testes unitários para services`

**Descrição:**
```
Cria testes unitários para services
- AuthService
- UsersService
- UrlsService
- ClicksService
- Mocks de repositories
```

**Arquivos modificados:**
- `test/unit/services/auth.service.spec.ts` (criado)
- `test/unit/services/users.service.spec.ts` (criado)
- `test/unit/services/urls.service.spec.ts` (criado)
- `test/unit/services/clicks.service.spec.ts` (criado)

---

### Commit 11.3: Testes unitários - Strategies

**Título:** `test(unit): adicionar testes para estratégias de código curto`

**Descrição:**
```
Testa geração de código curto
- HashBasedGenerator
- RandomGenerator
- Verificação de colisão
```

**Arquivos modificados:**
- `test/unit/strategies/hash-based.generator.spec.ts` (criado)
- `test/unit/strategies/random.generator.spec.ts` (criado)

---

### Commit 11.4: Testes de integração - Auth

**Título:** `test(integration): adicionar testes de integração para autenticação`

**Descrição:**
```
Testa fluxo completo de autenticação
- POST /api/auth/register
- POST /api/auth/login
- Validação de token
```

**Arquivos modificados:**
- `test/integration/auth.e2e-spec.ts` (criado)

---

### Commit 11.5: Testes de integração - URLs

**Título:** `test(integration): adicionar testes de integração para URLs`

**Descrição:**
```
Testa fluxo completo de URLs
- Criação (público e autenticado)
- Listagem
- Atualização
- Exclusão
- Redirecionamento
```

**Arquivos modificados:**
- `test/integration/urls.e2e-spec.ts` (criado)

---

### Commit 11.6: Testes E2E

**Título:** `test(e2e): adicionar testes end-to-end`

**Descrição:**
```
Testa fluxos completos da aplicação
- Fluxo completo: registro → login → criar URL → acessar
- Validações de negócio
- Tratamento de erros
```

**Arquivos modificados:**
- `test/e2e/api.e2e-spec.ts` (criado)

---

## Fase 12: Documentação Swagger

### Commit 12.1: Configurar Swagger

**Título:** `docs(api): configurar Swagger/OpenAPI`

**Descrição:**
```
Configura documentação Swagger
- Setup do SwaggerModule
- Decorators nos controllers
- Schemas de DTOs
- Autenticação JWT no Swagger
```

**Arquivos modificados:**
- `src/main.ts` (modificado)
- `src/modules/auth/auth.controller.ts` (modificado - decorators)
- `src/modules/urls/urls.controller.ts` (modificado - decorators)

---

### Commit 12.2: Adicionar exemplos e descrições

**Título:** `docs(api): adicionar exemplos e descrições no Swagger`

**Descrição:**
```
Melhora documentação Swagger
- Exemplos de requisições/respostas
- Descrições detalhadas
- Tags organizadas
```

**Arquivos modificados:**
- `src/modules/auth/auth.controller.ts` (modificado)
- `src/modules/auth/dto/register.dto.ts` (modificado)
- `src/modules/auth/dto/login.dto.ts` (modificado)
- `src/modules/urls/urls.controller.ts` (modificado)
- `src/modules/urls/dto/create-url.dto.ts` (modificado)

---

## Fase 13: Docker e Infraestrutura

### Commit 13.1: Criar Dockerfile

**Título:** `chore(docker): criar Dockerfile da aplicação`

**Descrição:**
```
Cria Dockerfile otimizado
- Multi-stage build
- Node.js 20.11.0
- Produção otimizada
```

**Arquivos modificados:**
- `Dockerfile` (criado)
- `.dockerignore` (criado)

---

### Commit 13.2: Criar docker-compose.yml

**Título:** `chore(docker): criar docker-compose.yml`

**Descrição:**
```
Cria docker-compose para ambiente completo
- Serviço da aplicação
- PostgreSQL
- Volumes e networks
- Variáveis de ambiente
```

**Arquivos modificados:**
- `docker-compose.yml` (criado)

---

### Commit 13.3: Adicionar scripts de desenvolvimento

**Título:** `chore(scripts): adicionar scripts de desenvolvimento`

**Descrição:**
```
Adiciona scripts úteis
- docker:up, docker:down
- migration:run, migration:revert
- seed:run
```

**Arquivos modificados:**
- `package.json` (modificado)

---

## Fase 14: Resiliência e Tolerância a Falhas

### Commit 14.1: Implementar Circuit Breaker

**Título:** `feat(resilience): implementar Circuit Breaker`

**Descrição:**
```
Adiciona padrão Circuit Breaker
- CircuitBreakerService
- Estados: CLOSED, OPEN, HALF_OPEN
- Threshold configurável
```

**Arquivos modificados:**
- `src/common/services/circuit-breaker.service.ts` (criado)

---

### Commit 14.2: Implementar Retry Pattern

**Título:** `feat(resilience): implementar Retry Pattern`

**Descrição:**
```
Adiciona retry logic com exponential backoff
- RetryService
- Configuração de tentativas
- Backoff exponencial
```

**Arquivos modificados:**
- `src/common/services/retry.service.ts` (criado)
- `src/modules/urls/urls.service.ts` (modificado - usa retry)

---

### Commit 14.3: Implementar Health Checks

**Título:** `feat(health): implementar health checks`

**Descrição:**
```
Adiciona endpoint de health check
- GET /health
- Verifica banco de dados
- Verifica serviços externos
```

**Arquivos modificados:**
- `src/modules/health/health.module.ts` (criado)
- `src/modules/health/health.controller.ts` (criado)
- `src/modules/health/health.service.ts` (criado)

---

### Commit 14.4: Adicionar TimeoutInterceptor

**Título:** `feat(resilience): adicionar TimeoutInterceptor`

**Descrição:**
```
Implementa timeout para requisições
- Timeout configurável
- RequestTimeoutException
```

**Arquivos modificados:**
- `src/common/interceptors/timeout.interceptor.ts` (criado)
- `src/main.ts` (modificado)

---

## Fase 15: CI/CD

### Commit 15.1: Criar GitHub Actions - Lint

**Título:** `ci: adicionar workflow de lint`

**Descrição:**
```
Cria workflow para lint
- ESLint
- Prettier check
- Executa em PRs
```

**Arquivos modificados:**
- `.github/workflows/ci.yml` (criado)

---

### Commit 15.2: Adicionar testes no CI

**Título:** `ci: adicionar testes no workflow`

**Descrição:**
```
Adiciona testes no CI
- Testes unitários
- Testes de integração
- Testes E2E
- Cobertura de código
```

**Arquivos modificados:**
- `.github/workflows/ci.yml` (modificado)

---

### Commit 15.3: Adicionar build no CI

**Título:** `ci: adicionar build no workflow`

**Descrição:**
```
Adiciona build no CI
- Compilação TypeScript
- Verificação de build
- Upload de artifacts
```

**Arquivos modificados:**
- `.github/workflows/ci.yml` (modificado)

---

### Commit 15.4: Criar workflow de release

**Título:** `ci: criar workflow de release`

**Descrição:**
```
Cria workflow para releases
- Trigger por tags
- Cria GitHub Release
- Usa CHANGELOG.md
```

**Arquivos modificados:**
- `.github/workflows/release.yml` (criado)

---

## Fase 16: Otimizações e Melhorias

### Commit 16.1: Otimizar queries do banco

**Título:** `perf(database): otimizar queries do banco`

**Descrição:**
```
Otimiza queries frequentes
- Adiciona índices faltantes
- Otimiza joins
- Usa view para estatísticas
```

**Arquivos modificados:**
- `src/modules/urls/urls.repository.ts` (modificado)
- `src/modules/clicks/clicks.repository.ts` (modificado)
- `database/migrations/1234567891-OptimizeQueries.ts` (criado)

---

### Commit 16.2: Adicionar cache para URLs frequentes

**Título:** `perf(cache): adicionar cache para URLs frequentes`

**Descrição:**
```
Implementa cache para URLs mais acessadas
- Cache de redirecionamentos
- TTL configurável
- Invalidação automática
```

**Arquivos modificados:**
- `src/common/services/cache.service.ts` (criado)
- `src/modules/urls/urls.service.ts` (modificado)

---

### Commit 16.3: Adicionar rate limiting

**Título:** `feat(security): adicionar rate limiting`

**Descrição:**
```
Implementa rate limiting
- ThrottlerModule
- Limites por IP
- Limites por usuário autenticado
```

**Arquivos modificados:**
- `src/common/guards/throttler.guard.ts` (criado)
- `src/app.module.ts` (modificado)

---

## Fase 17: Finalização

### Commit 17.1: Atualizar documentação

**Título:** `docs: atualizar documentação final`

**Descrição:**
```
Atualiza documentação com informações finais
- README.md completo
- Exemplos de uso
- Troubleshooting
```

**Arquivos modificados:**
- `README.md` (modificado)

---

### Commit 17.2: Adicionar CHANGELOG

**Título:** `docs: adicionar CHANGELOG.md`

**Descrição:**
```
Cria changelog inicial
- Versão 0.1.0: Encurtador criado
- Versão 0.2.0: Autenticação
- Versão 0.3.0: Operações de usuário
- Versão 0.4.0: Contabilização de acessos
```

**Arquivos modificados:**
- `CHANGELOG.md` (modificado)

---

### Commit 17.3: Criar git tags de versão

**Título:** `chore(release): criar tags de versão`

**Descrição:**
```
Cria tags Git para releases
- v0.1.0: Encurtador criado
- v0.2.0: Autenticação
- v0.3.0: Operações de usuário
- v0.4.0: Contabilização de acessos
```

**Comandos:**
```bash
git tag -a v0.1.0 -m "Release 0.1.0: Encurtador criado"
git tag -a v0.2.0 -m "Release 0.2.0: Autenticação"
git tag -a v0.3.0 -m "Release 0.3.0: Operações de usuário"
git tag -a v0.4.0 -m "Release 0.4.0: Contabilização de acessos"
git push origin --tags
```

---

## Resumo das Fases

1. **Fase 1**: Setup Inicial (3 commits)
2. **Fase 2**: Entidades e Schema (4 commits)
3. **Fase 3**: Módulo de Usuários (2 commits)
4. **Fase 4**: Módulo de Autenticação (4 commits)
5. **Fase 5**: Guards e Decorators (3 commits)
6. **Fase 6**: Módulo de URLs (5 commits)
7. **Fase 7**: Módulo de Cliques (3 commits)
8. **Fase 8**: Redirecionamento (1 commit)
9. **Fase 9**: Validação e Erros (3 commits)
10. **Fase 10**: Observabilidade (3 commits)
11. **Fase 11**: Testes (6 commits)
12. **Fase 12**: Documentação Swagger (2 commits)
13. **Fase 13**: Docker (3 commits)
14. **Fase 14**: Resiliência (4 commits)
15. **Fase 15**: CI/CD (4 commits)
16. **Fase 16**: Otimizações (3 commits)
17. **Fase 17**: Finalização (3 commits)

**Total: ~55 commits**

---

## Ordem de Prioridade

### Prioridade Alta (MVP)
1. Fases 1-8: Funcionalidades core
2. Fase 9: Validação básica
3. Fase 11: Testes básicos
4. Fase 12: Swagger básico

### Prioridade Média
5. Fase 10: Observabilidade básica
6. Fase 13: Docker
7. Fase 14: Resiliência básica

### Prioridade Baixa (Diferenciais)
8. Fase 15: CI/CD completo
9. Fase 16: Otimizações avançadas
10. Fase 17: Finalização

---

## Dicas de Implementação

1. **Commits pequenos**: Um commit por funcionalidade
2. **Testes primeiro**: Escreva testes antes ou junto com o código
3. **Validação contínua**: Execute lint e testes a cada commit
4. **Documentação**: Atualize documentação junto com o código
5. **Revisão**: Revise cada fase antes de avançar

---

## Comandos Úteis

```bash
# Verificar status antes de commitar
git status
git diff

# Adicionar arquivos específicos
git add arquivo1.ts arquivo2.ts

# Commit com mensagem
git commit -m "tipo(escopo): descrição"

# Ver histórico
git log --oneline

# Criar tag
git tag -a v0.1.0 -m "Release 0.1.0"

# Push com tags
git push origin main --tags
```

