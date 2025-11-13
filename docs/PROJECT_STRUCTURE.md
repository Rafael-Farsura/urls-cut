# Estrutura do Projeto - NestJS

## Estrutura de Diretórios Proposta

```
urls-cut/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions
├── database/
│   ├── migrations/                   # Migrações TypeORM
│   │   └── 1234567890-CreateUsers.ts
│   ├── seeds/                        # Seeds (dados iniciais)
│   └── schema.sql                    # Schema completo
├── docs/
│   ├── ARCHITECTURE.md               # Documentação de arquitetura
│   ├── DIAGRAMS.md                   # Diagramas do sistema
│   ├── DESIGN_PATTERNS.md            # Design patterns aplicados
│   ├── DATABASE_DESIGN.md            # Design do banco de dados
│   ├── API_SPECIFICATION.md          # Especificação da API
│   ├── EXECUTION_STRUCTURE.md        # Estrutura de execução
│   └── PROJECT_STRUCTURE.md          # Este arquivo
├── src/
│   ├── modules/                      # Módulos NestJS
│   │   ├── auth/
│   │   │   ├── auth.module.ts        # Módulo de autenticação
│   │   │   ├── auth.controller.ts    # Controller
│   │   │   ├── auth.service.ts       # Service
│   │   │   ├── strategies/           # Passport strategies
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/                  # DTOs
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts    # TypeORM Repository
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── urls/
│   │   │   ├── urls.module.ts
│   │   │   ├── urls.controller.ts
│   │   │   ├── urls.service.ts
│   │   │   ├── urls.repository.ts
│   │   │   ├── entities/
│   │   │   │   └── short-url.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-url.dto.ts
│   │   │       └── update-url.dto.ts
│   │   └── clicks/
│   │       ├── clicks.module.ts
│   │       ├── clicks.service.ts
│   │       ├── clicks.repository.ts
│   │       └── entities/
│   │           └── click.entity.ts
│   ├── common/                       # Recursos compartilhados
│   │   ├── decorators/
│   │   │   ├── user.decorator.ts     # @CurrentUser()
│   │   │   └── public.decorator.ts    # @Public()
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts      # Guard de autenticação
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts    # Pipe de validação
│   │   └── strategies/               # Strategy Pattern
│   │       └── short-code/
│   │           ├── short-code-generator.interface.ts
│   │           ├── hash-based.generator.ts
│   │           └── random.generator.ts
│   ├── config/                       # Configurações
│   │   ├── database.config.ts        # Config TypeORM
│   │   ├── jwt.config.ts             # Config JWT
│   │   └── app.config.ts             # Config geral
│   └── main.ts                       # Bootstrap da aplicação
├── test/
│   ├── unit/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── strategies/
│   ├── integration/
│   │   ├── auth.e2e-spec.ts
│   │   ├── urls.e2e-spec.ts
│   │   └── redirect.e2e-spec.ts
│   └── helpers/
│       ├── test-db.ts                # Setup de banco de testes
│       └── fixtures.ts               # Dados de teste
├── .env.example                      # Exemplo de variáveis de ambiente
├── .gitignore
├── .eslintrc.js                      # Configuração ESLint
├── .prettierrc                       # Configuração Prettier
├── nest-cli.json                     # Configuração NestJS CLI
├── tsconfig.json                     # Configuração TypeScript
├── package.json
├── docker-compose.yml                # Docker Compose
├── Dockerfile                        # Dockerfile da aplicação
├── CHANGELOG.md                      # Changelog (Keep a Changelog format)
├── README.md                         # Documentação principal
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CD pipeline
│       └── release.yml               # Release automation
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

### `/src/common`

Recursos compartilhados entre módulos:

#### `/src/common/decorators`
Decorators customizados:
- `@CurrentUser()`: Extrai usuário do request
- `@Public()`: Marca rotas públicas (bypass auth)

#### `/src/common/guards`
Guards para proteção de rotas:
- `JwtAuthGuard`: Verifica token JWT
- `RolesGuard`: Verifica permissões (futuro)

#### `/src/common/interceptors`
Interceptors para transformação:
- `LoggingInterceptor`: Log de requisições
- `TransformInterceptor`: Transforma respostas

#### `/src/common/pipes`
Pipes de validação e transformação:
- `ValidationPipe`: Validação automática de DTOs

#### `/src/common/filters`
Exception filters:
- `HttpExceptionFilter`: Tratamento global de exceções

#### `/src/common/strategies`
Implementações do Strategy Pattern:
- Geração de código curto (hash-based, random)

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

Detalhes completos em [Funcionalidades Avançadas](./ADVANCED_FEATURES.md).
