# Coleção Postman - URLs Cut API

Esta pasta contém a coleção Postman completa para testar a API de encurtamento de URLs.

## 📦 Arquivos

- **`URLs-Cut.postman_collection.json`** - Coleção principal com todos os endpoints
- **`URLs-Cut.postman_environment.json`** - Variáveis de ambiente para desenvolvimento local

## 🚀 Como Usar

### 1. Importar no Postman

1. Abra o Postman
2. Clique em **Import** (canto superior esquerdo)
3. Arraste os arquivos `.json` ou selecione-os:
   - `URLs-Cut.postman_collection.json`
   - `URLs-Cut.postman_environment.json`
4. Clique em **Import**

### 2. Configurar Ambiente

1. No canto superior direito do Postman, selecione o ambiente **"URLs Cut - Local"**
2. Verifique/ajuste as variáveis de ambiente:
   - `base_url`: `http://localhost:8080` (API Gateway - padrão para monorepo)
     - Alternativas: `http://localhost:3001` (Auth Service) ou `http://localhost:3002` (URL Service)
   - `test_email`: Seu email de teste
   - `test_password`: Sua senha de teste

> **Nota**: Para o monorepo, use sempre `http://localhost:8080` (API Gateway) como ponto único de entrada.

### 3. Executar Requisições

#### Fluxo Recomendado:

1. **Health Check** → Verifica se a API está rodando
2. **Registrar Usuário** → Cria uma nova conta (ou use Login se já existir)
3. **Login** → Autentica e salva o token automaticamente
4. **Criar URL Encurtada** → Cria uma URL encurtada
5. **Listar URLs** → Lista todas as URLs do usuário
6. **Redirecionar por Short Code** → Testa o redirecionamento

## ✨ Funcionalidades

### Autenticação Automática

A coleção inclui scripts de pré-requisição que fazem login automático quando necessário:

- Se o token `access_token` não existir, o script faz login automaticamente
- O token é salvo automaticamente após login/registro
- O `user_id` também é salvo automaticamente

### Testes Automatizados

Cada requisição inclui testes automatizados que verificam:

- Status codes corretos
- Estrutura das respostas
- Validações de dados
- Headers esperados

### Variáveis Automáticas

As seguintes variáveis são salvas automaticamente:

- `access_token` - Token JWT após login/registro
- `user_id` - ID do usuário autenticado
- `last_short_code` - Último código curto criado
- `last_url_id` - ID da última URL criada

## 📋 Estrutura da Coleção

### 1. Health Check
- `GET /health` - Verifica status da API

### 2. Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login (salva token automaticamente)
- `POST /api/auth/login` - Login com credenciais inválidas (teste de erro)

### 3. URLs
- `POST /api/urls` - Criar URL encurtada (autenticado)
- `POST /api/urls` - Criar URL encurtada (público)
- `GET /api/urls` - Listar URLs do usuário
- `PUT /api/urls/:id` - Atualizar URL
- `DELETE /api/urls/:id` - Deletar URL

### 4. Redirecionamento
- `GET /:shortCode` - Redirecionar para URL original

### 5. Validações e Erros
- Testes de validação de email inválido
- Testes de validação de senha curta
- Testes de URL inválida
- Testes de acesso sem autenticação

## 🔧 Configuração Avançada

### Criar Ambiente de Produção

1. No Postman, clique em **Environments** (ícone de olho)
2. Clique em **+** para criar novo ambiente
3. Configure as variáveis:
   ```json
   {
     "base_url": "https://api.seusite.com",
     "test_email": "seu-email@example.com",
     "test_password": "sua-senha-segura"
   }
   ```

### Executar Coleção Completa

1. Clique na coleção **URLs Cut API**
2. Clique em **Run** (três pontos → Run collection)
3. Selecione o ambiente
4. Clique em **Run URLs Cut API**

## 📝 Notas

- O token JWT expira após 24h (configurável)
- URLs públicas não requerem autenticação
- URLs autenticadas são vinculadas ao usuário
- O redirecionamento contabiliza cliques automaticamente

## 🐛 Troubleshooting

### Token não está sendo salvo

- Verifique se o ambiente está selecionado
- Execute o Login manualmente primeiro
- Verifique os logs do console do Postman (View → Show Postman Console)

### Erro 401 Unauthorized

- Execute o Login novamente
- Verifique se o token não expirou
- Confirme que o ambiente está selecionado

### Erro de conexão

- Verifique se os serviços estão rodando:
  - Monorepo: `docker-compose -f docker-compose.monorepo.yml up -d`
  - Monolítico: `npm run start:dev`
- Confirme que a `base_url` está correta:
  - Monorepo: `http://localhost:8080` (API Gateway)
  - Monolítico: `http://localhost:3000`
- Verifique se as portas estão disponíveis:
  - 8080 (API Gateway)
  - 3001 (Auth Service)
  - 3002 (URL Service)
  - 3000 (Aplicação monolítica)

## 📚 Documentação Adicional

Para mais detalhes sobre a API, consulte:
- `docs/API_SPECIFICATION.md` - Especificação completa da API
- `README.md` - Documentação do projeto

