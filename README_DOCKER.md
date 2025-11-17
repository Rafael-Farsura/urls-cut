# Docker Setup - URL Shortener

## Quick Start

### Monorepo (Recomendado)

```bash
# Subir todos os serviços (PostgreSQL + Auth Service + URL Service + API Gateway)
docker-compose -f docker-compose.monorepo.yml up -d

# Ver logs
docker-compose -f docker-compose.monorepo.yml logs -f

# Parar serviços
docker-compose -f docker-compose.monorepo.yml down
```

**Acessar:**
- **API Gateway**: http://localhost:8080 (ponto único de entrada)
- **Auth Service**: http://localhost:3001
- **URL Service**: http://localhost:3002

Para mais detalhes, consulte [README_MONOREPO.md](./README_MONOREPO.md).

### Aplicação Monolítica

#### Desenvolvimento

```bash
# Subir ambiente completo (PostgreSQL + App)
docker-compose -f docker-compose.dev.yml up

# Ou usando npm script
npm run docker:dev
```

#### Produção

```bash
# Subir ambiente de produção
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar ambiente
docker-compose down
```

## Serviços

### Monorepo

#### PostgreSQL
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres (desenvolvimento)
- **Banco**: url_shortener
- **Volume**: `postgres_data` (dados persistentes)

#### Auth Service
- **Porta**: 3001
- **Health Check**: `http://localhost:3001/health`
- **Swagger**: `http://localhost:3001/api-docs`

#### URL Service
- **Porta**: 3002
- **Health Check**: `http://localhost:3002/health`
- **Swagger**: `http://localhost:3002/api-docs`

#### API Gateway (KrakenD)
- **Porta**: 8080
- **Health Check**: `http://localhost:8080/health` (agregado)
- **Swagger**: `http://localhost:8080/api-docs` (via gateway)

### Aplicação Monolítica

#### PostgreSQL
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres (desenvolvimento)
- **Banco**: url_shortener
- **Volume**: `postgres_data` (dados persistentes)

#### Aplicação NestJS
- **Porta**: 3000
- **Health Check**: `http://localhost:3000/health`
- **Hot Reload**: Ativado em desenvolvimento

## Comandos Úteis

```bash
# Subir serviços
npm run docker:up

# Parar serviços
npm run docker:down

# Ver logs
npm run docker:logs

# Rebuild imagens
npm run docker:build

# Executar migrações dentro do container
docker-compose exec app npm run migration:run

# Acessar PostgreSQL
docker-compose exec postgres psql -U postgres -d url_shortener
```

## Variáveis de Ambiente

As variáveis de ambiente podem ser definidas em:
1. Arquivo `.env` na raiz do projeto
2. `docker-compose.yml` (produção)
3. `docker-compose.dev.yml` (desenvolvimento)

## Troubleshooting

### Porta já em uso
```bash
# Alterar porta no docker-compose.yml
ports:
  - "3001:3000"  # Muda porta externa para 3001
```

### Banco não inicializa
```bash
# Remover volume e recriar
docker-compose down -v
docker-compose up -d
```

### Rebuild completo
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

