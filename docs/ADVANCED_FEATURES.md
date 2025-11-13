# Funcionalidades Avançadas - URL Shortener

Este documento descreve funcionalidades avançadas e diferenciais que podem ser implementados no sistema.

## 1. API Gateway (KrakenD)

### Visão Geral

O API Gateway atua como ponto único de entrada para todos os serviços, fornecendo roteamento, autenticação, rate limiting e outras funcionalidades cross-cutting.

### Arquitetura com API Gateway

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │  ← KrakenD
│  (KrakenD)      │
└──────┬───────────┘
       │
       ├──→ Auth Service (Identidade e Acesso)
       ├──→ URL Service (Encurtamento)
       └──→ Analytics Service (Estatísticas)
```

### Benefícios

- **Roteamento Inteligente**: Distribui requisições entre serviços
- **Autenticação Centralizada**: Valida tokens em um único ponto
- **Rate Limiting**: Protege serviços contra abuso
- **Load Balancing**: Distribui carga entre instâncias
- **Transformação de Dados**: Adapta respostas entre serviços
- **Cache**: Cache de respostas frequentes
- **Monitoramento**: Métricas centralizadas

### Configuração KrakenD

```json
{
  "version": 3,
  "endpoints": [
    {
      "endpoint": "/api/auth/*",
      "method": "GET,POST",
      "backend": [
        {
          "url_pattern": "/auth/*",
          "host": ["http://auth-service:3001"]
        }
      ]
    },
    {
      "endpoint": "/api/urls/*",
      "method": "GET,POST,PUT,DELETE",
      "backend": [
        {
          "url_pattern": "/urls/*",
          "host": ["http://url-service:3002"]
        }
      ],
      "extra_config": {
        "auth/validator": {
          "alg": "HS256",
          "jwk_url": "http://auth-service:3001/.well-known/jwks.json"
        }
      }
    },
    {
      "endpoint": "/:shortCode",
      "method": "GET",
      "backend": [
        {
          "url_pattern": "/{shortCode}",
          "host": ["http://url-service:3002"]
        }
      ],
      "extra_config": {
        "qos/ratelimit/router": {
          "max_rate": 100,
          "capacity": 100
        }
      }
    }
  ]
}
```

### Docker Compose com KrakenD

```yaml
version: '3.8'

services:
  api-gateway:
    image: devopsfaith/krakend:latest
    ports:
      - "8080:8080"
    volumes:
      - ./krakend/:/etc/krakend/
    command: ["/usr/bin/krakend", "run", "-c", "/etc/krakend/krakend.json"]
    depends_on:
      - auth-service
      - url-service

  auth-service:
    build: ./services/auth
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=postgres
      - JWT_SECRET=${JWT_SECRET}

  url-service:
    build: ./services/url
    ports:
      - "3002:3002"
    environment:
      - DB_HOST=postgres
      - AUTH_SERVICE_URL=http://auth-service:3001
```

## 2. Monorepo com Separação de Serviços

### Estrutura do Monorepo

```
urls-cut/
├── services/
│   ├── auth-service/          # Serviço de Autenticação
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── url-service/           # Serviço de Encurtamento
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── analytics-service/    # Serviço de Analytics (futuro)
│       ├── src/
│       ├── package.json
│       └── Dockerfile
├── packages/
│   ├── shared/                # Código compartilhado
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   └── database/              # Configuração de banco compartilhada
├── gateway/
│   └── krakend/               # Configuração do API Gateway
├── infrastructure/
│   ├── kubernetes/
│   ├── terraform/
│   └── docker-compose.yml
├── package.json               # Workspace root
└── pnpm-workspace.yaml        # ou yarn workspaces
```

### Comunicação entre Serviços

#### 1. Síncrona (HTTP/REST)

```typescript
// url-service chamando auth-service
@Injectable()
export class AuthClient {
  constructor(private readonly httpService: HttpService) {}

  async validateToken(token: string): Promise<User> {
    const response = await this.httpService.axiosRef.get(
      `${process.env.AUTH_SERVICE_URL}/validate`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  }
}
```

#### 2. Assíncrona (Message Queue)

```typescript
// Evento: URL criada
@Injectable()
export class UrlCreatedPublisher {
  constructor(private readonly messageQueue: MessageQueue) {}

  async publish(urlCreated: UrlCreatedEvent): Promise<void> {
    await this.messageQueue.publish('url.created', urlCreated);
  }
}

// Consumidor: Analytics Service
@Injectable()
export class UrlCreatedConsumer {
  @MessagePattern('url.created')
  async handle(data: UrlCreatedEvent): Promise<void> {
    // Processar evento
  }
}
```

### Gerenciamento de Workspace

#### pnpm-workspace.yaml

```yaml
packages:
  - 'services/*'
  - 'packages/*'
```

#### package.json (root)

```json
{
  "name": "urls-cut-monorepo",
  "private": true,
  "workspaces": [
    "services/*",
    "packages/*"
  ],
  "scripts": {
    "dev:auth": "pnpm --filter auth-service dev",
    "dev:url": "pnpm --filter url-service dev",
    "dev:all": "pnpm -r --parallel dev",
    "build:all": "pnpm -r build",
    "test:all": "pnpm -r test"
  }
}
```

## 3. Changelog

### Formato

O projeto utiliza [Keep a Changelog](https://keepachangelog.com/) format.

### CHANGELOG.md

```markdown
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.4.0] - 2024-01-15

### Added
- Contabilização de cliques em URLs encurtadas
- Endpoint para listar estatísticas de cliques
- View `short_urls_with_stats` no banco de dados

### Changed
- Melhorada performance de queries de listagem de URLs
- Otimizado índice de cliques por data

### Fixed
- Correção na contabilização de cliques simultâneos
- Ajuste no timezone de timestamps

## [0.3.0] - 2024-01-10

### Added
- Operações CRUD para URLs (listar, editar, excluir)
- Validação de ownership em operações de modificação
- Soft delete implementado

### Changed
- Melhorada estrutura de resposta de listagem de URLs

## [0.2.0] - 2024-01-05

### Added
- Sistema de autenticação com JWT
- Endpoints de registro e login
- Guard de autenticação
- Decorator @CurrentUser()

## [0.1.0] - 2024-01-01

### Added
- Sistema básico de encurtamento de URLs
- Endpoint único para criar URLs (público e autenticado)
- Geração de código curto (máximo 6 caracteres)
- Redirecionamento com contabilização de cliques
- Schema inicial do banco de dados

[0.4.0]: https://github.com/user/urls-cut/releases/tag/v0.4.0
[0.3.0]: https://github.com/user/urls-cut/releases/tag/v0.3.0
[0.2.0]: https://github.com/user/urls-cut/releases/tag/v0.2.0
[0.1.0]: https://github.com/user/urls-cut/releases/tag/v0.1.0
```

### Git Tags

```bash
# Criar tag para release
git tag -a v0.1.0 -m "Release 0.1.0: Encurtador criado"
git tag -a v0.2.0 -m "Release 0.2.0: Autenticação"
git tag -a v0.3.0 -m "Release 0.3.0: Operações de usuário"
git tag -a v0.4.0 -m "Release 0.4.0: Contabilização de acessos"

# Push tags
git push origin --tags
```

## 4. GitHub Actions

### CI/CD Pipeline

#### .github/workflows/ci.yml

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.11.0'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run ESLint
        run: pnpm lint
      
      - name: Run Prettier check
        run: pnpm format:check

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: url_shortener_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.11.0'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run migrations
        run: pnpm migration:run
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: postgres
          DB_PASSWORD: postgres
          DB_NAME: url_shortener_test
      
      - name: Run unit tests
        run: pnpm test:unit
      
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: postgres
          DB_PASSWORD: postgres
          DB_NAME: url_shortener_test
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: postgres
          DB_PASSWORD: postgres
          DB_NAME: url_shortener_test
      
      - name: Generate coverage
        run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.11.0'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          echo "Deploy to production"
          # Adicionar comandos de deploy aqui
```

### Workflows Adicionais

#### .github/workflows/release.yml

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false
```

## 5. Código Tolerante a Falhas

### Estratégias de Resiliência

#### 1. Retry Pattern

```typescript
@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly urlRepository: Repository<ShortUrl>,
    private readonly codeGenerator: IShortCodeGenerator,
  ) {}

  async create(createUrlDto: CreateUrlDto, userId?: string): Promise<ShortUrl> {
    const maxRetries = 3;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const shortCode = this.codeGenerator.generate(createUrlDto.originalUrl);
        
        // Verificar colisão
        const existing = await this.urlRepository.findOne({
          where: { shortCode, deletedAt: IsNull() },
        });

        if (existing) {
          attempts++;
          if (attempts >= maxRetries) {
            throw new ConflictException('Não foi possível gerar código único após várias tentativas');
          }
          continue;
        }

        // Criar URL
        const shortUrl = this.urlRepository.create({
          originalUrl: createUrlDto.originalUrl,
          shortCode,
          userId: userId || null,
        });

        return await this.urlRepository.save(shortUrl);
      } catch (error) {
        if (error instanceof ConflictException) {
          throw error;
        }
        
        attempts++;
        if (attempts >= maxRetries) {
          this.logger.error('Failed to create URL after retries', error);
          throw new InternalServerErrorException('Erro ao criar URL. Tente novamente.');
        }
        
        // Exponential backoff
        await this.delay(Math.pow(2, attempts) * 100);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 2. Circuit Breaker

```typescript
@Injectable()
export class CircuitBreakerService {
  private failures = 0;
  private lastFailureTime: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly logger: Logger,
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1 minuto
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime!.getTime() > this.timeout) {
        this.state = 'HALF_OPEN';
        this.logger.log('Circuit breaker: HALF_OPEN');
      } else {
        throw new ServiceUnavailableException('Serviço temporariamente indisponível');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.logger.log('Circuit breaker: CLOSED');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.logger.warn('Circuit breaker: OPEN');
    }
  }
}

// Uso
@Injectable()
export class AuthClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async validateToken(token: string): Promise<User> {
    return this.circuitBreaker.execute(async () => {
      const response = await this.httpService.axiosRef.get(
        `${process.env.AUTH_SERVICE_URL}/validate`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        },
      );
      return response.data;
    });
  }
}
```

#### 3. Timeout

```typescript
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeout: number = 5000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException('A requisição excedeu o tempo limite');
        }
        throw err;
      }),
    );
  }
}
```

#### 4. Fallback

```typescript
@Injectable()
export class UrlService {
  async findByCode(code: string): Promise<ShortUrl> {
    try {
      return await this.urlRepository.findOne({
        where: { shortCode: code, deletedAt: IsNull() },
      });
    } catch (error) {
      this.logger.error('Database error', error);
      // Fallback: tentar cache
      return this.cacheService.get<ShortUrl>(`url:${code}`);
    }
  }
}
```

#### 5. Health Checks

```typescript
@Injectable()
export class HealthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly httpService: HttpService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const checks: HealthIndicatorResult[] = [];

    // Database check
    try {
      await this.connection.query('SELECT 1');
      checks.push({ database: { status: 'up' } });
    } catch (error) {
      checks.push({ database: { status: 'down', error: error.message } });
    }

    // External service check
    try {
      await this.httpService.axiosRef.get(
        `${process.env.AUTH_SERVICE_URL}/health`,
        { timeout: 3000 },
      );
      checks.push({ authService: { status: 'up' } });
    } catch (error) {
      checks.push({ authService: { status: 'down' } });
    }

    return {
      status: checks.every(c => Object.values(c)[0].status === 'up')
        ? 'ok'
        : 'error',
      checks: Object.assign({}, ...checks),
    };
  }
}

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.check();
  }
}
```

### Tratamento de Erros

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      // Log erro não tratado
      this.logger.error('Unhandled error', {
        error: exception.message,
        stack: exception.stack,
        path: request.url,
      });
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

### Monitoramento de Falhas

```typescript
@Injectable()
export class FailureMonitor {
  private failures: Map<string, number> = new Map();

  recordFailure(service: string): void {
    const count = this.failures.get(service) || 0;
    this.failures.set(service, count + 1);

    // Alertar se muitas falhas
    if (count + 1 > 10) {
      this.alert(service);
    }
  }

  private alert(service: string): void {
    // Enviar alerta para sistema de monitoramento
    console.warn(`High failure rate detected for ${service}`);
  }
}
```

## Referências

- [KrakenD Documentation](https://www.krakend.io/docs/)
- [Monorepo Tools](https://monorepo.tools/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Resilience Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/)

