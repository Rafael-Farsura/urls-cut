# Design Patterns e Princípios SOLID

## Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)

Cada classe tem uma única responsabilidade:

- **UserService**: Apenas operações relacionadas a usuários
- **UrlService**: Apenas operações relacionadas a URLs encurtadas
- **ClickService**: Apenas contabilização de cliques
- **AuthService**: Apenas autenticação e autorização
- **UserRepository**: Apenas acesso a dados de usuários
- **UrlRepository**: Apenas acesso a dados de URLs

### 2. Open/Closed Principle (OCP)

O sistema está aberto para extensão, fechado para modificação:

- **ShortCodeGenerator**: Interface que permite diferentes estratégias de geração
  - `HashBasedGenerator`: Gera código baseado em hash
  - `RandomGenerator`: Gera código aleatório
  - Novas estratégias podem ser adicionadas sem modificar código existente

- **Repository Pattern**: Permite trocar implementações (PostgreSQL, MySQL, MongoDB) sem alterar serviços

### 3. Liskov Substitution Principle (LSP)

Implementações podem ser substituídas por suas interfaces:

- Qualquer implementação de `IUserRepository` pode substituir outra
- Qualquer implementação de `IShortCodeGenerator` pode substituir outra
- Garante que substituições não quebrem o comportamento esperado

### 4. Interface Segregation Principle (ISP)

Interfaces específicas e focadas:

```typescript
// ❌ Ruim: Interface muito genérica
interface IRepository {
  create(data: any): any;
  update(id: string, data: any): any;
  delete(id: string): void;
  findById(id: string): any;
  findAll(): any[];
}

// ✅ Bom: Interfaces específicas
interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

interface IUrlRepository {
  create(shortUrl: ShortUrl): Promise<ShortUrl>;
  findByCode(code: string): Promise<ShortUrl | null>;
  findByUserId(userId: string): Promise<ShortUrl[]>;
  update(id: string, data: Partial<ShortUrl>): Promise<ShortUrl>;
  softDelete(id: string): Promise<void>;
}
```

### 5. Dependency Inversion Principle (DIP)

Dependências de abstrações, não de implementações:

```typescript
// ❌ Ruim: Dependência direta de implementação
@Injectable()
export class UrlService {
  private repository = new PostgresUrlRepository();
}

// ✅ Bom: Dependência de abstração (NestJS DI)
@Injectable()
export class UrlService {
  constructor(
    @Inject('IUrlRepository')
    private readonly repository: IUrlRepository,
  ) {}
}
```

**No NestJS**, a injeção de dependência é feita através do sistema de DI nativo:
```typescript
@Module({
  providers: [
    UrlService,
    {
      provide: 'IUrlRepository',
      useClass: PostgresUrlRepository,
    },
  ],
})
export class UrlsModule {}
```

## Design Patterns Detalhados

### 1. Repository Pattern

**Problema**: Lógica de acesso a dados misturada com lógica de negócio

**Solução**: Abstrair acesso a dados em interfaces

**Benefícios**:
- Facilita testes unitários (mock repositories)
- Permite trocar banco de dados sem alterar serviços
- Centraliza queries e lógica de persistência

**Implementação**:
```typescript
interface IUrlRepository {
  create(shortUrl: ShortUrl): Promise<ShortUrl>;
  findByCode(code: string): Promise<ShortUrl | null>;
  findByUserId(userId: string): Promise<ShortUrl[]>;
  update(id: string, data: Partial<ShortUrl>): Promise<ShortUrl>;
  softDelete(id: string): Promise<void>;
}

class PostgresUrlRepository implements IUrlRepository {
  // Implementação específica para PostgreSQL
}
```

### 2. Service Layer Pattern

**Problema**: Lógica de negócio espalhada em controllers

**Solução**: Camada intermediária de serviços

**Benefícios**:
- Reutilização de lógica
- Separação de concerns
- Facilita testes

**Implementação**:
```
Controller → Service → Repository → Database
```

### 3. Strategy Pattern

**Problema**: Múltiplos algoritmos para mesma operação

**Solução**: Interface comum com implementações intercambiáveis

**Aplicação**: Geração de código curto

```typescript
interface IShortCodeGenerator {
  generate(originalUrl: string): string;
}

class HashBasedGenerator implements IShortCodeGenerator {
  generate(originalUrl: string): string {
    // Gera código baseado em hash
  }
}

class RandomGenerator implements IShortCodeGenerator {
  generate(originalUrl: string): string {
    // Gera código aleatório
  }
}
```

### 4. Factory Pattern

**Problema**: Criação complexa de objetos

**Solução**: Factory para encapsular lógica de criação

**Aplicação**: Criação de entidades e DTOs

```typescript
class ShortUrlFactory {
  static create(data: CreateShortUrlDto, userId?: string): ShortUrl {
    return new ShortUrl({
      originalUrl: data.originalUrl,
      shortCode: this.generateCode(),
      userId: userId || null,
    });
  }
}
```

### 5. Module Pattern (NestJS)

**Problema**: Organização e encapsulamento de funcionalidades

**Solução**: Módulos NestJS que agrupam providers, controllers, imports

**Aplicação**: Cada feature é um módulo (AuthModule, UrlsModule, etc.)

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([ShortUrl, Click])],
  controllers: [UrlsController],
  providers: [UrlsService, UrlsRepository],
  exports: [UrlsService],
})
export class UrlsModule {}
```

### 6. Guard Pattern (NestJS)

**Problema**: Proteção de rotas e autorização

**Solução**: Guards que implementam CanActivate

**Aplicação**: Autenticação JWT, verificação de roles

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Lógica de autenticação
  }
}

// Uso
@UseGuards(JwtAuthGuard)
@Get('urls')
async listUrls() {}
```

### 7. Interceptor Pattern (NestJS)

**Problema**: Transformação de requests/responses, logging, cache

**Solução**: Interceptors que implementam NestInterceptor

**Aplicação**: Logging, transformação de respostas, cache

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Lógica de interceptação
  }
}
```

### 8. Pipe Pattern (NestJS)

**Problema**: Validação e transformação de dados

**Solução**: Pipes que implementam PipeTransform

**Aplicação**: Validação automática com class-validator

```typescript
@Post('urls')
async createUrl(@Body(ValidationPipe) createUrlDto: CreateUrlDto) {
  // DTO já validado automaticamente
}
```

### 9. Dependency Injection (NestJS Built-in)

**Problema**: Alto acoplamento entre classes

**Solução**: Sistema de DI nativo do NestJS

**Benefícios**:
- Baixo acoplamento
- Facilita testes (mocks automáticos)
- Flexibilidade

**Implementação**:
```typescript
@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly urlRepository: Repository<ShortUrl>,
    private readonly codeGenerator: IShortCodeGenerator,
    private readonly clickService: ClickService,
  ) {}
}
```

### 7. Builder Pattern (Opcional)

**Aplicação**: Construção de queries complexas

```typescript
class QueryBuilder {
  private query: string = '';
  
  select(fields: string[]): this {
    this.query += `SELECT ${fields.join(', ')}`;
    return this;
  }
  
  from(table: string): this {
    this.query += ` FROM ${table}`;
    return this;
  }
  
  where(condition: string): this {
    this.query += ` WHERE ${condition}`;
    return this;
  }
  
  build(): string {
    return this.query;
  }
}
```

## Estrutura de Diretórios (NestJS - Refletindo Patterns)

```
src/
├── modules/           # Module Pattern
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   ├── urls/
│   │   ├── urls.module.ts
│   │   ├── urls.controller.ts
│   │   ├── urls.service.ts
│   │   ├── urls.repository.ts
│   │   └── dto/
│   └── clicks/
│       ├── clicks.module.ts
│       ├── clicks.service.ts
│       └── clicks.repository.ts
├── common/            # Recursos compartilhados
│   ├── guards/        # Guard Pattern
│   │   └── jwt-auth.guard.ts
│   ├── interceptors/ # Interceptor Pattern
│   │   └── logging.interceptor.ts
│   ├── pipes/         # Pipe Pattern
│   │   └── validation.pipe.ts
│   ├── filters/       # Exception Filter
│   │   └── http-exception.filter.ts
│   ├── decorators/    # Custom Decorators
│   │   └── user.decorator.ts
│   └── strategies/    # Strategy Pattern
│       └── short-code/
│           ├── short-code-generator.interface.ts
│           ├── hash-based.generator.ts
│           └── random.generator.ts
├── config/            # Configurações
│   └── database.config.ts
└── main.ts            # Bootstrap
```

## Benefícios da Arquitetura

1. **Testabilidade**: Interfaces permitem mocks fáceis
2. **Manutenibilidade**: Código organizado e separado por responsabilidade
3. **Extensibilidade**: Novas funcionalidades sem modificar código existente
4. **Flexibilidade**: Troca de implementações sem impacto
5. **Escalabilidade**: Estrutura preparada para crescimento

