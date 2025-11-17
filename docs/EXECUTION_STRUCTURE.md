# Estrutura de Execução do Sistema

## Fluxo de Execução Geral (Monorepo com API Gateway)

### Inicialização do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│              INICIALIZAÇÃO DO MONOREPO                        │
├─────────────────────────────────────────────────────────────┤
│  1. Docker Compose inicia PostgreSQL                        │
│  2. Auth Service inicia (porta 3001)                        │
│     - Carrega variáveis de ambiente                         │
│     - Conecta ao PostgreSQL                                 │
│     - Configura TypeORM (apenas entidade User)              │
│     - Inicia servidor NestJS                                │
│  3. URL Service inicia (porta 3002)                          │
│     - Carrega variáveis de ambiente                         │
│     - Conecta ao PostgreSQL                                 │
│     - Configura TypeORM (entidades ShortUrl, Click)         │
│     - Inicia servidor NestJS                                │
│  4. API Gateway (KrakenD) inicia (porta 8080)               │
│     - Carrega configuração (krakend.json)                   │
│     - Configura roteamento para serviços                    │
│     - Configura validação JWT                               │
│     - Configura rate limiting                               │
└─────────────────────────────────────────────────────────────┘
```

### Inicialização de um Serviço (NestJS)

```
┌─────────────────────────────────────────────────────────────┐
│              INICIALIZAÇÃO DE SERVIÇO (main.ts)              │
├─────────────────────────────────────────────────────────────┤
│  1. Carregar variáveis de ambiente (@nestjs/config)         │
│  2. Criar aplicação NestJS (NestFactory.create)              │
│  3. Configurar TypeORM (conexão com banco)                  │
│  4. Executar migrações (se necessário)                      │
│  5. Configurar middlewares globais                          │
│  6. Configurar guards globais (se necessário)               │
│  7. Configurar interceptors globais                         │
│  8. Configurar exception filters globais                    │
│  9. Configurar Swagger (documentação)                       │
│  10. Registrar módulos (AppModule)                           │
│  11. Iniciar servidor HTTP (app.listen)                    │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Requisição HTTP (Monorepo com API Gateway)

### Fluxo Completo (com API Gateway)

```
┌─────────────────────────────────────────────────────────────┐
│              REQUEST PIPELINE (Monorepo)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTTP Request (Cliente)                                      │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────┐                                    │
│  │  API Gateway        │  ← KrakenD (Porta 8080)           │
│  │  (KrakenD)          │                                    │
│  └──────────┬──────────┘                                    │
│             │                                                │
│             ├─→ Validação JWT (se endpoint protegido)       │
│             ├─→ Rate Limiting                               │
│             ├─→ Roteamento para serviço                     │
│             │                                                │
│             ├─→ Auth Service (3001) ou                      │
│             └─→ URL Service (3002)                          │
│                     │                                        │
│                     ▼                                        │
│  ┌─────────────────────────────────────┐                    │
│  │  REQUEST PIPELINE (NestJS Service)   │                    │
│  ├─────────────────────────────────────┤                    │
│  │  Global Middleware (CORS, Body)     │                    │
│  │  Module Router                      │                    │
│  │  Guard (CanActivate)                │                    │
│  │  Interceptor (before)               │                    │
│  │  Pipe (ValidationPipe)              │                    │
│  │  Controller Handler                 │                    │
│  │    └─→ Service Layer                │                    │
│  │        └─→ Repository (TypeORM)     │                    │
│  │            └─→ Database             │                    │
│  │  Interceptor (after)                │                    │
│  │  Exception Filter                   │                    │
│  └─────────────────────────────────────┘                    │
│             │                                                │
│             ▼                                                │
│  API Gateway (agrega/transforma resposta)                    │
│             │                                                │
│             ▼                                                │
│  HTTP Response (Cliente)                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Requisição Direto ao Serviço (sem Gateway)

```
┌─────────────────────────────────────────────────────────────┐
│              REQUEST PIPELINE (NestJS Service)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HTTP Request                                                │
│       │                                                      │
│       ├─→ Global Middleware (CORS, Body Parser)            │
│       │                                                      │
│       ├─→ Module Router (resolve module)                   │
│       │                                                      │
│       ├─→ Guard (CanActivate)                               │
│       │     └─→ Verifica autenticação/autorização          │
│       │                                                      │
│       ├─→ Interceptor (before)                              │
│       │     └─→ Logging, transformação                     │
│       │                                                      │
│       ├─→ Pipe (ValidationPipe)                            │
│       │     └─→ Valida e transforma dados de entrada        │
│       │                                                      │
│       ├─→ Controller Handler                                │
│       │       │                                              │
│       │       ├─→ Service Layer                             │
│       │       │       │                                      │
│       │       │       ├─→ Business Logic                   │
│       │       │       ├─→ Repository Layer (TypeORM)        │
│       │       │       │       │                              │
│       │       │       │       └─→ Database                  │
│       │       │       │                                      │
│       │       │       └─→ Response DTO                      │
│       │       │                                              │
│       │       └─→ Return Response                           │
│       │                                                      │
│       ├─→ Interceptor (after)                               │
│       │     └─→ Transforma resposta                         │
│       │                                                      │
│       ├─→ Exception Filter (se erro)                        │
│       │     └─→ Trata exceções e formata erro              │
│       │                                                      │
│       └─→ HTTP Response                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo Detalhado por Endpoint

### 1. POST /api/auth/register

```
Cliente
  │
  ├─→ POST /api/auth/register { email, password }
  │
  ├─→ NestJS Router (resolve AuthModule)
  │
  ├─→ ValidationPipe (valida RegisterDto)
  │     └─→ class-validator valida email e password
  │
  ├─→ AuthController.register()
  │     │
  │     ├─→ AuthService.register()
  │     │     │
  │     │     ├─→ UsersService.findByEmail()
  │     │     │     └─→ UsersRepository.findOne()
  │     │     │           └─→ SELECT FROM users WHERE email = ?
  │     │     │
  │     │     ├─→ Se email existe → throw ConflictException
  │     │     │
  │     │     ├─→ AuthService.hashPassword()
  │     │     │     └─→ bcrypt.hash()
  │     │     │
  │     │     └─→ UsersService.create()
  │     │           └─→ UsersRepository.save()
  │     │                 └─→ INSERT INTO users
  │     │
  │     └─→ Response 201 { user: { id, email } }
  │
  └─→ Cliente recebe resposta
```

### 2. POST /api/auth/login

```
Cliente
  │
  ├─→ POST /api/auth/login { email, password }
  │
  ├─→ NestJS Router (resolve AuthModule)
  │
  ├─→ ValidationPipe (valida LoginDto)
  │
  ├─→ AuthController.login()
  │     │
  │     ├─→ AuthService.validateUser()
  │     │     │
  │     │     ├─→ UsersService.findByEmail()
  │     │     │     └─→ UsersRepository.findOne()
  │     │     │           └─→ SELECT FROM users WHERE email = ?
  │     │     │
  │     │     ├─→ Se não encontrado → throw UnauthorizedException
  │     │     │
  │     │     └─→ AuthService.verifyPassword()
  │     │           └─→ bcrypt.compare()
  │     │
  │     ├─→ AuthService.login()
  │     │     └─→ JwtService.sign()
  │     │           └─→ Gera token JWT
  │     │
  │     └─→ Response 200 { access_token: "..." }
  │
  └─→ Cliente recebe token
```

### 3. POST /api/urls (Criar URL Encurtado)

```
Cliente (com ou sem token)
  │
  ├─→ POST /api/urls { originalUrl } [Authorization: Bearer token?]
  │
  ├─→ NestJS Router (resolve UrlsModule)
  │
  ├─→ @Public() decorator (bypass JwtAuthGuard se não autenticado)
  │
  ├─→ ValidationPipe (valida CreateUrlDto)
  │     └─→ Valida formato de URL com class-validator
  │
  ├─→ UrlsController.create()
  │     │
  │     ├─→ @CurrentUser() decorator (extrai user se token presente)
  │     │
  │     ├─→ UrlsService.create()
  │     │     │
  │     │     ├─→ ShortCodeGenerator.generate()
  │     │     │     └─→ Gera código de 6 caracteres
  │     │     │
  │     │     ├─→ Loop: Verificar colisão
  │     │     │     │
  │     │     │     ├─→ UrlsRepository.findOne()
  │     │     │     │     └─→ SELECT FROM short_urls WHERE code = ?
  │     │     │     │
  │     │     │     └─→ Se existe, gerar novo código
  │     │     │
  │     │     ├─→ Criar entidade ShortUrl
  │     │     │     └─→ new ShortUrl({ originalUrl, shortCode, userId })
  │     │     │
  │     │     └─→ UrlsRepository.save()
  │     │           └─→ INSERT INTO short_urls
  │     │
  │     └─→ Response 201 { shortUrl: "http://localhost/abc123", originalUrl }
  │
  └─→ Cliente recebe URL encurtado
```

### 4. GET /:shortCode (Redirecionar)

```
Cliente
  │
  ├─→ GET /abc123
  │
  ├─→ NestJS Router (resolve UrlsModule)
  │
  ├─→ @Public() decorator (bypass auth)
  │
  ├─→ RedirectController.redirect()
  │     │
  │     ├─→ UrlsService.findByCode()
  │     │     │
  │     │     ├─→ UrlsRepository.findOne()
  │     │     │     └─→ SELECT FROM short_urls 
  │     │     │           WHERE code = ? AND deleted_at IS NULL
  │     │     │
  │     │     └─→ Retorna ShortUrl ou null
  │     │
  │     ├─→ Se não encontrado → throw NotFoundException
  │     │
  │     ├─→ ClicksService.recordClick() (assíncrono)
  │     │     │
  │     │     ├─→ Criar entidade Click
  │     │     │     └─→ new Click({ shortUrlId, ipAddress, userAgent })
  │     │     │
  │     │     └─→ ClicksRepository.save()
  │     │           └─→ INSERT INTO clicks
  │     │
  │     └─→ Response 302 Redirect → originalUrl
  │
  └─→ Cliente é redirecionado
```

### 5. GET /api/urls (Listar URLs do Usuário)

```
Cliente (autenticado)
  │
  ├─→ GET /api/urls [Authorization: Bearer token]
  │
  ├─→ Middleware: authenticate()
  │     └─→ Valida token e extrai userId
  │
  ├─→ UrlController.list()
  │     │
  │     ├─→ UrlService.listUserUrls()
  │     │     │
  │     │     ├─→ UrlRepository.findByUserId()
  │     │     │     └─→ SELECT FROM short_urls 
  │     │     │           WHERE user_id = ? AND deleted_at IS NULL
  │     │     │
  │     │     ├─→ Para cada URL:
  │     │     │     │
  │     │     │     └─→ ClickService.getClickCount()
  │     │     │           └─→ SELECT COUNT(*) FROM clicks 
  │     │     │                 WHERE short_url_id = ?
  │     │     │
  │     │     └─→ Retorna array com clickCount
  │     │
  │     └─→ Response 200 { urls: [...] }
  │
  └─→ Cliente recebe lista
```

### 6. PUT /api/urls/:id (Atualizar URL)

```
Cliente (autenticado)
  │
  ├─→ PUT /api/urls/:id { originalUrl } [Authorization: Bearer token]
  │
  ├─→ Middleware: authenticate()
  │
  ├─→ UrlController.update()
  │     │
  │     ├─→ Validator.validateUpdateUrlInput()
  │     │
  │     ├─→ UrlService.updateShortUrl()
  │     │     │
  │     │     ├─→ UrlRepository.findById()
  │     │     │     └─→ Verifica se URL existe
  │     │     │
  │     │     ├─→ Verifica ownership (userId)
  │     │     │     └─→ Se não for dono → 403
  │     │     │
  │     │     ├─→ Verifica se deletado (deleted_at IS NULL)
  │     │     │     └─→ Se deletado → 404
  │     │     │
  │     │     └─→ UrlRepository.update()
  │     │           └─→ UPDATE short_urls SET original_url = ?, updated_at = NOW()
  │     │
  │     └─→ Response 200 { shortUrl: {...} }
  │
  └─→ Cliente recebe URL atualizado
```

### 7. DELETE /api/urls/:id (Deletar URL)

```
Cliente (autenticado)
  │
  ├─→ DELETE /api/urls/:id [Authorization: Bearer token]
  │
  ├─→ Middleware: authenticate()
  │
  ├─→ UrlController.delete()
  │     │
  │     ├─→ UrlService.deleteShortUrl()
  │     │     │
  │     │     ├─→ UrlRepository.findById()
  │     │     │     └─→ Verifica se URL existe
  │     │     │
  │     │     ├─→ Verifica ownership (userId)
  │     │     │     └─→ Se não for dono → 403
  │     │     │
  │     │     └─→ UrlRepository.softDelete()
  │     │           └─→ UPDATE short_urls 
  │     │                 SET deleted_at = NOW(), updated_at = NOW()
  │     │                 WHERE id = ?
  │     │
  │     └─→ Response 204 No Content
  │
  └─→ Cliente recebe confirmação
```

## Tratamento de Erros (NestJS)

```
Erro ocorre em qualquer camada
  │
  ├─→ Exception Filter captura
  │     │
  │     ├─→ Logger (com stack trace em dev)
  │     │
  │     ├─→ Classificar exceção NestJS:
  │     │     │
  │     │     ├─→ BadRequestException → 400 Bad Request
  │     │     ├─→ UnauthorizedException → 401 Unauthorized
  │     │     ├─→ ForbiddenException → 403 Forbidden
  │     │     ├─→ NotFoundException → 404 Not Found
  │     │     ├─→ ConflictException → 409 Conflict
  │     │     └─→ InternalServerErrorException → 500 Internal Server Error
  │     │
  │     └─→ Response formatada { statusCode, message, error }
  │
  └─→ Cliente recebe erro tratado
```

## Ciclo de Vida da Aplicação (NestJS)

```
1. STARTUP (main.ts)
   ├─→ Carregar ConfigModule (@nestjs/config)
   ├─→ Criar AppModule
   ├─→ Inicializar TypeORM
   ├─→ Executar migrações (se necessário)
   ├─→ Registrar módulos (imports)
   ├─→ Inicializar providers (services, repositories)
   ├─→ Configurar guards, interceptors, filters globais
   ├─→ Configurar Swagger
   └─→ Iniciar servidor HTTP (app.listen)

2. RUNTIME
   ├─→ Aceitar requisições HTTP
   ├─→ Resolver módulos e rotas
   ├─→ Executar pipeline (guards, pipes, interceptors)
   ├─→ Processar requisições
   ├─→ Registrar logs
   └─→ Manter conexão com banco (TypeORM connection pool)

3. SHUTDOWN
   ├─→ Parar de aceitar novas requisições
   ├─→ Finalizar requisições em andamento
   ├─→ Fechar conexões TypeORM
   ├─→ Executar hooks de shutdown (onModuleDestroy)
   └─→ Encerrar processo
```

## Estratégias de Execução

### Desenvolvimento
- Hot reload ativado
- Logs detalhados
- Stack traces completos
- Sem cache

### Produção
- Código compilado (TypeScript → JavaScript)
- Logs estruturados
- Stack traces limitados
- Cache ativado
- Rate limiting
- Health checks

