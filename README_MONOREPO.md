# Monorepo - URL Shortener

Este projeto foi migrado para uma arquitetura de monorepo com separação de serviços e API Gateway.

## 🏗 Arquitetura

```
Cliente
  │
  ▼
┌─────────────────┐
│  API Gateway    │  ← KrakenD (Porta 8080)
│  (KrakenD)      │
└────────┬────────┘
         │
         ├──→ Auth Service (Porta 3001)
         │     - Autenticação
         │     - Gerenciamento de usuários
         │
         └──→ URL Service (Porta 3002)
               - Encurtamento de URLs
               - Gerenciamento de URLs
               - Redirecionamento
               - Contabilização de cliques
```

## 🚀 Quick Start

### Usando Docker Compose (Recomendado)

```bash
# Subir todos os serviços (PostgreSQL + Auth Service + URL Service + API Gateway)
docker-compose -f docker-compose.monorepo.yml up

# Em modo detached
docker-compose -f docker-compose.monorepo.yml up -d

# Ver logs
docker-compose -f docker-compose.monorepo.yml logs -f

# Parar serviços
docker-compose -f docker-compose.monorepo.yml down
```

### Acessar Serviços

- **API Gateway**: <http://localhost:8080>
- **Auth Service**: <http://localhost:3001>
- **URL Service**: <http://localhost:3002>
- **PostgreSQL**: localhost:5432

## 📁 Estrutura

```
urls-cut/
├── services/
│   ├── auth-service/      # Serviço de autenticação
│   └── url-service/       # Serviço de encurtamento
├── packages/
│   └── shared/            # Código compartilhado
├── gateway/
│   └── krakend/           # Configuração KrakenD
└── docker-compose.monorepo.yml
```

## 🔧 Desenvolvimento

### Desenvolvimento Local (sem Docker)

```bash
# Terminal 1: Auth Service
cd services/auth-service
npm install
npm run dev

# Terminal 2: URL Service
cd services/url-service
npm install
npm run dev

# Terminal 3: API Gateway
docker run -d -p 8080:8080 \
  -v $(pwd)/gateway/krakend:/etc/krakend \
  devopsfaith/krakend:latest \
  /usr/bin/krakend run -c /etc/krakend/krakend.json -d
```

## 🔐 Autenticação

O API Gateway valida JWT automaticamente para endpoints protegidos. Para endpoints públicos (POST /api/urls, GET /:shortCode), o gateway não valida JWT.

## 📊 Health Checks

- **API Gateway**: <http://localhost:8080/health>
- **Auth Service**: <http://localhost:3001/health>
- **URL Service**: <http://localhost:3002/health>

## ✅ Status da Migração

O código foi migrado com sucesso para os serviços:

- ✅ `src/modules/auth/` → `services/auth-service/src/modules/auth/`
- ✅ `src/modules/users/` → `services/auth-service/src/modules/users/`
- ✅ `src/modules/urls/` → `services/url-service/src/modules/urls/`
- ✅ `src/modules/clicks/` → `services/url-service/src/modules/clicks/`
- ✅ Código compartilhado organizado em `packages/shared/`

> **Nota**: O código em `src/` ainda existe para referência, mas o sistema principal está nos serviços do monorepo.

## 📝 Variáveis de Ambiente

Criar `.env` na raiz do projeto:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=url_shortener
DB_PORT=5432

# JWT (deve ser o mesmo em ambos os serviços)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Services
NODE_ENV=development
ENABLE_LOGGING=true
LOG_LEVEL=info
```

## 🧪 Testes

```bash
# Testes do Auth Service
cd services/auth-service
npm test

# Testes do URL Service
cd services/url-service
npm test
```

## 📚 Documentação

- [MONOREPO_MIGRATION.md](./MONOREPO_MIGRATION.md) - Guia de migração
- [docs/ADVANCED_FEATURES.md](./docs/ADVANCED_FEATURES.md) - Funcionalidades avançadas

## ✅ Status

O monorepo está **completamente implementado e funcional**. Todos os serviços estão operacionais e o API Gateway está configurado corretamente.
