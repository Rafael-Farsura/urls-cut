# Estrutura do Projeto - NestJS

## Estrutura de Diretórios (Monorepo)

```
urls-cut/
├── services/                         # Serviços do monorepo
│   ├── auth-service/                # Serviço de autenticação (porta 3001)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── jwks.controller.ts  # JWKS endpoint para gateway
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── register.dto.ts
│   │   │   │   │       └── login.dto.ts
│   │   │   │   └── users/
│   │   │   │       ├── users.module.ts
│   │   │   │       ├── users.service.ts
│   │   │   │       ├── users.repository.ts
│   │   │   │       └── entities/
│   │   │   │           └── user.entity.ts
│   │   │   ├── common/              # Recursos específicos do serviço
│   │   │   │   └── guards/         # Guards específicos (ex: GatewayAuthGuard)
│   │   │   ├── config/
│   │   │   ├── database/
│   │   │   ├── modules/
│   │   │   │   └── health/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   └── url-service/                 # Serviço de URLs (porta 3002)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── urls/
│       │   │   │   ├── urls.module.ts
│       │   │   │   ├── urls.controller.ts
│       │   │   │   ├── urls.service.ts
│       │   │   │   ├── urls.repository.ts
│       │   │   │   ├── redirect.controller.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── short-url.entity.ts
│       │   │   │   └── dto/
│       │   │   │       ├── create-url.dto.ts
│       │   │   │       └── update-url.dto.ts
│       │   │   └── clicks/
│       │   │       ├── clicks.module.ts
│       │   │       ├── clicks.service.ts
│       │   │       ├── clicks.repository.ts
│       │   │       └── entities/
│       │   │           └── click.entity.ts
│       │   ├── common/
│       │   ├── config/
│       │   ├── database/
│       │   ├── modules/
│       │   │   ├── health/
│       │   │   └── metrics/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       └── nest-cli.json
├── packages/                         # Pacotes compartilhados
│   └── shared/                      # Código compartilhado entre serviços
│       ├── src/
│       │   ├── common/              # Recursos compartilhados
│       │   │   ├── decorators/     # @Public(), @CurrentUser(), IS_PUBLIC_KEY
│       │   │   ├── guards/         # JwtAuthGuard
│       │   │   ├── interceptors/   # LoggingInterceptor, MetricsInterceptor, TimeoutInterceptor
│       │   │   ├── filters/        # HttpExceptionFilter
│       │   │   ├── services/       # CircuitBreakerService, RetryService
│       │   │   └── strategies/     # Short-code generators (HashBasedGenerator, RandomGenerator)
│       │   ├── config/             # Configurações compartilhadas
│       │   │   ├── app.config.ts
│       │   │   ├── database.config.ts
│       │   │   ├── jwt.config.ts
│       │   │   └── observability.config.ts
│       │   └── index.ts            # Exports principais
│       ├── package.json
│       └── tsconfig.json
├── gateway/                         # API Gateway
│   └── krakend/                    # Configuração KrakenD
│       └── krakend.json           # Configuração de roteamento e validação JWT
├── database/
│   ├── migrations/
│   └── schema.sql                  # Schema completo
├── docs/                            # Documentação completa
│   ├── ARCHITECTURE.md
│   ├── DIAGRAMS.md
│   ├── DESIGN_PATTERNS.md
│   ├── DATABASE_DESIGN.md
│   ├── API_SPECIFICATION.md
│   ├── EXECUTION_STRUCTURE.md
│   └── PROJECT_STRUCTURE.md
├── test/                            # Testes E2E
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── urls.e2e-spec.ts
│   └── resilience.e2e-spec.ts
├── scripts/                         # Scripts de automação
│   ├── test-gateway.sh            # Testes do API Gateway
│   └── test-cicd.sh               # Verificação de CI/CD
├── postman/                        # Coleção Postman
│   ├── URLs-Cut.postman_collection.json
│   └── URLs-Cut.postman_environment.json
├── .github/
│   └── workflows/
│       ├── ci.yml                  # CI/CD pipeline
│       └── release.yml             # Release automation
├── docker-compose.yml              # Docker Compose (monorepo) - obrigatório
├── .env.example
├── CHANGELOG.md
├── README.md
└── package.json
```

## Descrição dos Diretórios

### `/src/modules`

Módulos NestJS que encapsulam funcionalidades relacionadas. Cada módulo contém:
- **Module**: Arquivo `.module.ts` que declara providers, controllers, imports
- **Controller**: Handlers HTTP com decorators
- **Service**: Lógica de negócio (@Injectable)
- **Repository**: Acesso a dados (TypeORM)
- **Entities**: Entidades TypeORM
- **DTOs**: Data Transfer Objects com validação

#### `/src/modules/auth`
Módulo de autenticação:
- Registro e login de usuários
- Geração e validação de JWT
- Passport strategies

#### `/src/modules/users`
Módulo de usuários:
- Gerenciamento de usuários
- Repository para acesso a dados

#### `/src/modules/urls`
Módulo de URLs encurtadas:
- CRUD de URLs
- Geração de códigos curtos
- Validação de URLs

#### `/src/modules/clicks`
Módulo de cliques:
- Registro de cliques
- Estatísticas de acesso

### `/packages/shared` (Código Compartilhado)

⚠️ **IMPORTANTE**: A partir da Fase 2, todo o código compartilhado foi centralizado em `packages/shared/` e é usado via `@urls-cut/shared` nos serviços.

**Antes** (código duplicado):
- Cada serviço tinha sua própria cópia de decorators, filters, interceptors, guards, strategies

**Agora** (código centralizado):
- Código compartilhado em `packages/shared/src/common/`
- Serviços importam via `import { ... } from '@urls-cut/shared'`
- Elimina duplicação e facilita manutenção

#### `/packages/shared/src/common/decorators`
Decorators compartilhados:
- `@CurrentUser()`: Extrai usuário do request
- `@Public()`: Marca rotas públicas (bypass auth)
- `IS_PUBLIC_KEY`: Constante para metadados

#### `/packages/shared/src/common/guards`
Guards compartilhados:
- `JwtAuthGuard`: Verifica token JWT (usado no auth-service)

#### `/packages/shared/src/common/interceptors`
Interceptors compartilhados:
- `LoggingInterceptor`: Log de requisições e respostas
- `MetricsInterceptor`: Coleta de métricas Prometheus
- `TimeoutInterceptor`: Timeout para requisições

#### `/packages/shared/src/common/filters`
Exception filters compartilhados:
- `HttpExceptionFilter`: Tratamento global de exceções formatado

#### `/packages/shared/src/common/services`
Serviços de resiliência compartilhados:
- `CircuitBreakerService`: Circuit breaker pattern
- `RetryService`: Retry pattern com exponential backoff

#### `/packages/shared/src/common/strategies`
Implementações do Strategy Pattern:
- `ShortCodeGeneratorFactory`: Factory para geradores
- `HashBasedGenerator`: Geração baseada em hash
- `RandomGenerator`: Geração aleatória

### `/services/*/src/common` (Recursos Específicos do Serviço)

Apenas recursos específicos de cada serviço:
- **auth-service**: Apenas `guards/` se necessário (atualmente vazio)
- **url-service**: `guards/gateway-auth.guard.ts` (específico para gateway)

> **Nota**: Decorators, filters, interceptors e strategies compartilhados estão em `packages/shared/` e são importados via `@urls-cut/shared`.

### `/src/config`

Configurações da aplicação:
- Configuração do TypeORM
- Configuração do JWT
- Configurações gerais

### `/src/main.ts`

Bootstrap da aplicação NestJS:
- Criação do app
- Configuração de middlewares globais
- Configuração do Swagger
- Inicialização do servidor

## Convenções de Nomenclatura (NestJS)

### Arquivos
- **Modules**: `*.module.ts` (ex: `auth.module.ts`)
- **Controllers**: `*.controller.ts` (ex: `auth.controller.ts`)
- **Services**: `*.service.ts` (ex: `auth.service.ts`)
- **Repositories**: `*.repository.ts` (ex: `users.repository.ts`)
- **Entities**: `*.entity.ts` (ex: `user.entity.ts`)
- **DTOs**: `*.dto.ts` (ex: `create-url.dto.ts`)
- **Guards**: `*.guard.ts` (ex: `jwt-auth.guard.ts`)
- **Interceptors**: `*.interceptor.ts` (ex: `logging.interceptor.ts`)
- **Pipes**: `*.pipe.ts` (ex: `validation.pipe.ts`)
- **Filters**: `*.filter.ts` (ex: `http-exception.filter.ts`)
- **Strategies**: `*.strategy.ts` (ex: `jwt.strategy.ts`)

### Classes
- **Modules**: `*Module` (ex: `AuthModule`)
- **Controllers**: `*Controller` (ex: `AuthController`)
- **Services**: `*Service` (ex: `AuthService`)
- **Repositories**: `*Repository` (ex: `UsersRepository`)
- **Entities**: PascalCase (ex: `User`, `ShortUrl`)
- **DTOs**: `*Dto` (ex: `CreateUrlDto`)
- **Guards**: `*Guard` (ex: `JwtAuthGuard`)
- **Interceptors**: `*Interceptor` (ex: `LoggingInterceptor`)
- **Pipes**: `*Pipe` (ex: `ValidationPipe`)
- **Filters**: `*Filter` (ex: `HttpExceptionFilter`)

### Variáveis e Funções
- **camelCase** para variáveis e funções
- **UPPER_SNAKE_CASE** para constantes
- **PascalCase** para classes e interfaces

## Fluxo de Dados (NestJS)

```
HTTP Request
  ↓
Module (routing)
  ↓
Guard (authentication/authorization)
  ↓
Interceptor (before)
  ↓
Pipe (validation/transformation)
  ↓
Controller (handler)
  ↓
Service (business logic)
  ↓
Repository (data access)
  ↓
Database
  ↓
Service (process result)
  ↓
Interceptor (after - transform response)
  ↓
Exception Filter (if error)
  ↓
HTTP Response
```

## Dependências entre Camadas

```
Modules
  ↓
Controllers → Services → Repositories → Database
     ↓           ↓            ↓
  DTOs      Entities    TypeORM Entities
```

**Regras:**
- Controllers não acessam Repositories diretamente
- Services não acessam Database diretamente (usam Repositories)
- Repositories usam TypeORM para acesso a dados
- Entities são compartilhadas entre camadas
- DTOs são usados para validação de entrada/saída

## Exemplo de Módulo NestJS

```typescript
// urls.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([ShortUrl, Click]),
    ClicksModule,
  ],
  controllers: [UrlsController],
  providers: [
    UrlsService,
    UrlsRepository,
    {
      provide: 'IShortCodeGenerator',
      useClass: HashBasedGenerator,
    },
  ],
  exports: [UrlsService],
})
export class UrlsModule {}
```

## Estrutura de um Controller

```typescript
// urls.controller.ts
@Controller('urls')
@UseGuards(JwtAuthGuard)
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post()
  @Public() // Bypass auth para criação pública
  async create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlsService.create(createUrlDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.urlsService.findByUserId(user.id);
  }
}
```

## Estrutura de um Service

```typescript
// urls.service.ts
@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly urlsRepository: Repository<ShortUrl>,
    @Inject('IShortCodeGenerator')
    private readonly codeGenerator: IShortCodeGenerator,
    private readonly clicksService: ClicksService,
  ) {}

  async create(createUrlDto: CreateUrlDto, userId?: string): Promise<ShortUrl> {
    // Lógica de negócio
  }
}
```

## Vantagens da Arquitetura NestJS

1. **Modularidade**: Código organizado em módulos independentes
2. **DI Nativo**: Sistema de injeção de dependência robusto
3. **Decorators**: Sintaxe declarativa e limpa
4. **TypeScript First**: Suporte completo a TypeScript
5. **Testabilidade**: Fácil de testar com mocks e stubs
6. **Escalabilidade**: Estrutura preparada para crescimento
7. **Convenções**: Padrões claros e bem definidos

## Estrutura para Monorepo (Avançado)

Para projetos maiores, pode-se adotar estrutura de monorepo:

```
urls-cut/
├── services/
│   ├── auth-service/
│   ├── url-service/
│   └── analytics-service/
├── packages/
│   ├── shared/
│   └── database/
├── gateway/
│   └── krakend/
└── infrastructure/
```

Detalhes completos no README.md principal.
