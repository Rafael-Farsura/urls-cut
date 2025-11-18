#!/bin/bash

# Script para refatorar commits seguindo Conventional Commits
# ATENÇÃO: Este script modifica o histórico do Git
# Execute apenas se tiver certeza e tenha feito backup

set -e

echo "⚠️  ATENÇÃO: Este script irá modificar o histórico do Git"
echo "Certifique-se de ter feito backup antes de continuar"
echo ""
read -p "Deseja continuar? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operação cancelada"
    exit 1
fi

# Encontrar o commit base mais antigo
BASE_COMMIT=$(git log --reverse --oneline | head -1 | cut -d' ' -f1)
echo "Commit base: $BASE_COMMIT"

# Criar arquivo de instruções para rebase interativo
cat > /tmp/rebase_instructions.txt << 'EOF'
# Instruções para rebase interativo
# Cada linha representa um commit
# 'pick' mantém o commit como está
# 'reword' permite alterar a mensagem do commit
# 'edit' permite editar o commit
# 'squash' combina com o commit anterior
# 'fixup' como squash mas descarta a mensagem

# Commits que precisam ser refatorados:
# 1. Kick-off w/ docs -> docs: adicionar documentação inicial do projeto
# 2. emergency-commit -> chore: commit de emergência - requer revisão e limpeza de código
# 3. refactor: falta resolver auth do gateway -> refactor(gateway): resolver problemas de autenticação no gateway
# 4. Merge pull request -> chore: merge pull request #1 do backup/main-monorepo
# 5. Fix: Auth (401) -> fix(gateway): corrigir autenticação 401 usando header em vez de hardcoded
# 6. chore: reorganizando repo -> chore: reorganizar estrutura do repositório
EOF

echo ""
echo "📝 Arquivo de instruções criado em /tmp/rebase_instructions.txt"
echo ""
echo "Para refatorar os commits manualmente, execute:"
echo "  git rebase -i $BASE_COMMIT^"
echo ""
echo "Ou use o script interativo abaixo:"

# Script interativo para refatorar commits específicos
refactor_commit() {
    local commit_hash=$1
    local new_message=$2
    
    echo "Refatorando commit $commit_hash..."
    git rebase -i "${commit_hash}^" << EOF
reword $commit_hash
$new_message
EOF
}

# Lista de commits para refatorar (do mais antigo para o mais recente)
echo ""
echo "Commits que serão refatorados:"
echo "1. c2fb3c9a - Kick-off w/ docs"
echo "   -> docs: adicionar documentação inicial do projeto"
echo ""
echo "2. 16111eb0 - emergency-commit: precisa de revisao e tambem limpar codigo"
echo "   -> chore: commit de emergência - requer revisão e limpeza de código"
echo ""
echo "3. e0a39a29 - refactor: falta resolver auth do gateway"
echo "   -> refactor(gateway): resolver problemas de autenticação no gateway"
echo ""
echo "4. 3a6dc8b5 - Merge pull request #1"
echo "   -> chore: merge pull request #1 do backup/main-monorepo"
echo ""
echo "5. ed9d67fa - Fix: Auth (401) no Api Gateway"
echo "   -> fix(gateway): corrigir autenticação 401 usando header em vez de hardcoded"
echo ""
echo "6. 3687750f - chore: reorganizando repo"
echo "   -> chore: reorganizar estrutura do repositório"
echo ""

read -p "Deseja executar o rebase interativo agora? (yes/no): " execute_rebase

if [ "$execute_rebase" = "yes" ]; then
    echo "Iniciando rebase interativo..."
    echo "⚠️  Você será redirecionado para o editor. Siga as instruções."
    git rebase -i "$BASE_COMMIT^"
else
    echo "Rebase não executado. Execute manualmente quando estiver pronto."
fi

