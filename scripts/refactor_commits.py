#!/usr/bin/env python3
"""
Script para refatorar commits seguindo Conventional Commits
ATENÇÃO: Este script modifica o histórico do Git
"""

import subprocess
import sys
import re

# Mapeamento de commits antigos para novos formatos
COMMIT_REFACTORING = {
    "3687750f": {
        "old": "chore: reorganizando repo",
        "new": "chore: reorganizar estrutura do repositório",
        "type": "chore"
    },
    "ed9d67fa": {
        "old": "Fix: Auth (401) no Api Gateway trocando de hardcoded pra header",
        "new": "fix(gateway): corrigir autenticação 401 usando header em vez de hardcoded",
        "type": "fix"
    },
    "3a6dc8b5": {
        "old": "Merge pull request #1 from Rafael-Farsura/backup/main-monorepo",
        "new": "chore: merge pull request #1 do backup/main-monorepo",
        "type": "chore"
    },
    "e0a39a29": {
        "old": "refactor: falta resolver auth do gateway",
        "new": "refactor(gateway): resolver problemas de autenticação no gateway",
        "type": "refactor"
    },
    "16111eb0": {
        "old": "emergency-commit: precisa de revisao e tambem limpar codigo",
        "new": "chore: commit de emergência - requer revisão e limpeza de código",
        "type": "chore"
    },
    "c2fb3c9a": {
        "old": "Kick-off w/ docs",
        "new": "docs: adicionar documentação inicial do projeto",
        "type": "docs"
    }
}

def get_commit_hash(short_hash):
    """Obtém o hash completo do commit"""
    try:
        result = subprocess.run(
            ["git", "rev-parse", short_hash],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return None

def get_current_branch():
    """Obtém o nome da branch atual"""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return None

def check_clean_working_tree():
    """Verifica se a working tree está limpa"""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip() == ""
    except subprocess.CalledProcessError:
        return False

def main():
    print("🔧 Script de Refatoração de Commits")
    print("=" * 50)
    print()
    
    # Verificar se estamos em uma branch limpa
    if not check_clean_working_tree():
        print("❌ Erro: Working tree não está limpa")
        print("Por favor, faça commit ou stash das mudanças antes de continuar")
        sys.exit(1)
    
    branch = get_current_branch()
    print(f"Branch atual: {branch}")
    print()
    
    print("⚠️  ATENÇÃO: Este script irá modificar o histórico do Git")
    print("Certifique-se de ter feito backup antes de continuar")
    print()
    
    confirm = input("Deseja continuar? (yes/no): ")
    if confirm.lower() != "yes":
        print("Operação cancelada")
        sys.exit(0)
    
    print()
    print("📝 Commits que serão refatorados:")
    print()
    
    for short_hash, info in COMMIT_REFACTORING.items():
        full_hash = get_commit_hash(short_hash)
        if full_hash:
            print(f"  {short_hash[:8]}: {info['old']}")
            print(f"    -> {info['new']}")
            print()
        else:
            print(f"  ⚠️  Commit {short_hash} não encontrado")
            print()
    
    print()
    print("Para refatorar os commits, execute manualmente:")
    print("  git rebase -i <commit-base>")
    print()
    print("Ou use o script interativo:")
    print("  git rebase -i c2fb3c9a^")
    print()
    print("No editor, altere 'pick' para 'reword' nos commits que deseja refatorar")
    print()

if __name__ == "__main__":
    main()

