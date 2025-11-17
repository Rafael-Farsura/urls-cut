# 🚀 Guia Rápido de Testes

## Testar API Gateway

```bash
# 1. Subir os serviços
docker compose -f docker-compose.monorepo.yml up -d

# 2. Aguardar serviços ficarem prontos (30-60 segundos)
docker ps

# 3. Executar testes automatizados
./scripts/test-gateway.sh

# 4. Ou testar manualmente
curl http://localhost:8080/health
```

## Testar CI/CD

```bash
# 1. Verificar configuração
./scripts/test-cicd.sh

# 2. Testar localmente
npm run lint
npm run test
npm run build

# 3. Fazer push para disparar CI
git add .
git commit -m "test: trigger CI"
git push origin main

# 4. Verificar no GitHub
# Acesse: https://github.com/seu-usuario/seu-repo/actions
```

## Testes Rápidos

```bash
# Health check
curl http://localhost:8080/health

# Registrar usuário
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

Para mais detalhes, veja: `docs/TESTING_GATEWAY_CICD.md`
