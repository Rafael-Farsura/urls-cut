# Diagramas do Sistema

## 1. Diagrama de Classes

```mermaid
classDiagram
    class User {
        +string id
        +string email
        +string passwordHash
        +DateTime createdAt
        +DateTime updatedAt
        +DateTime deletedAt
    }
    
    class ShortUrl {
        +string id
        +string originalUrl
        +string shortCode
        +string userId
        +DateTime createdAt
        +DateTime updatedAt
        +DateTime deletedAt
        +User user
        +Click[] clicks
    }
    
    class Click {
        +string id
        +string shortUrlId
        +string ipAddress
        +string userAgent
        +DateTime clickedAt
        +ShortUrl shortUrl
    }
    
    class AuthModule {
        +controllers: AuthController[]
        +providers: AuthService[]
        +imports: UsersModule[]
    }
    
    class UrlsModule {
        +controllers: UrlsController[]
        +providers: UrlsService[]
        +imports: TypeOrmModule[]
    }
    
    class UserService {
        <<@Injectable()>>
        -IUserRepository userRepository
        -IAuthService authService
        +createUser(email, password) User
        +authenticate(email, password) string
    }
    
    class UrlService {
        <<@Injectable()>>
        -IUrlRepository urlRepository
        -IShortCodeGenerator codeGenerator
        +createShortUrl(originalUrl, userId?) ShortUrl
        +getShortUrlByCode(code) ShortUrl
        +updateShortUrl(id, originalUrl, userId) ShortUrl
        +deleteShortUrl(id, userId) void
        +listUserUrls(userId) ShortUrl[]
    }
    
    class JwtAuthGuard {
        <<@Injectable()>>
        +canActivate(context) boolean
    }
    
    class ValidationPipe {
        <<@Injectable()>>
        +transform(value, metadata) any
    }
    
    class ClickService {
        -IClickRepository clickRepository
        +recordClick(shortUrlId, ipAddress, userAgent) Click
        +getClickCount(shortUrlId) number
    }
    
    class AuthService {
        -IUserRepository userRepository
        +hashPassword(password) string
        +verifyPassword(password, hash) boolean
        +generateToken(userId) string
        +verifyToken(token) object
    }
    
    class IUserRepository {
        <<interface>>
        +create(user) User
        +findByEmail(email) User
        +findById(id) User
    }
    
    class IUrlRepository {
        <<interface>>
        +create(shortUrl) ShortUrl
        +findByCode(code) ShortUrl
        +findByUserId(userId) ShortUrl[]
        +update(id, data) ShortUrl
        +softDelete(id) void
    }
    
    class IClickRepository {
        <<interface>>
        +create(click) Click
        +countByShortUrlId(shortUrlId) number
    }
    
    class ShortCodeGenerator {
        <<abstract>>
        +generate(originalUrl) string
    }
    
    class HashBasedGenerator {
        +generate(originalUrl) string
    }
    
    class RandomGenerator {
        +generate(originalUrl) string
    }
    
    User "1" -- "*" ShortUrl : owns
    ShortUrl "1" -- "*" Click : has
    AuthModule --> AuthController : contains
    AuthModule --> AuthService : contains
    UrlsModule --> UrlsController : contains
    UrlsModule --> UrlService : contains
    
    UserService --> IUserRepository : uses
    UserService --> AuthService : uses
    UrlService --> IUrlRepository : uses
    UrlService --> ShortCodeGenerator : uses
    ClickService --> IClickRepository : uses
    AuthService --> IUserRepository : uses
    
    UrlsController --> JwtAuthGuard : uses
    UrlsController --> ValidationPipe : uses
    
    ShortCodeGenerator <|-- HashBasedGenerator
    ShortCodeGenerator <|-- RandomGenerator
```

## 2. Diagrama de Sequência - Criar URL Encurtado (NestJS)

```mermaid
sequenceDiagram
    participant Client
    participant NestRouter
    participant Guard
    participant ValidationPipe
    participant UrlsController
    participant UrlsService
    participant CodeGenerator
    participant UrlsRepository
    participant Database
    
    Client->>NestRouter: POST /api/urls (originalUrl, token?)
    NestRouter->>Guard: Check authentication (optional)
    Guard-->>NestRouter: Allow (public route)
    NestRouter->>ValidationPipe: Validate CreateUrlDto
    ValidationPipe-->>NestRouter: Validated DTO
    NestRouter->>UrlsController: create(createUrlDto, @CurrentUser())
    UrlsController->>UrlsService: create(originalUrl, userId?)
    UrlsService->>CodeGenerator: generate(originalUrl)
    CodeGenerator-->>UrlsService: shortCode
    UrlsService->>UrlsRepository: findOne({ code: shortCode })
    UrlsRepository->>Database: SELECT WHERE code = shortCode
    Database-->>UrlsRepository: null (not found)
    UrlsRepository-->>UrlsService: null
    UrlsService->>UrlsService: Create ShortUrl entity
    UrlsService->>UrlsRepository: save(shortUrl)
    UrlsRepository->>Database: INSERT INTO short_urls
    Database-->>UrlsRepository: created entity
    UrlsRepository-->>UrlsService: ShortUrl
    UrlsService-->>UrlsController: ShortUrl
    UrlsController-->>Client: 201 { shortUrl, originalUrl }
```

## 3. Diagrama de Sequência - Redirecionar URL (NestJS)

```mermaid
sequenceDiagram
    participant Client
    participant NestRouter
    participant Guard
    participant RedirectController
    participant UrlsService
    participant ClicksService
    participant UrlsRepository
    participant ClicksRepository
    participant Database
    
    Client->>NestRouter: GET /:shortCode
    NestRouter->>Guard: Check authentication
    Guard-->>NestRouter: Allow (public route)
    NestRouter->>RedirectController: redirect(shortCode)
    RedirectController->>UrlsService: findByCode(shortCode)
    UrlsService->>UrlsRepository: findOne({ code, deletedAt: null })
    UrlsRepository->>Database: SELECT WHERE code = ? AND deleted_at IS NULL
    Database-->>UrlsRepository: ShortUrl
    UrlsRepository-->>UrlsService: ShortUrl
    UrlsService-->>RedirectController: ShortUrl
    
    RedirectController->>ClicksService: recordClick(shortUrlId, ip, userAgent)
    ClicksService->>ClicksService: Create Click entity
    ClicksService->>ClicksRepository: save(click)
    ClicksRepository->>Database: INSERT INTO clicks
    Database-->>ClicksRepository: Click
    ClicksRepository-->>ClicksService: Click
    ClicksService-->>RedirectController: success
    
    RedirectController->>Client: 302 Redirect to originalUrl
```

## 4. Diagrama de Sequência - Autenticação (NestJS)

```mermaid
sequenceDiagram
    participant Client
    participant NestRouter
    participant ValidationPipe
    participant AuthController
    participant AuthService
    participant UsersService
    participant UsersRepository
    participant JwtService
    participant Database
    
    Client->>NestRouter: POST /api/auth/login (email, password)
    NestRouter->>ValidationPipe: Validate LoginDto
    ValidationPipe-->>NestRouter: Validated DTO
    NestRouter->>AuthController: login(loginDto)
    AuthController->>AuthService: validateUser(email, password)
    AuthService->>UsersService: findByEmail(email)
    UsersService->>UsersRepository: findOne({ email, deletedAt: null })
    UsersRepository->>Database: SELECT WHERE email = ? AND deleted_at IS NULL
    Database-->>UsersRepository: User
    UsersRepository-->>UsersService: User
    UsersService-->>AuthService: User
    
    AuthService->>AuthService: verifyPassword(password, user.passwordHash)
    
    alt Password valid
        AuthService->>JwtService: sign({ userId })
        JwtService-->>AuthService: access_token
        AuthService-->>AuthController: { access_token }
        AuthController-->>Client: 200 { access_token }
    else Password invalid
        AuthService-->>AuthController: throw UnauthorizedException
        AuthController-->>Client: 401 Unauthorized
    end
```

## 5. Diagrama de Fluxo - Processo de Encurtamento

```mermaid
flowchart TD
    Start([Cliente envia URL]) --> Validate{Validar URL}
    Validate -->|Inválido| Error1([Retornar erro 400])
    Validate -->|Válido| CheckAuth{Usuário autenticado?}
    
    CheckAuth -->|Sim| ExtractUserId[Extrair userId do token]
    CheckAuth -->|Não| SetUserIdNull[userId = null]
    
    ExtractUserId --> GenerateCode[Gerar código curto]
    SetUserIdNull --> GenerateCode
    
    GenerateCode --> CheckExists{Code já existe?}
    CheckExists -->|Sim| GenerateCode
    CheckExists -->|Não| CreateRecord[Criar registro no banco]
    
    CreateRecord --> ReturnSuccess([Retornar URL encurtado])
    ReturnSuccess --> End([Fim])
    Error1 --> End
```

## 6. Diagrama de Fluxo - Processo de Redirecionamento

```mermaid
flowchart TD
    Start([Cliente acessa /:shortCode]) --> GetUrl[Buscar URL por código]
    GetUrl --> CheckExists{URL existe?}
    
    CheckExists -->|Não| Error404([Retornar 404])
    CheckExists -->|Sim| CheckDeleted{URL deletado?}
    
    CheckDeleted -->|Sim| Error404
    CheckDeleted -->|Não| RecordClick[Registrar clique]
    
    RecordClick --> GetOriginalUrl[Obter URL original]
    GetOriginalUrl --> Redirect([Redirecionar 302])
    Redirect --> End([Fim])
    Error404 --> End
```

## 7. Diagrama de Relacionamento de Entidades

```mermaid
erDiagram
    USERS ||--o{ SHORT_URLS : "owns"
    SHORT_URLS ||--o{ CLICKS : "has"
    
    USERS {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    SHORT_URLS {
        uuid id PK
        string original_url
        string short_code UK
        uuid user_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    CLICKS {
        uuid id PK
        uuid short_url_id FK
        string ip_address
        string user_agent
        timestamp clicked_at
    }
```

## 8. Diagrama de Componentes (NestJS)

```mermaid
graph TB
    subgraph "Modules Layer"
        AM[AuthModule]
        UM[UrlsModule]
        CM[ClicksModule]
    end
    
    subgraph "Controller Layer"
        AC[AuthController]
        UC[UrlsController]
        RC[RedirectController]
    end
    
    subgraph "Guard & Pipe Layer"
        JG[JwtAuthGuard]
        VP[ValidationPipe]
    end
    
    subgraph "Service Layer"
        US[UsersService]
        URLS[UrlsService]
        CS[ClicksService]
        AS[AuthService]
    end
    
    subgraph "Repository Layer"
        UR[UsersRepository]
        URLR[UrlsRepository]
        CR[ClicksRepository]
    end
    
    subgraph "Infrastructure"
        DB[(PostgreSQL)]
        JWT[JwtService]
        TO[TypeORM]
        LOG[Logger]
    end
    
    AM --> AC
    UM --> UC
    UM --> RC
    
    AC --> JG
    UC --> JG
    AC --> VP
    UC --> VP
    
    AC --> AS
    AC --> US
    UC --> URLS
    RC --> URLS
    RC --> CS
    
    US --> UR
    URLS --> URLR
    CS --> CR
    AS --> UR
    AS --> JWT
    
    UR --> TO
    URLR --> TO
    CR --> TO
    TO --> DB
    
    AC --> LOG
    UC --> LOG
    RC --> LOG
```

