# Especificação da API REST

## Base URL

```
http://localhost:3000
```

## Autenticação

A API utiliza **Bearer Token** (JWT) para autenticação. O token deve ser enviado no header:

```
Authorization: Bearer <token>
```

## Maturidade REST

A API segue **Maturidade Nível 2** (Richardson Maturity Model):
- ✅ **Recursos nomeados (URLs)**: Endpoints representam recursos (`/api/urls`, `/api/auth`)
- ✅ **Verbos HTTP**: Uso correto de GET, POST, PUT, DELETE
- ✅ **Códigos de status HTTP apropriados**: 200, 201, 204, 302, 400, 401, 403, 404, 409, 500
- ✅ **Uso de JSON para representação**: Todas as requisições e respostas em JSON

### Exemplos de Maturidade Nível 2

- `GET /api/urls` - Lista recursos
- `POST /api/urls` - Cria recurso
- `PUT /api/urls/:id` - Atualiza recurso
- `DELETE /api/urls/:id` - Remove recurso
- `GET /:shortCode` - Acessa recurso específico

## Endpoints

### Autenticação

#### 1. Registrar Usuário

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta de Erro (400 Bad Request):**
```json
{
  "error": {
    "message": "Email já está em uso",
    "code": "EMAIL_ALREADY_EXISTS"
  }
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Resposta de Erro (401 Unauthorized):**
```json
{
  "error": {
    "message": "Credenciais inválidas",
    "code": "INVALID_CREDENTIALS"
  }
}
```

### URLs Encurtadas

#### 3. Criar URL Encurtado

```http
POST /api/urls
Content-Type: application/json
Authorization: Bearer <token>  # Opcional

{
  "originalUrl": "https://example.com/very/long/url"
}
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": "uuid",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "http://localhost:3000/aZbKq7",
  "shortCode": "aZbKq7",
  "userId": "uuid" | null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta de Erro (400 Bad Request):**
```json
{
  "error": {
    "message": "URL inválida",
    "code": "INVALID_URL"
  }
}
```

**Notas:**
- Endpoint aceita requisições autenticadas e não autenticadas
- Se autenticado, `userId` será preenchido
- Se não autenticado, `userId` será `null`

#### 4. Listar URLs do Usuário

```http
GET /api/urls
Authorization: Bearer <token>
```

**Resposta de Sucesso (200 OK):**
```json
{
  "urls": [
    {
      "id": "uuid",
      "originalUrl": "https://example.com/very/long/url",
      "shortUrl": "http://localhost:3000/aZbKq7",
      "shortCode": "aZbKq7",
      "clickCount": 42,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Resposta de Erro (401 Unauthorized):**
```json
{
  "error": {
    "message": "Token inválido ou expirado",
    "code": "UNAUTHORIZED"
  }
}
```

#### 5. Atualizar URL

```http
PUT /api/urls/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "originalUrl": "https://example.com/new/url"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid",
  "originalUrl": "https://example.com/new/url",
  "shortUrl": "http://localhost:3000/aZbKq7",
  "shortCode": "aZbKq7",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta de Erro (403 Forbidden):**
```json
{
  "error": {
    "message": "Você não tem permissão para atualizar esta URL",
    "code": "FORBIDDEN"
  }
}
```

**Resposta de Erro (404 Not Found):**
```json
{
  "error": {
    "message": "URL não encontrada",
    "code": "URL_NOT_FOUND"
  }
}
```

#### 6. Deletar URL

```http
DELETE /api/urls/:id
Authorization: Bearer <token>
```

**Resposta de Sucesso (204 No Content):**
```
(sem corpo)
```

**Resposta de Erro (403 Forbidden):**
```json
{
  "error": {
    "message": "Você não tem permissão para deletar esta URL",
    "code": "FORBIDDEN"
  }
}
```

### Redirecionamento

#### 7. Redirecionar para URL Original

```http
GET /:shortCode
```

**Resposta de Sucesso (302 Found):**
```
Location: https://example.com/very/long/url
```

**Resposta de Erro (404 Not Found):**
```json
{
  "error": {
    "message": "URL encurtada não encontrada",
    "code": "SHORT_URL_NOT_FOUND"
  }
}
```

**Notas:**
- Este endpoint contabiliza o clique automaticamente
- Não requer autenticação
- Retorna 302 (Found) para redirecionamento

## Códigos de Status HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Requisição bem-sucedida (GET, PUT) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 204 | No Content | Recurso deletado com sucesso (DELETE) |
| 302 | Found | Redirecionamento (GET /:shortCode) |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Sem permissão para acessar recurso |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email já existe) |
| 500 | Internal Server Error | Erro interno do servidor |

## Validações

### Email
- Formato válido de email
- Máximo 255 caracteres

### Senha
- Mínimo 8 caracteres
- Recomendado: letras, números e caracteres especiais

### URL Original
- Formato válido de URL (http:// ou https://)
- Máximo 2048 caracteres
- Deve ser acessível (opcional, pode ser validação futura)

### Short Code
- Máximo 6 caracteres
- Alfanumérico (a-z, A-Z, 0-9)
- Único no sistema

## Paginação (Futuro)

Para endpoints de listagem, pode ser implementada paginação:

```http
GET /api/urls?page=1&limit=10
```

**Resposta:**
```json
{
  "urls": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Rate Limiting

Para prevenir abuso, a API pode implementar rate limiting:

- **Público**: 100 requisições por 15 minutos
- **Autenticado**: 1000 requisições por 15 minutos

**Resposta quando excedido (429 Too Many Requests):**
```json
{
  "error": {
    "message": "Muitas requisições. Tente novamente mais tarde.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 900
  }
}
```

## Versionamento

A API está na versão 1.0. Futuras versões podem ser adicionadas:

```
/api/v1/urls
/api/v2/urls
```

## Exemplos de Uso

### Fluxo Completo

1. **Registrar usuário:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

3. **Criar URL encurtado:**
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"originalUrl":"https://example.com/very/long/url"}'
```

4. **Listar URLs:**
```bash
curl -X GET http://localhost:3000/api/urls \
  -H "Authorization: Bearer <token>"
```

5. **Acessar URL encurtado:**
```bash
curl -L http://localhost:3000/aZbKq7
```

## Documentação OpenAPI/Swagger

A documentação completa está disponível em:
- **URL**: `http://localhost:3000/api-docs`
- **Arquivo**: `docs/openapi.yaml` (a ser criado)

