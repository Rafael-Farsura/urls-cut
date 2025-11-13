# Design do Banco de Dados

## Visão Geral

O banco de dados foi projetado para suportar:
- Escalabilidade vertical
- Soft delete (exclusão lógica)
- Auditoria (created_at, updated_at)
- Performance otimizada com índices
- Integridade referencial

## Diagrama Entidade-Relacionamento

```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│    USERS    │         │ SHORT_URLS   │         │  CLICKS  │
├─────────────┤         ├──────────────┤         ├──────────┤
│ id (PK)     │◄──┐     │ id (PK)      │◄──┐     │ id (PK)  │
│ email (UK)  │   │     │ original_url │   │     │ short_   │
│ password_   │   │     │ short_code   │   │     │   url_id │
│   hash      │   │     │   (UK)       │   │     │   (FK)   │
│ created_at  │   │     │ user_id (FK) │───┘     │ ip_      │
│ updated_at  │   │     │ created_at   │         │   address│
│ deleted_at  │   │     │ updated_at   │         │ user_    │
└─────────────┘   │     │ deleted_at   │         │   agent  │
                  │     └──────────────┘         │ clicked_ │
                  │                              │   at     │
                  └──────────────────────────────┘──────────┘
```

## Tabelas

### 1. users

Armazena informações dos usuários do sistema.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email do usuário |
| password_hash | VARCHAR(255) | NOT NULL | Hash da senha (bcrypt) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data de última atualização |
| deleted_at | TIMESTAMP | NULL | Data de exclusão lógica |

**Índices:**
- `idx_users_email`: Índice único em `email` onde `deleted_at IS NULL`
- `idx_users_deleted_at`: Índice em `deleted_at` para filtros

**Regras de Negócio:**
- Email deve ser único entre usuários ativos (não deletados)
- Senha nunca é armazenada em texto plano
- Soft delete: registros não são fisicamente removidos

### 2. short_urls

Armazena URLs encurtadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| original_url | TEXT | NOT NULL | URL original a ser encurtada |
| short_code | VARCHAR(6) | NOT NULL, UNIQUE | Código curto (máx 6 caracteres) |
| user_id | UUID | NULL, FK → users.id | ID do usuário criador (NULL = público) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data de última atualização |
| deleted_at | TIMESTAMP | NULL | Data de exclusão lógica |

**Índices:**
- `idx_short_urls_code_active`: Índice único em `short_code` onde `deleted_at IS NULL`
- `idx_short_urls_user_id`: Índice em `user_id` onde `deleted_at IS NULL`
- `idx_short_urls_deleted_at`: Índice em `deleted_at`
- `idx_short_urls_created_at`: Índice em `created_at` para ordenação

**Constraints:**
- `chk_short_code_length`: Garante que `short_code` tenha no máximo 6 caracteres
- `chk_original_url_not_empty`: Garante que `original_url` não seja vazio
- `fk_short_urls_user`: Foreign key para `users.id` com `ON DELETE SET NULL`

**Regras de Negócio:**
- `short_code` deve ser único entre URLs ativas
- `user_id` pode ser NULL (URL pública) ou referenciar um usuário
- Soft delete: URLs deletadas não podem ser acessadas

### 3. clicks

Armazena registros de cliques nas URLs encurtadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| short_url_id | UUID | NOT NULL, FK → short_urls.id | ID da URL encurtada |
| ip_address | VARCHAR(45) | NULL | Endereço IP do cliente (suporta IPv6) |
| user_agent | TEXT | NULL | User agent do navegador |
| clicked_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data/hora do clique |

**Índices:**
- `idx_clicks_short_url_id`: Índice em `short_url_id` para agregações
- `idx_clicks_clicked_at`: Índice em `clicked_at` para análises temporais
- `idx_clicks_short_url_clicked_at`: Índice composto para queries otimizadas

**Constraints:**
- `fk_clicks_short_url`: Foreign key para `short_urls.id` com `ON DELETE CASCADE`

**Regras de Negócio:**
- Cada clique é registrado individualmente
- `ip_address` e `user_agent` são opcionais (podem ser NULL)
- Cliques são permanentemente registrados (sem soft delete)

## View: short_urls_with_stats

View materializada para facilitar consultas com estatísticas.

```sql
SELECT 
    su.id,
    su.original_url,
    su.short_code,
    su.user_id,
    su.created_at,
    su.updated_at,
    su.deleted_at,
    COUNT(c.id) AS click_count
FROM short_urls su
LEFT JOIN clicks c ON su.id = c.short_url_id
WHERE su.deleted_at IS NULL
GROUP BY su.id, su.original_url, su.short_code, su.user_id, su.created_at, su.updated_at, su.deleted_at;
```

**Uso:**
- Listagem de URLs com contagem de cliques
- Relatórios e estatísticas
- Performance otimizada para queries frequentes

## Triggers

### update_updated_at_column()

Função que atualiza automaticamente o campo `updated_at` quando um registro é modificado.

**Aplicado em:**
- `users.updated_at`
- `short_urls.updated_at`

## Queries Otimizadas

### Buscar URL por código (mais frequente)

```sql
SELECT * FROM short_urls 
WHERE short_code = $1 
  AND deleted_at IS NULL;
```

**Índice usado:** `idx_short_urls_code_active`

### Listar URLs de um usuário

```sql
SELECT * FROM short_urls 
WHERE user_id = $1 
  AND deleted_at IS NULL 
ORDER BY created_at DESC;
```

**Índice usado:** `idx_short_urls_user_id`

### Contar cliques de uma URL

```sql
SELECT COUNT(*) FROM clicks 
WHERE short_url_id = $1;
```

**Índice usado:** `idx_clicks_short_url_id`

### Listar URLs com estatísticas

```sql
SELECT 
    su.*,
    COUNT(c.id) as click_count
FROM short_urls su
LEFT JOIN clicks c ON su.id = c.short_url_id
WHERE su.user_id = $1 
  AND su.deleted_at IS NULL
GROUP BY su.id
ORDER BY su.created_at DESC;
```

**Índices usados:** `idx_short_urls_user_id`, `idx_clicks_short_url_id`

## Considerações de Performance

1. **Índices Estratégicos:**
   - Índices únicos em campos de busca frequente
   - Índices parciais (WHERE deleted_at IS NULL) para reduzir tamanho

2. **Soft Delete:**
   - Todos os índices consideram `deleted_at IS NULL`
   - Queries sempre filtram por `deleted_at IS NULL`

3. **Agregações:**
   - Contagem de cliques pode ser otimizada com materialized views
   - Considerar cache para URLs mais acessadas

4. **Escalabilidade:**
   - Tabela `clicks` pode crescer muito - considerar particionamento por data
   - Índices compostos para queries complexas

## Migrações Futuras

### Possíveis Melhorias:

1. **Particionamento de clicks:**
   ```sql
   -- Particionar por mês
   CREATE TABLE clicks_2024_01 PARTITION OF clicks
   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
   ```

2. **Índice GIN para busca full-text:**
   ```sql
   CREATE INDEX idx_short_urls_original_url_gin 
   ON short_urls USING gin(to_tsvector('portuguese', original_url));
   ```

3. **Tabela de estatísticas agregadas:**
   ```sql
   CREATE TABLE url_statistics (
       short_url_id UUID PRIMARY KEY,
       click_count BIGINT,
       last_click_at TIMESTAMP,
       updated_at TIMESTAMP
   );
   ```

## Integridade Referencial

- **users → short_urls**: `ON DELETE SET NULL` (URLs públicas permanecem se usuário for deletado)
- **short_urls → clicks**: `ON DELETE CASCADE` (cliques são removidos se URL for deletada fisicamente)

## Segurança

- Senhas nunca armazenadas em texto plano
- Soft delete previne perda acidental de dados
- Índices únicos garantem integridade de dados
- Constraints garantem validação no banco

