# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Added
- Documentação completa do projeto
- Arquitetura NestJS definida
- Schema SQL do banco de dados
- Especificação da API REST
- Diagramas de arquitetura e sequência
- Documentação de design patterns
- Guia de observabilidade
- Guia de validação de entrada
- Documentação de funcionalidades avançadas (API Gateway, Monorepo, CI/CD, Resiliência)

## [0.4.0] - Planejado

### Added
- Contabilização de cliques em URLs encurtadas
- Endpoint para listar estatísticas de cliques
- View `short_urls_with_stats` no banco de dados
- Agregação de estatísticas de acesso

### Changed
- Melhorada performance de queries de listagem de URLs
- Otimizado índice de cliques por data

## [0.3.0] - Planejado

### Added
- Operações CRUD para URLs (listar, editar, excluir)
- Validação de ownership em operações de modificação
- Soft delete implementado
- Endpoints autenticados para gerenciamento de URLs

### Changed
- Melhorada estrutura de resposta de listagem de URLs
- Adicionada contagem de cliques na listagem

## [0.2.0] - Planejado

### Added
- Sistema de autenticação com JWT
- Endpoints de registro e login
- Guard de autenticação
- Decorator @CurrentUser()
- Decorator @Public() para rotas públicas
- Validação de senha com bcrypt

## [0.1.0] - Planejado

### Added
- Sistema básico de encurtamento de URLs
- Endpoint único para criar URLs (público e autenticado)
- Geração de código curto (máximo 6 caracteres)
- Redirecionamento com contabilização de cliques
- Schema inicial do banco de dados
- Estrutura base do projeto NestJS

---

[Keep a Changelog]: https://keepachangelog.com/pt-BR/1.0.0/
[Semantic Versioning]: https://semver.org/lang/pt-BR/

