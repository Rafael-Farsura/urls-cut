# URL Shortener API

Sistema de encurtamento de URLs construído com Node.js, seguindo os princípios SOLID e padrões de design adequados para escalabilidade vertical.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Documentação da API](#documentação-da-api)
- [Testes](#testes)
- [Arquitetura](#arquitetura)
- [Design Patterns](#design-patterns)
- [Escalabilidade Horizontal](#escalabilidade-horizontal)

## 🎯 Sobre o Projeto

Sistema REST API para encurtamento de URLs construído com **arquitetura de monorepo** e **API Gateway**, seguindo os princípios SOLID e padrões de design adequados para escalabilidade vertical.

**Implementado (v0.8.0 - Monorepo):**

- ✅ **Monorepo com separação de serviços**
  - Auth Service (porta 3001) - Autenticação e gerenciamento de usuários
  - URL Service (porta 3002) - Encurtamento e gerenciamento de URLs
  - Pacote shared - Código compartilhado entre serviços
- ✅ **API Gateway KrakenD** (porta 8080)
  - Roteamento para auth-service e url-service
  - Validação de JWT com secret key (HS256)
  - Rate limiting por endpoint configurado
  - Health checks agregados
- ✅ Estrutura base do projeto NestJS
- ✅ Configuração Docker e Docker Compose (dev, prod e monorepo)
- ✅ Banco de dados PostgreSQL com TypeORM
- ✅ Entidades: User, ShortUrl, Click
- ✅ Migrações de banco de dados
- ✅ Módulo de Usuários (Repository e Service)
- ✅ Sistema de autenticação com JWT
- ✅ Endpoints de registro e login (POST /api/auth/register, POST /api/auth/login)
- ✅ Guard de autenticação global (JwtAuthGuard)
- ✅ Decorators customizados (@CurrentUser, @Public)
- ✅ Validação de entrada (ValidationPipe global)
- ✅ HttpExceptionFilter global para tratamento de erros
- ✅ Soft delete (exclusão lógica)
- ✅ Auditoria (created_at, updated_at)
- ✅ Health check endpoint (/health) com verificação de DB e memória
- ✅ Encurtamento de URLs (máximo 6 caracteres)
- ✅ URLs podem ser criadas por usuários autenticados ou anônimos
- ✅ Usuários autenticados podem gerenciar suas URLs (CRUD completo)
- ✅ Contabilização de cliques em cada URL
- ✅ Endpoint de redirecionamento GET /:shortCode
- ✅ LoggingInterceptor para observabilidade
- ✅ Métricas Prometheus (GET /metrics)
- ✅ Documentação Swagger/OpenAPI (GET /api-docs)
- ✅ Testes unitários completos (99 testes, ~85% cobertura)
- ✅ Testes E2E para todas as rotas
- ✅ Coleção Postman completa
- ✅ **Circuit Breaker** para tolerância a falhas
- ✅ **Retry Service** com exponential backoff
- ✅ **Timeout Interceptor** para requisições
- ✅ **Rate Limiting** com ThrottlerModule
- ✅ **GitHub Actions** workflows (CI/CD e Release)
- ✅ **Changelog** completo seguindo Keep a Changelog
- ✅ **Git Tags** de versão (v0.1.0 até v0.8.0)

## 🛠 Tecnologias

- **Node.js** (LTS - versão 20.11.0 ou superior)
- **TypeScript**
- **NestJS** (Framework)
- **PostgreSQL**
- **TypeORM** (ORM integrado ao NestJS)
- **JWT** (@nestjs/jwt)
- **class-validator** e **class-transformer** (validação)
- **Jest** (testes)
- **Swagger/OpenAPI** (@nestjs/swagger)

## 📁 Estrutura do Projeto

O projeto utiliza **arquitetura de monorepo** com separação de serviços:

```
urls-cut/
├── services/                    # Serviços do monorepo
│   ├── auth-service/          # Serviço de autenticação (porta 3001)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/      # Autenticação
│   │   │   │   └── users/     # Usuários
│   │   │   ├── common/        # Recursos compartilhados
│   │   │   └── config/        # Configurações
│   │   ├── Dockerfile
│   │   └── package.json
│   └── url-service/           # Serviço de URLs (porta 3002)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── urls/      # URLs
│       │   │   └── clicks/    # Cliques
│       │   ├── common/
│       │   └── config/
│       ├── Dockerfile
│       └── package.json
├── packages/                   # Pacotes compartilhados
│   └── shared/                # Código compartilhado entre serviços
│       └── src/
│           ├── common/        # Recursos compartilhados
│           │   ├── decorators/ # @Public(), @CurrentUser()
│           │   ├── guards/     # JwtAuthGuard
│           │   ├── interceptors/ # LoggingInterceptor, MetricsInterceptor, TimeoutInterceptor
│           │   ├── filters/     # HttpExceptionFilter
│           │   ├── services/    # CircuitBreakerService, RetryService
│           │   └── strategies/  # Short-code generators
│           ├── config/        # Configurações compartilhadas
│           └── index.ts       # Exports principais (@urls-cut/shared)
├── gateway/                    # API Gateway
│   └── krakend/               # Configuração KrakenD
│       └── krakend.json
├── database/
│   └── schema.sql             # Database schema
├── docs/                       # Documentação completa
│   ├── ARCHITECTURE.md
│   ├── DIAGRAMS.md
│   ├── DESIGN_PATTERNS.md
│   └── ...
├── test/                       # Testes E2E
├── scripts/                    # Scripts de teste e automação
├── docker-compose.yml # Docker Compose do monorepo (obrigatório)
├── .env.example
└── README.md
```


## 📋 Pré-requisitos

- **Node.js** 20.11.0 LTS ou superior ([Download](https://nodejs.org/))
- **PostgreSQL** 14 ou superior
- **Docker** e **Docker Compose** (opcional, para ambiente completo)
- **npm** 10.x ou **yarn** 1.22+

> **Nota**: O projeto foi testado com Node.js 20.11.0 LTS. Versões anteriores podem apresentar incompatibilidades.

## 🚀 Instalação

### Opção 1: Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone <repository-url>
cd urls-cut

# Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# Edite o .env com suas configurações (opcional para desenvolvimento)

# Subir todos os serviços (PostgreSQL + Auth Service + URL Service + API Gateway)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

**Acessar Serviços:**
- **API Gateway**: http://localhost:8080 (ponto único de entrada)
- **Auth Service**: http://localhost:3001 (acesso direto)
- **URL Service**: http://localhost:3002 (acesso direto)
- **PostgreSQL**: localhost:5432

> **Recomendado**: Use o API Gateway (porta 8080) para todas as requisições. Os serviços individuais (3001, 3002) são para desenvolvimento/debug.

### Opção 2: Instalação Local

```bash
# Clone o repositório
git clone <repository-url>
cd urls-cut

# Instale as dependências
npm install

# Configure o banco de dados PostgreSQL
# Crie um banco de dados chamado 'url_shortener'

# Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Execute as migrações
npm run migration:run

# Inicie o servidor
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Server
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:8080  # URL do API Gateway

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=url_shortener

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Application
SHORT_CODE_LENGTH=6
SHORT_CODE_STRATEGY=hash # hash ou random

# Observability (Opcional)
ENABLE_LOGGING=true
ENABLE_METRICS=false
ENABLE_TRACING=false

# External Services (Opcional)
# SENTRY_DSN=
# DATADOG_API_KEY=
# ELASTIC_APM_SERVER_URL=

# Resilience (Opcional)
# CIRCUIT_BREAKER_THRESHOLD=5
# CIRCUIT_BREAKER_TIMEOUT=60000
# RETRY_MAX_ATTEMPTS=3
# RETRY_INITIAL_DELAY=100
# RETRY_MAX_DELAY=5000
# RETRY_FACTOR=2
# REQUEST_TIMEOUT=30000

# Rate Limiting (Opcional)
# THROTTLE_TTL=60
# THROTTLE_LIMIT=100
```

### O que deve ser variável de ambiente?

**Obrigatórias:**

- `NODE_ENV`: Ambiente de execução
- `PORT`: Porta do servidor
- `DB_*`: Configurações do banco de dados
- `JWT_SECRET`: Chave secreta para JWT
- `API_BASE_URL`: URL base da API

**Opcionais mas Recomendadas:**

- `JWT_EXPIRES_IN`: Tempo de expiração do token
- `SHORT_CODE_LENGTH`: Tamanho do código curto
- `SHORT_CODE_STRATEGY`: Estratégia de geração

**Opcionais (Observabilidade):**

- `ENABLE_LOGGING`, `ENABLE_METRICS`, `ENABLE_TRACING`: Ativam/desativam recursos de observabilidade
- Credenciais de serviços externos (Sentry, Datadog, Elastic APM, Prometheus, etc.)

**Opcionais (Resiliência):**

- `CIRCUIT_BREAKER_THRESHOLD`: Número de falhas antes de abrir o circuit (padrão: 5)
- `CIRCUIT_BREAKER_TIMEOUT`: Tempo em ms antes de tentar recuperação (padrão: 60000)
- `RETRY_MAX_ATTEMPTS`: Máximo de tentativas de retry (padrão: 3)
- `RETRY_INITIAL_DELAY`: Delay inicial em ms para retry (padrão: 100)
- `RETRY_MAX_DELAY`: Delay máximo em ms para retry (padrão: 5000)
- `RETRY_FACTOR`: Fator de multiplicação para exponential backoff (padrão: 2)
- `REQUEST_TIMEOUT`: Timeout em ms para requisições (padrão: 30000)

**Opcionais (Rate Limiting):**

- `THROTTLE_TTL`: Janela de tempo em segundos (padrão: 60)
- `THROTTLE_LIMIT`: Número máximo de requisições por janela (padrão: 100)

### Configuração de Observabilidade

#### Logs

Para habilitar logging estruturado:

```env
ENABLE_LOGGING=true
LOG_LEVEL=info  # error, warn, info, debug
```

#### Métricas

Para habilitar métricas (Prometheus):

```env
ENABLE_METRICS=true
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
```

#### Rastreamento (Tracing)

Para habilitar tracing com OpenTelemetry/Jaeger:

```env
ENABLE_TRACING=true
ELASTIC_APM_SERVER_URL=http://localhost:8200
# ou
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
```

#### Serviços Externos

**Sentry (Error Tracking):**

```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENABLED=true
```

**Datadog (APM):**

```env
DATADOG_API_KEY=your-api-key
DATADOG_ENABLED=true
DATADOG_SERVICE=url-shortener
```

**Elastic APM:**

```env
ELASTIC_APM_SERVER_URL=http://localhost:8200
ELASTIC_APM_ENABLED=true
ELASTIC_APM_SERVICE_NAME=url-shortener
```

> **Importante**: Configure as credenciais dos serviços externos apenas em produção. Em desenvolvimento, deixe as variáveis comentadas ou desabilite os serviços.

### O que NÃO deve ser variável de ambiente?

- Valores hardcoded de configuração da aplicação
- Constantes de negócio (ex: tamanho máximo de URL)
- Código de lógica de negócio
- Secrets em código (usar variáveis de ambiente ou secret managers)

> **Importante**: 
> - ⚠️ Nunca commite arquivos `.env` com valores reais. Use `.env.example` como template.
> - ⚠️ **CRÍTICO**: Em produção, `JWT_SECRET` deve ser obrigatório e seguro. Gere um secret seguro: `openssl rand -base64 32`
> - ⚠️ Não use secrets hardcoded em produção. Sempre defina variáveis de ambiente.

## 🏃 Executando o Projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start

# Testes
npm test

# Testes com cobertura
npm run test:coverage
```

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger/OpenAPI:

**Monorepo (API Gateway):**
- **URL Local**: `http://localhost:8080/api-docs` (via API Gateway)
- **Auth Service**: `http://localhost:3001/api-docs`
- **URL Service**: `http://localhost:3002/api-docs`
- **URL Produção**: [Link será adicionado após deploy]

A documentação Swagger inclui:

- ✅ Descrição de todos os endpoints
- ✅ Schemas de requisição e resposta
- ✅ Exemplos de uso
- ✅ Códigos de status HTTP
- ✅ Autenticação JWT (Bearer Token)
- ✅ Validações aplicadas
- ✅ Tags organizadas (auth, urls, health, metrics)
- ✅ Teste interativo de endpoints

### Endpoints Principais

#### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Retorna: `{ "access_token": "jwt_token", "user": { "id": "...", "email": "..." } }`
- `POST /api/auth/login` - Login (retorna Bearer Token)
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Retorna: `{ "access_token": "jwt_token", "user": { "id": "...", "email": "..." } }`

#### URLs

- `POST /api/urls` - Criar URL encurtado (público ou autenticado)
  - Body: `{ "originalUrl": "https://example.com" }`
  - Retorna: `{ "id": "...", "originalUrl": "...", "shortUrl": "...", "shortCode": "...", "userId": "..." | null }`
- `GET /api/urls` - Listar URLs do usuário com contagem de cliques (autenticado)
  - Retorna: `{ "urls": [...], "total": 1 }` (cada URL inclui `clickCount`)
- `PUT /api/urls/:id` - Atualizar URL (autenticado, requer ownership)
  - Body: `{ "originalUrl": "https://new-url.com" }`
- `DELETE /api/urls/:id` - Deletar URL (autenticado, requer ownership)

#### Redirecionamento

- `GET /:shortCode` - Redirecionar para URL original

## 🧪 Testes

O projeto inclui testes unitários, de integração e end-to-end completos:

```bash
# Testes unitários
npm run test:unit

# Testes unitários em modo watch
npm run test:unit:watch

# Testes end-to-end
npm run test:e2e

# Testes end-to-end em modo watch
npm run test:e2e:watch

# Todos os testes (unit + E2E)
npm run test:all

# Testes com cobertura
npm run test:cov

# Executar como no CI (lint + testes + cobertura)
npm run test:ci
```

### Estrutura de Testes

- **Unitários**: Testam serviços, repositórios, guards, interceptors e estratégias isoladamente
  - Localização: `services/*/src/**/__tests__/*.spec.ts` e `packages/shared/src/**/__tests__/*.spec.ts`
  - **15 arquivos de teste**, **99 testes passando**
  - Cobertura: > 90% para services, > 85% para controllers
- **E2E**: Testam fluxos completos da API com banco de dados real
  - Localização: `test/*.e2e-spec.ts`
  - **4 arquivos de teste** cobrindo: autenticação, URLs, redirecionamento, resiliência

### Cobertura de Testes

**Status Atual:**
- ✅ **99 testes unitários** passando
- ✅ **Cobertura: ~85%** (Services: 92-100%, Controllers: 100%, Guards: 100%, Interceptors: 100%)
- ✅ Testes E2E completos para todas as rotas
- ✅ Testes de resiliência (Circuit Breaker, Retry, Timeout, Health)

**Cobertura por Módulo:**
- Services: > 90% ✅
- Controllers: > 85% ✅
- Guards: > 80% ✅
- Interceptors: > 80% ✅
- Filters: > 80% ✅
- Repositories: > 85% ✅

### Documentação de Testes

Para guia completo sobre testes, consulte [docs/TESTING.md](./docs/TESTING.md).

## 🏗 Arquitetura

O projeto segue a arquitetura modular do NestJS:

```
Modules → Controllers → Services → Repositories → Database
```

Cada módulo encapsula:

- **Controllers**: Handlers HTTP com decorators
- **Services**: Lógica de negócio
- **Repositories**: Acesso a dados (TypeORM)
- **DTOs**: Validação com class-validator
- **Entities**: Entidades TypeORM

### Princípios SOLID

- ✅ **S**ingle Responsibility: Cada classe tem uma única responsabilidade
- ✅ **O**pen/Closed: Aberto para extensão, fechado para modificação
- ✅ **L**iskov Substitution: Implementações substituíveis
- ✅ **I**nterface Segregation: Interfaces específicas
- ✅ **D**ependency Inversion: Dependências de abstrações

### Design Patterns

- **Repository Pattern**: Abstração de acesso a dados
- **Service Layer**: Lógica de negócio centralizada
- **Strategy Pattern**: Geração de código curto intercambiável
- **Factory Pattern**: Criação de entidades
- **Middleware Pattern**: Pipeline de processamento
- **Dependency Injection**: Inversão de controle

Para mais detalhes, consulte:

- [Arquitetura](./docs/ARCHITECTURE.md)
- [Design Patterns](./docs/DESIGN_PATTERNS.md)
- [Diagramas](./docs/DIAGRAMS.md)
- [Observabilidade](./docs/OBSERVABILITY.md)
- [Validação de Entrada](./docs/VALIDATION.md)
- [Checklist de Requisitos](./docs/REQUIREMENTS_CHECKLIST.md)

## 📊 Escalabilidade Horizontal

### Pontos de Melhoria para Escala Horizontal

1. **Banco de Dados**
   - Implementar read replicas para distribuir leituras
   - Sharding por user_id ou short_code
   - Cache distribuído (Redis) para URLs mais acessadas

2. **Geração de Código Curto**
   - Usar sequenciadores distribuídos (Snowflake ID, etc.)
   - Pré-gerar códigos em pool para evitar colisões
   - Implementar retry logic para colisões

3. **Sessões e Autenticação**
   - Token stateless (JWT) já implementado ✅
   - Considerar refresh tokens com Redis

4. **Contabilização de Cliques**
   - Processamento assíncrono (fila de mensagens)
   - Batch inserts para melhor performance
   - Agregação periódica em tabela de estatísticas

5. **API Gateway e Load Balancing**
   - Implementar API Gateway (Kong, KrakenD)
   - Load balancer com sticky sessions (se necessário)
   - Rate limiting distribuído

6. **Cache**
   - Cache de URLs mais acessadas (Redis)
   - Cache de estatísticas de cliques
   - CDN para assets estáticos

### Maiores Desafios

1. **Consistência de Dados**
   - Garantir unicidade de short_code em ambiente distribuído
   - Sincronização de contadores de cliques

2. **Performance de Leitura**
   - URLs mais acessadas precisam de cache agressivo
   - Otimização de queries com índices adequados

3. **Disponibilidade**
   - Redundância de serviços
   - Health checks e circuit breakers
   - Failover automático

4. **Monitoramento**
   - Observabilidade distribuída (tracing, métricas)
   - Alertas proativos
   - Logs centralizados

## 🚀 Deploy

O sistema está disponível em produção:

- **URL da API**: [Link será adicionado após deploy]
- **Swagger/OpenAPI**: [Link será adicionado após deploy]

### Informações de Deploy

- **Cloud Provider**: [A definir]
- **Ambiente**: Produção
- **Status**: [Em desenvolvimento]

> **Nota**: O link de produção será atualizado após o deploy ser realizado.

## 📝 Changelog

Todas as mudanças do projeto são documentadas no [CHANGELOG.md](./CHANGELOG.md).

O projeto segue versionamento semântico:

- **0.1.0**: Encurtador criado
- **0.2.0**: Autenticação
- **0.3.0**: Operações de usuário no encurtador
- **0.4.0**: Contabilização de acessos
- **0.5.0**: Redirecionamento e testes completos
- **0.6.0**: Observabilidade e Swagger
- **0.7.0**: Resiliência e CI/CD
- **0.7.1**: Correções de testes e melhorias
- **0.8.0**: Monorepo e API Gateway


## 📝 Licença

Este projeto é um teste técnico.

## 👤 Autor

Rafael Farsura

Desenvolvido seguindo as especificações do teste técnico.
