# Testes E2E - URL Shortener

Este diretório contém os testes end-to-end (E2E) do projeto.

## Estrutura

```
test/
├── app.e2e-spec.ts          # Testes principais da aplicação
├── auth.e2e-spec.ts          # Testes de autenticação
├── urls.e2e-spec.ts          # Testes de URLs
├── resilience.e2e-spec.ts   # Testes de resiliência
├── jest-e2e.json            # Configuração Jest para E2E
└── README.md                # Este arquivo
```

## Executando Testes E2E

### Pré-requisitos

1. **PostgreSQL rodando:**
   ```bash
   # Usando Docker
   docker-compose up -d postgres
   
   # Ou PostgreSQL local
   ```

2. **Variáveis de ambiente:**
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   export DB_NAME=url_shortener_test
   ```

### Comandos

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar em modo watch
npm run test:e2e:watch

# Executar teste específico
npm run test:e2e -- urls.e2e-spec.ts
```

## Testes Disponíveis

### app.e2e-spec.ts
Testes principais cobrindo:
- Health check
- Autenticação (registro e login)
- URLs (criação, listagem, atualização, exclusão)
- Redirecionamento e contabilização de cliques

### auth.e2e-spec.ts
Testes focados em autenticação:
- Registro de usuário
- Login
- Validações de entrada
- Tratamento de erros

### urls.e2e-spec.ts
Testes focados em URLs:
- Criação pública e autenticada
- Listagem com clickCount
- Atualização e exclusão
- Redirecionamento
- Ownership (permissões)

### resilience.e2e-spec.ts
Testes de resiliência:
- Health checks
- Rate limiting
- Timeout

## Notas

- Testes E2E requerem banco de dados real
- Cada teste cria seus próprios dados
- Dados são limpos após cada suite de testes
- Testes são independentes entre si

