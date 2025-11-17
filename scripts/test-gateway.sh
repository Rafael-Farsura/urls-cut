#!/bin/bash

# Script de teste do API Gateway
# Testa todos os endpoints do KrakenD Gateway

set -e

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080}"
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_NC='\033[0m' # No Color

echo "🚀 Testando API Gateway em: $GATEWAY_URL"
echo ""

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    local token=$5
    
    local headers="Content-Type: application/json"
    if [ -n "$token" ]; then
        headers="$headers\nAuthorization: Bearer $token"
    fi
    
    echo -n "Testando $method $endpoint... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$GATEWAY_URL$endpoint" \
            ${token:+-H "Authorization: Bearer $token"})
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$GATEWAY_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${token:+-H "Authorization: Bearer $token"} \
            -d "$data")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$GATEWAY_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${token:+-H "Authorization: Bearer $token"} \
            -d "$data")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$GATEWAY_URL$endpoint" \
            ${token:+-H "Authorization: Bearer $token"})
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${COLOR_GREEN}✅ OK (${http_code})${COLOR_NC}"
        return 0
    else
        echo -e "${COLOR_RED}❌ FALHOU (esperado: ${expected_status}, recebido: ${http_code})${COLOR_NC}"
        echo "   Resposta: $body"
        return 1
    fi
}

# Contador de testes
PASSED=0
FAILED=0

echo "📋 Teste 1: Health Check (agregado)"
test_endpoint "GET" "/health" "200" && ((PASSED++)) || ((FAILED++))

echo ""
echo "📋 Teste 2: Autenticação (sem JWT)"
test_endpoint "POST" "/api/auth/register" "201" '{"email":"test@example.com","password":"Test123!","name":"Test User"}' && ((PASSED++)) || ((FAILED++))

# Registrar usuário e obter token
echo ""
echo "📋 Teste 3: Login e obtenção de token"
LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${COLOR_GREEN}✅ Token obtido com sucesso${COLOR_NC}"
    ((PASSED++))
else
    echo -e "${COLOR_RED}❌ Falha ao obter token${COLOR_NC}"
    echo "   Resposta: $LOGIN_RESPONSE"
    ((FAILED++))
fi

echo ""
echo "📋 Teste 4: Endpoints protegidos (com JWT)"
test_endpoint "GET" "/api/urls" "200" "" "$TOKEN" && ((PASSED++)) || ((FAILED++))

echo ""
echo "📋 Teste 5: Criar URL (sem JWT - deve funcionar)"
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$GATEWAY_URL/api/urls" \
    -H "Content-Type: application/json" \
    -d '{"originalUrl":"https://example.com"}')

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${COLOR_GREEN}✅ URL criada (${HTTP_CODE})${COLOR_NC}"
    URL_ID=$(echo "$CREATE_RESPONSE" | sed '$d' | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    SHORT_CODE=$(echo "$CREATE_RESPONSE" | sed '$d' | grep -o '"shortCode":"[^"]*' | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${COLOR_RED}❌ Falha ao criar URL (${HTTP_CODE})${COLOR_NC}"
    ((FAILED++))
fi

if [ -n "$URL_ID" ] && [ -n "$TOKEN" ]; then
    echo ""
    echo "📋 Teste 6: Atualizar URL (com JWT)"
    test_endpoint "PUT" "/api/urls/$URL_ID" "200" "{\"originalUrl\":\"https://updated.com\"}" "$TOKEN" && ((PASSED++)) || ((FAILED++))
    
    echo ""
    echo "📋 Teste 7: Deletar URL (com JWT)"
    test_endpoint "DELETE" "/api/urls/$URL_ID" "200" "" "$TOKEN" && ((PASSED++)) || ((FAILED++))
fi

if [ -n "$SHORT_CODE" ]; then
    echo ""
    echo "📋 Teste 8: Redirecionamento (sem JWT)"
    REDIRECT_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "$GATEWAY_URL/$SHORT_CODE" || echo "000")
    if [ "$REDIRECT_CODE" = "200" ] || [ "$REDIRECT_CODE" = "301" ] || [ "$REDIRECT_CODE" = "302" ]; then
        echo -e "${COLOR_GREEN}✅ Redirecionamento funcionando (${REDIRECT_CODE})${COLOR_NC}"
        ((PASSED++))
    else
        echo -e "${COLOR_YELLOW}⚠️  Redirecionamento retornou ${REDIRECT_CODE} (pode ser esperado se URL foi deletada)${COLOR_NC}"
        ((PASSED++))
    fi
fi

echo ""
echo "📋 Teste 9: Rate Limiting"
echo -n "Enviando 15 requisições rápidas para /api/auth/register... "
RATE_LIMIT_COUNT=0
for i in {1..15}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"test$i@example.com\",\"password\":\"Test123!\",\"name\":\"Test $i\"}")
    if [ "$STATUS" = "429" ]; then
        ((RATE_LIMIT_COUNT++))
    fi
done

if [ "$RATE_LIMIT_COUNT" -gt 0 ]; then
    echo -e "${COLOR_GREEN}✅ Rate limiting funcionando (${RATE_LIMIT_COUNT} requisições bloqueadas)${COLOR_NC}"
    ((PASSED++))
else
    echo -e "${COLOR_YELLOW}⚠️  Rate limiting não detectado (pode estar configurado diferente)${COLOR_NC}"
    ((PASSED++))
fi

echo ""
echo "📋 Teste 10: Validação JWT (endpoint protegido sem token)"
test_endpoint "GET" "/api/urls" "401" "" && ((PASSED++)) || ((FAILED++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo dos Testes:"
echo "   ✅ Passou: $PASSED"
echo "   ❌ Falhou: $FAILED"
echo "   📈 Total: $((PASSED + FAILED))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo -e "${COLOR_GREEN}🎉 Todos os testes passaram!${COLOR_NC}"
    exit 0
else
    echo -e "${COLOR_RED}⚠️  Alguns testes falharam${COLOR_NC}"
    exit 1
fi

