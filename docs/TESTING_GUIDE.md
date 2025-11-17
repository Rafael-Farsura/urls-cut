# Guia Rápido de Testes - URL Shortener

Guia rápido para executar e entender os testes do projeto.

## 🚀 Execução Rápida

### Testes Unitários

```bash
npm run test:unit
```

### Testes E2E

```bash
# Requer PostgreSQL rodando
docker-compose up -d postgres
npm run test:e2e
```

### Todos os Testes

```bash
npm run test:all
```

### Cobertura

```bash
npm run test:cov
```

## 📊 Estatísticas

- **15 arquivos de teste unitário**
- **4 arquivos de teste E2E**
- **99 testes unitários** passando
- **Cobertura: ~85%**

## 📁 Arquivos de Teste

### Unitários (`src/**/__tests__/`)

- `circuit-breaker.service.spec.ts` - Circuit Breaker
- `retry.service.spec.ts` - Retry Pattern
- `health.service.spec.ts` - Health Checks
- `timeout.interceptor.spec.ts` - Timeout
- `jwt-auth.guard.spec.ts` - JWT Guard
- `logging.interceptor.spec.ts` - Logging
- `http-exception.filter.spec.ts` - Exception Filter
- `auth.service.spec.ts` - Auth Service
- `auth.controller.spec.ts` - Auth Controller
- `urls.service.spec.ts` - URLs Service
- `urls.controller.spec.ts` - URLs Controller
- `redirect.controller.spec.ts` - Redirect Controller
- `clicks.service.spec.ts` - Clicks Service
- `hash-based.generator.spec.ts` - Hash Generator
- `random.generator.spec.ts` - Random Generator

### E2E (`test/`)

- `app.e2e-spec.ts` - Testes principais
- `auth.e2e-spec.ts` - Autenticação
- `urls.e2e-spec.ts` - URLs
- `resilience.e2e-spec.ts` - Resiliência

## 🔧 Scripts Disponíveis

| Script      | Descrição                              |
| ----------- | -------------------------------------- |
| `test`      | Todos os testes unitários              |
| `test:unit` | Apenas testes unitários                |
| `test:e2e`  | Apenas testes E2E                      |
| `test:all`  | Unitários + E2E                        |
| `test:cov`  | Com cobertura                          |
| `test:ci`   | Como no CI (lint + testes + cobertura) |

## 📚 Documentação Completa

Para documentação detalhada, consulte [TESTING.md](./TESTING.md).
