# Validação de Entrada - URL Shortener

## Visão Geral

O sistema implementa validação de entrada em todos os pontos necessários para garantir integridade e segurança dos dados.

## Estratégia de Validação

### 1. DTOs com class-validator

Todos os dados de entrada são validados através de DTOs (Data Transfer Objects) usando `class-validator` e `class-transformer`.

#### Exemplo: CreateUrlDto

```typescript
import { IsUrl, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @IsNotEmpty()
  @MaxLength(2048, { message: 'URL deve ter no máximo 2048 caracteres' })
  originalUrl: string;
}
```

#### Exemplo: RegisterDto

```typescript
import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(100)
  password: string;
}
```

### 2. ValidationPipe Global

O NestJS aplica validação automaticamente em todos os endpoints através do `ValidationPipe` global.

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras
    transform: true,        // Transforma tipos automaticamente
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

## Validações por Endpoint

### Autenticação

#### POST /api/auth/register

**Validações:**
- ✅ Email: formato válido, obrigatório, máximo 255 caracteres
- ✅ Senha: obrigatória, mínimo 8 caracteres, máximo 100 caracteres

**Erros possíveis:**
- `400 Bad Request`: Email inválido ou senha muito curta
- `409 Conflict`: Email já cadastrado

#### POST /api/auth/login

**Validações:**
- ✅ Email: formato válido, obrigatório
- ✅ Senha: obrigatória

**Erros possíveis:**
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Credenciais inválidas

### URLs

#### POST /api/urls

**Validações:**
- ✅ originalUrl: formato de URL válido (http:// ou https://), obrigatório, máximo 2048 caracteres
- ✅ Protocolo obrigatório (http ou https)

**Erros possíveis:**
- `400 Bad Request`: URL inválida ou muito longa

#### PUT /api/urls/:id

**Validações:**
- ✅ id: formato UUID válido
- ✅ originalUrl: formato de URL válido, obrigatório, máximo 2048 caracteres

**Erros possíveis:**
- `400 Bad Request`: URL inválida
- `403 Forbidden`: Usuário não é dono da URL
- `404 Not Found`: URL não encontrada ou deletada

#### DELETE /api/urls/:id

**Validações:**
- ✅ id: formato UUID válido

**Erros possíveis:**
- `403 Forbidden`: Usuário não é dono da URL
- `404 Not Found`: URL não encontrada ou deletada

### Redirecionamento

#### GET /:shortCode

**Validações:**
- ✅ shortCode: máximo 6 caracteres, alfanumérico
- ✅ URL não deletada (deleted_at IS NULL)

**Erros possíveis:**
- `404 Not Found`: Código não encontrado ou URL deletada

## Validações no Banco de Dados

### Constraints SQL

O schema SQL inclui constraints para validação adicional:

```sql
-- Tamanho máximo do código curto
CONSTRAINT chk_short_code_length 
    CHECK (LENGTH(short_code) <= 6)

-- URL não pode ser vazia
CONSTRAINT chk_original_url_not_empty 
    CHECK (LENGTH(TRIM(original_url)) > 0)

-- Email único
UNIQUE (email)

-- Código curto único (entre URLs ativas)
CREATE UNIQUE INDEX idx_short_urls_code_active 
    ON short_urls(short_code) 
    WHERE deleted_at IS NULL;
```

## Validações de Negócio

### Geração de Código Curto

- ✅ Máximo 6 caracteres
- ✅ Alfanumérico (a-z, A-Z, 0-9)
- ✅ Único no sistema (verificação de colisão)
- ✅ Retry automático em caso de colisão

### Soft Delete

- ✅ Verificação de `deleted_at IS NULL` em todas as queries
- ✅ URLs deletadas não podem ser acessadas
- ✅ URLs deletadas não podem ser atualizadas

### Ownership

- ✅ Apenas o dono pode atualizar/deletar URL
- ✅ Verificação de `user_id` em operações de modificação

## Mensagens de Erro

Todas as validações retornam mensagens de erro claras e em português:

```json
{
  "statusCode": 400,
  "message": [
    "originalUrl deve ser uma URL válida",
    "originalUrl não pode estar vazio"
  ],
  "error": "Bad Request"
}
```

## Testes de Validação

Todos os DTOs devem ter testes de validação:

```typescript
describe('CreateUrlDto', () => {
  it('should fail with invalid URL', () => {
    const dto = new CreateUrlDto();
    dto.originalUrl = 'not-a-url';
    
    const errors = validateSync(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with valid URL', () => {
    const dto = new CreateUrlDto();
    dto.originalUrl = 'https://example.com';
    
    const errors = validateSync(dto);
    expect(errors.length).toBe(0);
  });
});
```

## Boas Práticas

1. **Validação em Camadas**: DTOs (aplicação) + Constraints (banco)
2. **Mensagens Claras**: Erros em português e descritivos
3. **Whitelist**: Apenas propriedades esperadas são aceitas
4. **Transformação**: Tipos são convertidos automaticamente
5. **Sanitização**: Dados são limpos antes do processamento

## Referências

- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

