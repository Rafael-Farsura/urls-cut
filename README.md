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

Sistema REST API para encurtamento de URLs com as seguintes funcionalidades:

**Implementado (v0.5.0):**
- ✅ Estrutura base do projeto NestJS
- ✅ Configuração Docker e Docker Compose (dev e prod)
- ✅ Banco de dados PostgreSQL com TypeORM
- ✅ Entidades: User, ShortUrl, Click
- ✅ Migrações de banco de dados
- ✅ Módulo de Usuários (Repository e Service)
- ✅ Sistema de autenticação com JWT
- ✅ Endpoints de registro e login (POST /api/auth/register, POST /api/auth/login)
- ✅ Guard de autenticação global (JwtAuthGuard)
- ✅ Decorators customizados (@CurrentUser, @Public)
- ✅ Validação de entrada (ValidationPipe global)
- ✅ Soft delete (exclusão lógica)
- ✅ Auditoria (created_at, updated_at)
- ✅ Health check endpoint (/health)
- ✅ Encurtamento de URLs (máximo 6 caracteres)
- ✅ URLs podem ser criadas por usuários autenticados ou anônimos
- ✅ Usuários autenticados podem gerenciar suas URLs (CRUD completo)
- ✅ Contabilização de cliques em cada URL
- ✅ Endpoint de redirecionamento GET /:shortCode
- ✅ Testes unitários completos (59 testes, ~75% cobertura)
- ✅ Testes E2E para todas as rotas
- ✅ Coleção Postman completa

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

```
urls-cut/
├── src/
│   ├── modules/              # Módulos NestJS
│   │   ├── auth/           # Módulo de autenticação
│   │   ├── users/          # Módulo de usuários
│   │   ├── urls/           # Módulo de URLs
│   │   └── clicks/         # Módulo de cliques
│   ├── common/             # Recursos compartilhados
│   │   ├── decorators/     # Decorators customizados
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Guards (auth, roles)
│   │   ├── interceptors/   # Interceptors
│   │   ├── pipes/          # Pipes de validação
│   │   └── strategies/     # Strategy pattern
│   ├── config/             # Configurações
│   ├── database/           # Configuração TypeORM
│   └── main.ts             # Bootstrap da aplicação
├── database/
│   └── schema.sql          # Database schema
├── docs/
│   ├── ARCHITECTURE.md     # Arquitetura detalhada
│   ├── DIAGRAMS.md         # Diagramas do sistema
│   └── DESIGN_PATTERNS.md  # Design patterns aplicados
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
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

# Desenvolvimento (com hot reload)
docker-compose -f docker-compose.dev.yml up

# Ou produção
docker-compose up -d

# Execute as migrações (quando implementadas)
docker-compose exec app npm run migration:run

# Ver logs
docker-compose logs -f app
```

> **Nota**: Para desenvolvimento, use `docker-compose.dev.yml` que inclui hot reload. Para produção, use `docker-compose.yml`.

Para mais detalhes sobre Docker, consulte [README_DOCKER.md](./README_DOCKER.md).

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
API_BASE_URL=http://localhost:3000

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

> **Importante**: Nunca commite arquivos `.env` com valores reais. Use `.env.example` como template.

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

- **URL Local**: `http://localhost:3000/api-docs`
- **URL Produção**: [Link será adicionado após deploy]
- **Arquivo OpenAPI**: `docs/openapi.yaml` (será gerado automaticamente)

A documentação Swagger inclui:
- ✅ Descrição de todos os endpoints
- ✅ Schemas de requisição e resposta
- ✅ Exemplos de uso
- ✅ Códigos de status HTTP
- ✅ Autenticação JWT
- ✅ Validações aplicadas

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

O projeto inclui testes unitários, de integração e end-to-end:

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes end-to-end
npm run test:e2e

# Todos os testes
npm test

# Testes com cobertura
npm run test:coverage
```

### Estrutura de Testes

- **Unitários**: Testam serviços, repositórios e estratégias isoladamente
- **Integração**: Testam interação entre módulos
- **E2E**: Testam fluxos completos da API

### Cobertura Mínima

O projeto visa manter cobertura de testes acima de 80% para:
- Services
- Controllers
- Repositories
- Estratégias de geração de código

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
- [Funcionalidades Avançadas](./docs/ADVANCED_FEATURES.md) - API Gateway, Monorepo, CI/CD, Resiliência
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

## 🗺 Roadmap de Implementação

O roadmap completo de implementação, organizado por commits, está disponível em [commits.md](./commits.md).

O roadmap inclui:
- ✅ Ordem de implementação das funcionalidades
- ✅ Título e descrição de cada commit
- ✅ Arquivos modificados em cada etapa
- ✅ 17 fases de desenvolvimento
- ✅ ~55 commits planejados

## 📝 Licença

Este projeto é um teste técnico.

## 👤 Autor

Desenvolvido seguindo as especificações do teste técnico.

