#!/bin/bash

# Script de teste do CI/CD
# Verifica se os workflows do GitHub Actions estão configurados corretamente

set -e

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_NC='\033[0m' # No Color

echo "🔍 Verificando configuração de CI/CD"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Verificar se .github/workflows existe
if [ ! -d ".github/workflows" ]; then
    echo -e "${COLOR_YELLOW}⚠️  Diretório .github/workflows não encontrado${COLOR_NC}"
    echo "   Criando estrutura básica..."
    mkdir -p .github/workflows
    ((WARNINGS++))
fi

# Verificar workflows esperados
EXPECTED_WORKFLOWS=("ci.yml" "release.yml")

for workflow in "${EXPECTED_WORKFLOWS[@]}"; do
    if [ -f ".github/workflows/$workflow" ]; then
        echo -e "${COLOR_GREEN}✅ Workflow encontrado: $workflow${COLOR_NC}"
        ((PASSED++))
    else
        echo -e "${COLOR_RED}❌ Workflow não encontrado: $workflow${COLOR_NC}"
        ((FAILED++))
    fi
done

echo ""
echo "📋 Verificando conteúdo dos workflows..."

# Verificar ci.yml
if [ -f ".github/workflows/ci.yml" ]; then
    echo ""
    echo "🔍 Analisando .github/workflows/ci.yml:"
    
    # Verificar jobs esperados
    if grep -q "name:" .github/workflows/ci.yml; then
        WORKFLOW_NAME=$(grep "name:" .github/workflows/ci.yml | head -1 | sed 's/name: //' | tr -d '"')
        echo -e "   ${COLOR_BLUE}Nome: $WORKFLOW_NAME${COLOR_NC}"
    fi
    
    # Verificar jobs
    if grep -q "jobs:" .github/workflows/ci.yml; then
        echo -e "   ${COLOR_GREEN}✅ Jobs definidos${COLOR_NC}"
        ((PASSED++))
    else
        echo -e "   ${COLOR_RED}❌ Nenhum job encontrado${COLOR_NC}"
        ((FAILED++))
    fi
    
    # Verificar steps comuns
    STEPS=("lint" "test" "build")
    for step in "${STEPS[@]}"; do
        if grep -qi "$step" .github/workflows/ci.yml; then
            echo -e "   ${COLOR_GREEN}✅ Step '$step' encontrado${COLOR_NC}"
            ((PASSED++))
        else
            echo -e "   ${COLOR_YELLOW}⚠️  Step '$step' não encontrado${COLOR_NC}"
            ((WARNINGS++))
        fi
    done
fi

# Verificar release.yml
if [ -f ".github/workflows/release.yml" ]; then
    echo ""
    echo "🔍 Analisando .github/workflows/release.yml:"
    
    if grep -q "name:" .github/workflows/release.yml; then
        WORKFLOW_NAME=$(grep "name:" .github/workflows/release.yml | head -1 | sed 's/name: //' | tr -d '"')
        echo -e "   ${COLOR_BLUE}Nome: $WORKFLOW_NAME${COLOR_NC}"
    fi
    
    # Verificar trigger de release
    if grep -qi "release:" .github/workflows/release.yml || grep -qi "tags:" .github/workflows/release.yml; then
        echo -e "   ${COLOR_GREEN}✅ Trigger de release configurado${COLOR_NC}"
        ((PASSED++))
    else
        echo -e "   ${COLOR_YELLOW}⚠️  Trigger de release não encontrado${COLOR_NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo "📋 Verificando arquivos de configuração relacionados..."

# Verificar package.json para scripts de CI
if [ -f "package.json" ]; then
    if grep -q "\"lint\"" package.json; then
        echo -e "${COLOR_GREEN}✅ Script 'lint' encontrado no package.json${COLOR_NC}"
        ((PASSED++))
    fi
    
    if grep -q "\"test\"" package.json; then
        echo -e "${COLOR_GREEN}✅ Script 'test' encontrado no package.json${COLOR_NC}"
        ((PASSED++))
    fi
    
    if grep -q "\"build\"" package.json; then
        echo -e "${COLOR_GREEN}✅ Script 'build' encontrado no package.json${COLOR_NC}"
        ((PASSED++))
    fi
fi

# Verificar se há Dockerfiles (necessários para CI/CD)
if [ -f "Dockerfile" ] || [ -f "services/auth-service/Dockerfile" ]; then
    echo -e "${COLOR_GREEN}✅ Dockerfiles encontrados${COLOR_NC}"
    ((PASSED++))
else
    echo -e "${COLOR_YELLOW}⚠️  Dockerfiles não encontrados${COLOR_NC}"
    ((WARNINGS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo da Verificação:"
echo "   ✅ Passou: $PASSED"
echo "   ❌ Falhou: $FAILED"
echo "   ⚠️  Avisos: $WARNINGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${COLOR_GREEN}🎉 CI/CD configurado corretamente!${COLOR_NC}"
    else
        echo -e "${COLOR_YELLOW}⚠️  CI/CD configurado com alguns avisos${COLOR_NC}"
    fi
    exit 0
else
    echo -e "${COLOR_RED}❌ CI/CD precisa de correções${COLOR_NC}"
    exit 1
fi

