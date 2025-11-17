# Migração para Monorepo - Guia de Implementação

Este documento descreve a estrutura do monorepo e como migrar o código existente.

## Estrutura do Monorepo

```
urls-cut/
├── services/
│   ├── auth-service/          # Serviço de Autenticação
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/      # Módulo de autenticação
│   │   │   │   └── users/     # Módulo de usuários
│   │   │   ├── config/        # Configurações
│   │   │   ├── database/      # Configuração TypeORM
│   │   │   └── main.ts        # Bootstrap
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── Dockerfile
│   └── url-service/           # Serviço de Encurtamento
│       ├── src/
│       │   ├── modules/
│       │   │   ├── urls/      # Módulo de URLs
│       │   │   └── clicks/    # Módulo de cliques
│       │   ├── common/        # Recursos compartilhados do serviço
│       │   ├── config/
│       │   ├── database/
│       │   └── main.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       └── Dockerfile
├── packages/
│   └── shared/                # Código compartilhado
│       ├── src/
│       │   ├── types/         # Tipos compartilhados
│       │   ├── utils/         # Utilitários
│       │   └── constants/     # Constantes
│       ├── package.json
│       └── tsconfig.json
├── gateway/
│   └── krakend/               # Configuração do API Gateway
│       └── krakend.json
└── docker-compose.monorepo.yml
```

## Serviços

### Auth Service (Porta 3001)
- **Responsabilidades:**
  - Autenticação (register, login)
  - Gerenciamento de usuários
  - Geração e validação de JWT
  - Health check

- **Endpoints:**
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /health
  - GET /.well-known/jwks.json (para validação de JWT no gateway)

### URL Service (Porta 3002)
- **Responsabilidades:**
  - Encurtamento de URLs
  - Gerenciamento de URLs (CRUD)
  - Redirecionamento
  - Contabilização de cliques
  - Health check

- **Endpoints:**
  - POST /api/urls
  - GET /api/urls
  - PUT /api/urls/:id
  - DELETE /api/urls/:id
  - GET /:shortCode
  - GET /health

## API Gateway (KrakenD) - Porta 8080

O KrakenD atua como ponto único de entrada:
- Roteamento para serviços
- Validação de JWT (para endpoints protegidos)
- Rate limiting
- Load balancing (futuro)

## Comunicação entre Serviços

### Síncrona (HTTP)
- URL Service → Auth Service: Validação de token (opcional, pode usar JWT direto)

### Assíncrona (Futuro)
- Message Queue para eventos (ex: URL criada, clique registrado)

## Como Usar

### Desenvolvimento Local

```bash
# Subir todos os serviços
docker-compose -f docker-compose.monorepo.yml up

# Ou apenas serviços específicos
docker-compose -f docker-compose.monorepo.yml up auth-service url-service
```

### Produção

```bash
docker-compose -f docker-compose.monorepo.yml up -d
```

## Variáveis de Ambiente

Cada serviço precisa das seguintes variáveis:

### Auth Service
- `PORT=3001`
- `DB_HOST=postgres`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### URL Service
- `PORT=3002`
- `DB_HOST=postgres`
- `JWT_SECRET` (mesmo do auth-service)
- `AUTH_SERVICE_URL=http://auth-service:3001`
- `SHORT_CODE_LENGTH`
- `SHORT_CODE_STRATEGY`

## Próximos Passos

1. Copiar código existente para serviços
2. Criar pacote shared com tipos e utilitários
3. Configurar comunicação entre serviços
4. Atualizar testes
5. Atualizar documentação

