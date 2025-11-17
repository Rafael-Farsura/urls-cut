# Guia de Testes - API Gateway e CI/CD

Este documento explica como testar o API Gateway (KrakenD) e os workflows de CI/CD.

## 📋 Índice

1. [Testando o API Gateway](#testando-o-api-gateway)
2. [Testando o CI/CD](#testando-o-cicd)
3. [Testes Manuais](#testes-manuais)
4. [Troubleshooting](#troubleshooting)

---

## 🚪 Testando o API Gateway

### Pré-requisitos

1. Docker e Docker Compose instalados
2. Monorepo rodando: `docker compose -f docker-compose.monorepo.yml up -d`
3. Aguardar todos os serviços estarem saudáveis (verificar com `docker ps`)
4. **Base URL**: `http://localhost:8080` (API Gateway - ponto único de entrada)

### Método 1: Script Automatizado (Recomendado)

```bash
# Executar script de teste completo
./scripts/test-gateway.sh

# Ou especificar URL customizada
GATEWAY_URL=http://localhost:8080 ./scripts/test-gateway.sh
```

O script testa:
- ✅ Health check agregado
- ✅ Registro de usuário
- ✅ Login e obtenção de token JWT
- ✅ Endpoints protegidos (com JWT)
- ✅ Criação de URLs
- ✅ Atualização de URLs
- ✅ Deleção de URLs
- ✅ Redirecionamento
- ✅ Rate limiting
- ✅ Validação JWT (sem token)

### Método 2: Testes Manuais com cURL

#### 1. Health Check

```bash
curl http://localhost:8080/health
```

**Resposta esperada:**
```json
{
  "auth-service": { "status": "ok" },
  "url-service": { "status": "ok" }
}
```

#### 2. Registro de Usuário

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**Resposta esperada:** `201 Created` com dados do usuário

#### 3. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Resposta esperada:** `200 OK` com `accessToken`

#### 4. Listar URLs (Protegido - requer JWT)

```bash
TOKEN="seu-token-aqui"

curl -X GET http://localhost:8080/api/urls \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada:** `200 OK` com lista de URLs

#### 5. Criar URL

```bash
curl -X POST http://localhost:8080/api/urls \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://example.com"
  }'
```

**Resposta esperada:** `201 Created` com dados da URL criada

#### 6. Testar Rate Limiting

```bash
# Enviar múltiplas requisições rapidamente
for i in {1..15}; do
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"Test123!\",\"name\":\"Test $i\"}"
  echo ""
done
```

**Resposta esperada:** Após 10 requisições, deve retornar `429 Too Many Requests`

#### 7. Testar Validação JWT

```bash
# Tentar acessar endpoint protegido sem token
curl -X GET http://localhost:8080/api/urls
```

**Resposta esperada:** `401 Unauthorized`

### Método 3: Testes com Postman/Insomnia

1. Importar a collection do Postman (se disponível)
2. Configurar variável de ambiente `GATEWAY_URL` = `http://localhost:8080`
3. Executar os testes na ordem:
   - Register → Login → Get URLs → Create URL → Update URL → Delete URL

---

## 🔄 Testando o CI/CD

### Pré-requisitos

1. Repositório no GitHub
2. GitHub Actions habilitado
3. Secrets configurados (se necessário)

### Método 1: Script de Verificação

```bash
# Verificar configuração dos workflows
./scripts/test-cicd.sh
```

O script verifica:
- ✅ Existência dos workflows (`ci.yml`, `release.yml`)
- ✅ Estrutura dos workflows
- ✅ Steps esperados (lint, test, build)
- ✅ Configuração de triggers
- ✅ Scripts no `package.json`

### Método 2: Testes no GitHub

#### 1. Verificar Workflows

1. Acesse: `https://github.com/seu-usuario/seu-repo/actions`
2. Verifique se os workflows aparecem na lista
3. Clique em um workflow para ver detalhes

#### 2. Disparar Workflow de CI Manualmente

```bash
# Fazer push de uma mudança
git add .
git commit -m "test: trigger CI workflow"
git push origin main
```

**Verificar:**
- Workflow aparece em "Actions"
- Todos os jobs passam (✅)
- Logs não mostram erros

#### 3. Testar Workflow de Release

```bash
# Criar uma tag
git tag -a v0.8.0 -m "Release 0.8.0"
git push origin v0.8.0
```

**Verificar:**
- Workflow de release é disparado
- Build é criado com sucesso
- Release é publicado (se configurado)

### Método 3: Testes Locais (Simular CI)

#### Testar Lint

```bash
npm run lint
```

#### Testar Testes

```bash
npm run test
npm run test:cov
```

#### Testar Build

```bash
npm run build
```

#### Testar E2E

```bash
npm run test:e2e
```

---

## 🧪 Testes Manuais Detalhados

### Teste de Roteamento do Gateway

Verificar se o Gateway está roteando corretamente:

```bash
# Testar rota para auth-service
curl http://localhost:8080/api/auth/login

# Testar rota para url-service
curl http://localhost:8080/api/urls
```

### Teste de Agregação (Health Check)

O endpoint `/health` agrega respostas de múltiplos serviços:

```bash
curl http://localhost:8080/health | jq
```

**Resposta esperada:**
```json
{
  "auth-service": {
    "status": "ok",
    "database": { "status": "up" }
  },
  "url-service": {
    "status": "ok",
    "database": { "status": "up" }
  }
}
```

### Teste de Cache

O Gateway tem cache configurado (300s). Teste:

```bash
# Primeira requisição (vai ao backend)
time curl http://localhost:8080/health

# Segunda requisição (deve ser mais rápida - cache)
time curl http://localhost:8080/health
```

### Teste de Timeout

O Gateway tem timeout de 3000ms. Para testar:

1. Simular lentidão no serviço backend
2. Fazer requisição ao Gateway
3. Verificar se retorna timeout após 3s

---

## 🔧 Troubleshooting

### Gateway não responde

```bash
# Verificar se o container está rodando
docker ps | grep api-gateway

# Ver logs do Gateway
docker logs urls-cut-api-gateway

# Verificar configuração
docker exec urls-cut-api-gateway cat /etc/krakend/krakend.json
```

### Erro 401 Unauthorized

- Verificar se o token JWT está sendo enviado
- Verificar se `JWT_SECRET` está correto no `.env`
- Verificar se o token não expirou

### Rate Limiting muito restritivo

Editar `gateway/krakend/krakend.json` e ajustar:
```json
"qos/ratelimit/router": {
  "max_rate": 100,  // Aumentar este valor
  "capacity": 100
}
```

### CI/CD não dispara

1. Verificar se o arquivo está em `.github/workflows/`
2. Verificar sintaxe YAML (usar validador online)
3. Verificar triggers (on: push, pull_request, etc.)
4. Verificar se está na branch correta

### Workflow falha no GitHub

1. Verificar logs do workflow
2. Verificar secrets configurados
3. Verificar permissões do repositório
4. Verificar se os scripts no `package.json` existem

---

## 📊 Checklist de Testes

### API Gateway

- [ ] Health check retorna status dos serviços
- [ ] Registro de usuário funciona
- [ ] Login retorna token JWT
- [ ] Endpoints protegidos requerem token
- [ ] Criação de URL funciona
- [ ] Atualização de URL funciona
- [ ] Deleção de URL funciona
- [ ] Redirecionamento funciona
- [ ] Rate limiting bloqueia após limite
- [ ] Validação JWT rejeita tokens inválidos

### CI/CD

- [ ] Workflow de CI dispara em push
- [ ] Lint passa
- [ ] Testes passam
- [ ] Build é criado com sucesso
- [ ] Workflow de release dispara em tag
- [ ] Release é publicado (se configurado)

---

## 📚 Referências

- [KrakenD Documentation](https://www.krakend.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

**Última atualização:** 2025-11-17

