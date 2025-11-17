# Guia Completo de Testes - URL Shortener

Este documento fornece um guia completo sobre como executar, escrever e entender os testes do projeto.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Testes](#estrutura-de-testes)
- [Tipos de Testes](#tipos-de-testes)
- [Scripts de Teste](#scripts-de-teste)
- [Executando Testes](#executando-testes)
- [Escrevendo Testes](#escrevendo-testes)
- [Cobertura de Código](#cobertura-de-código)
- [CI/CD e Testes](#cicd-e-testes)
- [Boas Práticas](#boas-práticas)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O projeto utiliza **Jest** como framework de testes, com suporte para:

- ✅ Testes unitários
- ✅ Testes de integração
- ✅ Testes end-to-end (E2E)
- ✅ Cobertura de código
- ✅ Testes em CI/CD

## 📁 Estrutura de Testes

```
urls-cut/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   └── __tests__/          # Testes unitários do módulo auth
│   │   │       ├── auth.service.spec.ts
│   │   │       └── auth.controller.spec.ts
│   │   ├── urls/
│   │   │   └── __tests__/
│   │   │       ├── urls.service.spec.ts
│   │   │       ├── urls.controller.spec.ts
│   │   │       └── redirect.controller.spec.ts
│   │   └── health/
│   │       └── __tests__/
│   │           └── health.service.spec.ts
│   ├── common/
│   │   ├── services/
│   │   │   └── __tests__/
│   │   │       ├── circuit-breaker.service.spec.ts
│   │   │       └── retry.service.spec.ts
│   │   ├── interceptors/
│   │   │   └── __tests__/
│   │   │       ├── logging.interceptor.spec.ts
│   │   │       └── timeout.interceptor.spec.ts
│   │   ├── guards/
│   │   │   └── __tests__/
│   │   │       └── jwt-auth.guard.spec.ts
│   │   └── filters/
│   │       └── __tests__/
│   │           └── http-exception.filter.spec.ts
└── test/                            # Testes E2E
    ├── app.e2e-spec.ts              # Testes E2E principais
    ├── auth.e2e-spec.ts             # Testes E2E de autenticação
    ├── urls.e2e-spec.ts             # Testes E2E de URLs
    ├── resilience.e2e-spec.ts       # Testes E2E de resiliência
    └── jest-e2e.json                # Configuração Jest para E2E
```

## 🧪 Tipos de Testes

### 1. Testes Unitários

Testam componentes isolados (services, controllers, guards, interceptors, etc.) sem dependências externas.

**Localização:** `src/**/__tests__/*.spec.ts`

**Exemplos:**

- `auth.service.spec.ts` - Testa lógica de autenticação
- `circuit-breaker.service.spec.ts` - Testa Circuit Breaker
- `jwt-auth.guard.spec.ts` - Testa guard de autenticação

**Características:**

- Rápidos (executam em milissegundos)
- Isolados (usam mocks)
- Focam em lógica de negócio
- Não requerem banco de dados

### 2. Testes de Integração

Testam interação entre múltiplos componentes.

**Localização:** `test/integration/*.spec.ts` (a criar)

**Características:**

- Testam fluxos completos
- Podem usar banco de dados de teste
- Mais lentos que unitários

### 3. Testes End-to-End (E2E)

Testam a aplicação completa, incluindo HTTP, banco de dados e todas as camadas.

**Localização:** `test/*.e2e-spec.ts`

**Exemplos:**

- `app.e2e-spec.ts` - Testes principais da aplicação
- `auth.e2e-spec.ts` - Testes de autenticação
- `urls.e2e-spec.ts` - Testes de URLs
- `resilience.e2e-spec.ts` - Testes de resiliência

**Características:**

- Testam fluxos completos do usuário
- Requerem banco de dados real
- Mais lentos (segundos)
- Testam integração completa

## 🚀 Scripts de Teste

### Scripts Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes unitários em modo watch
npm run test:unit:watch

# Executar apenas testes E2E
npm run test:e2e

# Executar apenas testes E2E em modo watch
npm run test:e2e:watch

# Executar testes de integração
npm run test:integration

# Executar todos os testes (unit + E2E)
npm run test:all

# Executar testes com cobertura
npm run test:cov

# Executar testes em modo debug
npm run test:debug

# Executar testes como no CI (lint + unit + e2e + coverage)
npm run test:ci
```

### Descrição dos Scripts

| Script       | Descrição                                           |
| ------------ | --------------------------------------------------- |
| `test`       | Executa todos os testes (unitários)                 |
| `test:watch` | Executa testes em modo watch (re-executa ao salvar) |
| `test:unit`  | Executa apenas testes unitários                     |
| `test:e2e`   | Executa apenas testes E2E                           |
| `test:all`   | Executa unitários e E2E sequencialmente             |
| `test:cov`   | Executa testes e gera relatório de cobertura        |
| `test:ci`    | Executa lint + testes + cobertura (como no CI)      |

## ▶️ Executando Testes

### Pré-requisitos

1. **Banco de dados PostgreSQL** (para testes E2E):

   ```bash
   # Usando Docker
   docker-compose up -d postgres

   # Ou instalar PostgreSQL localmente
   ```

2. **Variáveis de ambiente** (opcional para testes unitários):

   ```bash
   # Criar .env.test (opcional)
   cp .env.example .env.test
   ```

### Executar Testes Unitários

```bash
# Todos os testes unitários
npm run test:unit

# Testes de um módulo específico
npm test -- auth.service.spec.ts

# Testes em modo watch
npm run test:unit:watch
```

### Executar Testes E2E

```bash
# Configurar banco de dados de teste
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=url_shortener_test

# Executar testes E2E
npm run test:e2e

# Executar teste E2E específico
npm run test:e2e -- urls.e2e-spec.ts
```

### Executar Todos os Testes

```bash
# Executa unitários e E2E
npm run test:all

# Executa como no CI (com lint e cobertura)
npm run test:ci
```

### Cobertura de Código

```bash
# Gerar relatório de cobertura
npm run test:cov

# Abrir relatório HTML (se disponível)
open coverage/lcov-report/index.html
```

**Cobertura Mínima Esperada:**

- Services: > 90%
- Controllers: > 85%
- Guards/Interceptors: > 80%
- Geral: > 80%

## ✍️ Escrevendo Testes

### Estrutura de um Teste Unitário

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceName } from '../service-name';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceName,
        // Mocks de dependências
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('deve fazer algo específico', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Estrutura de um Teste E2E

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Feature (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve fazer algo', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('property');
      });
  });
});
```

### Exemplos de Testes

#### Teste de Service

```typescript
describe('UrlsService', () => {
  let service: UrlsService;
  let repository: jest.Mocked<UrlsRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      // ... outros métodos
    };

    const module = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: UrlsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    repository = module.get(UrlsRepository);
  });

  it('deve criar URL com sucesso', async () => {
    const urlData = { originalUrl: 'https://example.com' };
    const expectedUrl = { id: '123', ...urlData };

    repository.create.mockResolvedValue(expectedUrl);

    const result = await service.create(urlData.originalUrl);

    expect(result).toEqual(expectedUrl);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ originalUrl: urlData.originalUrl }),
    );
  });
});
```

#### Teste de Controller

```typescript
describe('UrlsController', () => {
  let controller: UrlsController;
  let service: jest.Mocked<UrlsService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findByUserId: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    service = module.get(UrlsService);
  });

  it('deve criar URL', async () => {
    const dto = { originalUrl: 'https://example.com' };
    const expected = { id: '123', ...dto };

    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto, { id: 'user-id' });

    expect(result).toHaveProperty('id');
    expect(service.create).toHaveBeenCalledWith(dto.originalUrl, 'user-id');
  });
});
```

#### Teste E2E Completo

```typescript
describe('URLs (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // Criar usuário e obter token
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    authToken = loginRes.body.access_token;
  });

  it('deve criar URL autenticada', () => {
    return request(app.getHttpServer())
      .post('/api/urls')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ originalUrl: 'https://example.com' })
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.userId).toBeDefined();
      });
  });
});
```

## 📊 Cobertura de Código

### Visualizar Cobertura

```bash
# Gerar relatório
npm run test:cov

# Ver relatório HTML
open coverage/lcov-report/index.html
```

### Cobertura por Módulo

| Módulo       | Cobertura Esperada | Status |
| ------------ | ------------------ | ------ |
| Services     | > 90%              | ✅     |
| Controllers  | > 85%              | ✅     |
| Guards       | > 80%              | ✅     |
| Interceptors | > 80%              | ✅     |
| Filters      | > 80%              | ✅     |
| Repositories | > 85%              | ✅     |

### Arquivos de Cobertura

- `coverage/lcov.info` - Formato LCOV (para Codecov)
- `coverage/lcov-report/` - Relatório HTML
- `coverage/coverage-summary.json` - Resumo JSON

## 🔄 CI/CD e Testes

### GitHub Actions

O workflow de CI (`/.github/workflows/ci.yml`) executa:

1. **Lint** - Verifica código
2. **Testes Unitários** - Executa testes unitários
3. **Testes E2E** - Executa testes E2E com PostgreSQL
4. **Cobertura** - Gera e envia cobertura para Codecov
5. **Build** - Compila o projeto

### Executar Testes Localmente como no CI

```bash
# Executa exatamente como no CI
npm run test:ci
```

Isso executa:

1. `npm run lint` - Verifica código
2. `npm run test:unit` - Testes unitários
3. `npm run test:e2e` - Testes E2E
4. `npm run test:cov` - Cobertura

## ✅ Boas Práticas

### 1. Nomenclatura

- Arquivos de teste: `*.spec.ts` (unitários) ou `*.e2e-spec.ts` (E2E)
- Descreva o que está sendo testado: `describe('ServiceName', () => {})`
- Use descrições claras: `it('deve criar URL com sucesso', () => {})`

### 2. Estrutura AAA

```typescript
it('deve fazer algo', () => {
  // Arrange - Preparar
  const input = 'test';

  // Act - Executar
  const result = service.method(input);

  // Assert - Verificar
  expect(result).toBe('expected');
});
```

### 3. Isolamento

- Cada teste deve ser independente
- Use `beforeEach` e `afterEach` para limpar estado
- Não compartilhe estado entre testes

### 4. Mocks

- Mock dependências externas
- Use `jest.fn()` para funções
- Use `jest.mock()` para módulos

### 5. Asserções

- Seja específico: `expect(result).toBe(value)` vs `expect(result).toBeTruthy()`
- Teste casos de erro também
- Use matchers apropriados

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Testes E2E falhando por banco de dados

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Verificar variáveis de ambiente
echo $DB_HOST $DB_PORT $DB_NAME

# Limpar banco de teste
psql -U postgres -d url_shortener_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

#### 2. Timeout em testes

```typescript
// Aumentar timeout para teste específico
it('teste lento', async () => {
  // ...
}, 10000); // 10 segundos
```

#### 3. Mocks não funcionando

```typescript
// Garantir que mocks são resetados
afterEach(() => {
  jest.clearAllMocks();
});
```

#### 4. Cobertura baixa

```bash
# Verificar quais arquivos não estão cobertos
npm run test:cov

# Adicionar testes para arquivos não cobertos
```

## 📚 Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 📝 Checklist de Testes

Antes de fazer commit, verifique:

- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura acima de 80% (`npm run test:cov`)
- [ ] Testes E2E passam (`npm run test:e2e`)
- [ ] Lint passa (`npm run lint`)
- [ ] Novos recursos têm testes
- [ ] Bugs corrigidos têm testes de regressão

---

**Última atualização:** 2025-11-17
