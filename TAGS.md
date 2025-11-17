# Tags de Versão - URL Shortener

Este documento lista todas as tags de versão criadas no projeto, seguindo [Semantic Versioning](https://semver.org/lang/pt-BR/).

## Versões Disponíveis

### v0.7.1 - 2025-11-17
**Commit:** `f37cc0e`  
**Descrição:** Correções de testes e melhorias  
**Principais mudanças:**
- Correção de exceções de permissão (ForbiddenException)
- Melhorias nos testes E2E
- Configuração do ESLint
- Documentação completa de testes

### v0.7.0 - 2025-11-17
**Commit:** `54a4919`  
**Descrição:** Resiliência e CI/CD  
**Principais mudanças:**
- Circuit Breaker Service
- Retry Pattern com exponential backoff
- Timeout Interceptor
- Rate Limiting
- GitHub Actions workflows
- Health checks melhorados

### v0.6.0 - 2025-11-16
**Commit:** `417925e`  
**Descrição:** Observabilidade e Swagger  
**Principais mudanças:**
- HttpExceptionFilter e LoggingInterceptor
- Métricas Prometheus
- Documentação Swagger/OpenAPI completa
- Configuração de observabilidade

### v0.5.0 - 2025-11-14
**Commit:** `d360588`  
**Descrição:** Redirecionamento e testes completos  
**Principais mudanças:**
- Endpoint de redirecionamento GET /:shortCode
- Testes unitários completos (99 testes)
- Testes E2E para todas as rotas
- Cobertura de testes: ~85%

### v0.4.0 - 2025-11-14
**Commit:** `3a80cb7`  
**Descrição:** Contabilização de acessos  
**Principais mudanças:**
- ClicksModule com ClicksRepository e ClicksService
- Contabilização de cliques em URLs
- Integração de contagem na listagem de URLs

### v0.3.0 - 2025-11-14
**Commit:** `47cfc4b`  
**Descrição:** Operações CRUD de URLs  
**Principais mudanças:**
- Strategy Pattern para geração de código curto
- UrlsModule com CRUD completo
- Validação de ownership
- Soft delete implementado

### v0.2.0 - 2025-11-14
**Commit:** `22fa75b`  
**Descrição:** Sistema de autenticação com JWT  
**Principais mudanças:**
- Endpoints de registro e login
- JwtAuthGuard configurado como global
- Decorators @CurrentUser() e @Public()
- Validação de senha com bcrypt

### v0.1.0 - 2025-11-14
**Commit:** `a92171f`  
**Descrição:** Setup inicial e estrutura base  
**Principais mudanças:**
- Estrutura base do projeto NestJS
- Configuração TypeORM com PostgreSQL
- Entidades: User, ShortUrl, Click
- Módulo de Usuários
- Soft delete implementado
- Docker e Docker Compose configurados

## Como Usar as Tags

### Ver todas as tags
```bash
git tag -l
```

### Ver detalhes de uma tag
```bash
git show v0.7.1
```

### Fazer checkout de uma versão específica
```bash
git checkout v0.7.1
```

### Criar branch a partir de uma tag
```bash
git checkout -b hotfix/v0.7.1 v0.7.1
```

### Push de todas as tags
```bash
git push origin --tags
```

## Versionamento Semântico

O projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/):

- **MAJOR** (x.0.0): Mudanças incompatíveis na API
- **MINOR** (0.x.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.x): Correções de bugs compatíveis

## Próximas Versões Planejadas

- **v0.8.0**: Melhorias de performance e otimizações
- **v1.0.0**: Versão estável para produção

---

**Última atualização:** 2025-11-17

