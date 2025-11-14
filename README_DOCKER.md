# Docker Setup - URL Shortener

## Quick Start

### Desenvolvimento

```bash
# Subir ambiente completo (PostgreSQL + App)
docker-compose -f docker-compose.dev.yml up

# Ou usando npm script
npm run docker:dev
```

### Produção

```bash
# Subir ambiente de produção
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar ambiente
docker-compose down
```

## Serviços

### PostgreSQL
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres (desenvolvimento)
- **Banco**: url_shortener
- **Volume**: `postgres_data` (dados persistentes)

### Aplicação NestJS
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

