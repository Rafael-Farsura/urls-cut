# Arquitetura do Sistema - URL Shortener

## Visão Geral

Sistema de encurtamento de URLs construído com **NestJS**, seguindo os princípios SOLID e padrões de design adequados para escalabilidade vertical.

## Arquitetura NestJS

O NestJS utiliza uma arquitetura modular baseada em:
- **Módulos**: Encapsulam funcionalidades relacionadas
- **Providers**: Serviços, repositórios, factories (injetáveis)
- **Controllers**: Handlers HTTP com decorators
- **Guards**: Proteção de rotas (autenticação, autorização)
- **Interceptors**: Transformação de requests/responses
- **Pipes**: Validação e transformação de dados
- **Filters**: Tratamento de exceções

## Princípios Arquiteturais

### SOLID

1. **Single Responsibility Principle (SRP)**
   - Cada classe/módulo tem uma única responsabilidade
   - `UserService`: gerencia apenas operações de usuário
   - `UrlService`: gerencia apenas operações de URL
   - `AuthService`: gerencia apenas autenticação
   - `ClickService`: gerencia apenas contabilização de cliques

2. **Open/Closed Principle (OCP)**
   - Interfaces e abstrações permitem extensão sem modificação
   - Estratégias de geração de código curto podem ser trocadas
   - Diferentes provedores de autenticação podem ser adicionados

3. **Liskov Substitution Principle (LSP)**
   - Implementações de repositórios podem ser substituídas
   - Diferentes estratégias de hash podem ser intercambiadas

4. **Interface Segregation Principle (ISP)**
   - Interfaces específicas e focadas
   - `IUserRepository`, `IUrlRepository`, `IClickRepository`

5. **Dependency Inversion Principle (DIP)**
   - Dependências de abstrações, não de implementações concretas
   - Injeção de dependência em todos os serviços

## Design Patterns Aplicados

### 1. Repository Pattern
- **Objetivo**: Abstrair acesso a dados
- **Implementação**: Interfaces de repositório com implementações concretas
- **Benefícios**: Facilita testes, troca de ORM/banco, isolamento de lógica de negócio

### 2. Service Layer Pattern
- **Objetivo**: Centralizar lógica de negócio
- **Implementação**: Camada de serviços entre controllers e repositories
- **Benefícios**: Reutilização, manutenibilidade, separação de concerns

### 3. Strategy Pattern
- **Objetivo**: Algoritmos intercambiáveis para geração de código curto
- **Implementação**: `ShortCodeGenerator` com diferentes estratégias
- **Benefícios**: Flexibilidade para mudar algoritmo sem alterar código cliente

### 4. Factory Pattern
- **Objetivo**: Criação de objetos complexos
- **Implementação**: Factory para criação de entidades e DTOs
- **Benefícios**: Encapsula lógica de criação

### 5. Module Pattern (NestJS)
- **Objetivo**: Encapsular funcionalidades relacionadas
- **Implementação**: Módulos NestJS (@Module decorator)
- **Benefícios**: Organização, reutilização, lazy loading

### 6. Guard Pattern (NestJS)
- **Objetivo**: Proteção de rotas e endpoints
- **Implementação**: Guards (@Injectable, CanActivate)
- **Benefícios**: Autenticação/autorização declarativa, reutilização

### 7. Interceptor Pattern (NestJS)
- **Objetivo**: Transformação de requests/responses
- **Implementação**: Interceptors (@Injectable, NestInterceptor)
- **Benefícios**: Logging, transformação, cache, timeouts

### 8. Pipe Pattern (NestJS)
- **Objetivo**: Validação e transformação de dados
- **Implementação**: Pipes (@Injectable, PipeTransform)
- **Benefícios**: Validação automática, transformação de tipos

### 9. Dependency Injection (NestJS Built-in)
- **Objetivo**: Inversão de controle
- **Implementação**: Sistema de DI nativo do NestJS
- **Benefícios**: Testabilidade, baixo acoplamento, flexibilidade

## Estrutura de Camadas (NestJS)

```
┌─────────────────────────────────────┐
│         Module Layer                 │  ← Agrupa controllers, services, providers
├─────────────────────────────────────┤
│         Controller Layer             │  ← HTTP handlers com decorators
│         (Guards, Interceptors)       │  ← Proteção e transformação
├─────────────────────────────────────┤
│         Service Layer                │  ← Lógica de negócio (@Injectable)
├─────────────────────────────────────┤
│         Repository Layer             │  ← Acesso a dados (TypeORM)
├─────────────────────────────────────┤
│         Entity Layer                 │  ← Entidades TypeORM
└─────────────────────────────────────┘
```

## Fluxo de Requisição (NestJS)

1. **Request** → Entra no módulo
2. **Guard** → Verifica autenticação/autorização (se aplicável)
3. **Pipe** → Valida e transforma dados de entrada
4. **Controller** → Recebe request, chama Service
5. **Interceptor** → Pode interceptar antes/depois do handler
6. **Service** → Aplica regras de negócio, chama Repository
7. **Repository** → Acessa banco de dados (TypeORM)
8. **Interceptor** → Pode transformar resposta
9. **Exception Filter** → Trata exceções (se houver)
10. **Response** ← Retorna através das camadas

## Escalabilidade Vertical

O sistema foi projetado para escalar verticalmente:
- Processamento síncrono eficiente
- Uso otimizado de memória
- Queries otimizadas no banco
- Cache quando necessário
- Pool de conexões configurado

## Tecnologias Propostas

- **Runtime**: Node.js (LTS - 20.11.0)
- **Framework**: NestJS (v10+)
- **ORM**: TypeORM (integrado ao NestJS)
- **Banco**: PostgreSQL
- **Autenticação**: @nestjs/jwt, @nestjs/passport
- **Validação**: class-validator, class-transformer
- **Testes**: Jest (integrado ao NestJS)
- **Documentação**: @nestjs/swagger (OpenAPI)
- **Configuração**: @nestjs/config

## Funcionalidades Avançadas (Opcional)

Para implementações mais avançadas, consulte:
- **API Gateway**: KrakenD para roteamento e proteção de serviços
- **Monorepo**: Separação de serviços com comunicação HTTP/Message Queue
- **CI/CD**: GitHub Actions para lint, testes e deploy automatizados
- **Resiliência**: Circuit breaker, retry, timeout, fallback patterns
- **Changelog**: Versionamento semântico com git tags

Detalhes completos em [Funcionalidades Avançadas](./ADVANCED_FEATURES.md).

