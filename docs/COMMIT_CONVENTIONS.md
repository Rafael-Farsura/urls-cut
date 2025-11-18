# Convenções de Commits - Conventional Commits

Este documento define as convenções de commits do projeto, seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/).

## Formato

```
<type>(<scope>): <description>

[corpo opcional]

[rodapé opcional]
```

## Tipos (Type)

### Principais

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Apenas documentação
- **test**: Adição ou correção de testes
- **chore**: Mudanças que não afetam código de produção (build, config, etc.)
- **refactor**: Refatoração de código sem mudança de funcionalidade
- **style**: Mudanças de formatação (espaços, vírgulas, etc.)
- **perf**: Melhoria de performance
- **ci**: Mudanças em CI/CD
- **build**: Mudanças no sistema de build

### Exemplos

```bash
feat(auth): implementar módulo de autenticação
fix(urls): corrigir validação de URL
docs: atualizar README com instruções de instalação
test(e2e): adicionar testes para endpoint de redirecionamento
chore: atualizar dependências
refactor(common): extrair lógica compartilhada para pacote shared
```

## Escopos (Scope)

Escopos ajudam a identificar qual parte do código foi afetada:

- `auth`: Autenticação e autorização
- `urls`: Gerenciamento de URLs
- `clicks`: Contabilização de cliques
- `users`: Gerenciamento de usuários
- `common`: Código compartilhado
- `database`: Banco de dados e migrações
- `monorepo`: Estrutura de monorepo
- `gateway`: API Gateway (KrakenD)
- `resilience`: Circuit breaker, retry, timeout
- `security`: Segurança e rate limiting
- `health`: Health checks
- `api`: Documentação da API (Swagger)
- `scripts`: Scripts de automação
- `docker`: Docker e Docker Compose
- `ci`: GitHub Actions e CI/CD

## Descrição

- Use o modo imperativo, presente do indicativo: "adicionar" não "adicionado" ou "adiciona"
- Não capitalize a primeira letra
- Não termine com ponto (.)
- Seja claro e conciso
- Máximo de 72 caracteres

### Boas práticas

✅ **Bom:**
```
feat(auth): implementar registro de usuários
fix(urls): corrigir validação de URL vazia
docs: atualizar instruções de instalação
```

❌ **Ruim:**
```
feat: adicionar coisas
fix: bug
docs: atualização
feat(auth): Implementar registro de usuários.
```

## Corpo (Opcional)

Use o corpo para explicar o **o quê** e **por quê**, não o **como**:

```
feat(auth): implementar registro de usuários

Adiciona endpoint POST /api/auth/register que permite
criar novos usuários com validação de email e senha.
A senha é hasheada usando bcrypt antes de ser armazenada.
```

## Rodapé (Opcional)

Use para referenciar issues, breaking changes, etc:

```
feat(api): adicionar paginação

BREAKING CHANGE: endpoint GET /api/urls agora retorna
objeto com 'data' e 'pagination' em vez de array direto.

Closes #123
```

## Commits e Versões

Os commits devem refletir as versões no CHANGELOG.md:

- **v0.1.0**: Setup inicial
- **v0.2.0**: Autenticação
- **v0.3.0**: Operações CRUD de URLs
- **v0.4.0**: Contabilização de acessos
- **v0.5.0**: Redirecionamento e testes
- **v0.6.0**: Observabilidade e Swagger
- **v0.7.0**: Resiliência e CI/CD
- **v0.8.0**: Monorepo e API Gateway

## Exemplos Completos

### Feature

```bash
feat(auth): implementar módulo de autenticação

Adiciona endpoints de registro e login com JWT.
Inclui validação de senha com bcrypt e guard
global para proteção de rotas.
```

### Bug Fix

```bash
fix(gateway): corrigir autenticação 401 usando header

Substitui autenticação hardcoded por verificação
de header X-User-Id do gateway KrakenD.
```

### Documentação

```bash
docs: adicionar documentação inicial do projeto

Inclui README, CHANGELOG e documentação técnica
em docs/ com arquitetura e padrões de design.
```

### Teste

```bash
test(e2e): corrigir e melhorar testes E2E

Adiciona delays entre requisições de rate limiting
e melhora limpeza de banco de dados entre testes.
```

### Refatoração

```bash
refactor(common): migrar código compartilhado para packages/shared

Remove código duplicado entre serviços e centraliza
decorators, filters, interceptors e guards no
pacote compartilhado @urls-cut/shared.
```

## Referências

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

