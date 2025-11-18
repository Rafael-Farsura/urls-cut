# Guia de Refatoração de Commits

Este guia explica como refatorar commits para seguir o padrão [Conventional Commits](https://www.conventionalcommits.org/).

## ⚠️ Aviso Importante

Refatorar commits **modifica o histórico do Git**. Isso pode afetar:
- Tags existentes
- Branches que apontam para commits refatorados
- Pull requests abertos
- Colaboradores que já fizeram clone do repositório

**Sempre faça backup antes de refatorar commits!**

## Commits que Precisam ser Refatorados

### 1. `c2fb3c9a` - "Kick-off w/ docs"
**Atual:** `Kick-off w/ docs`  
**Novo:** `docs: adicionar documentação inicial do projeto`

### 2. `16111eb0` - "emergency-commit"
**Atual:** `emergency-commit: precisa de revisao e tambem limpar codigo`  
**Novo:** `chore: commit de emergência - requer revisão e limpeza de código`

### 3. `e0a39a29` - "refactor: falta resolver auth do gateway"
**Atual:** `refactor: falta resolver auth do gateway`  
**Novo:** `refactor(gateway): resolver problemas de autenticação no gateway`

### 4. `3a6dc8b5` - "Merge pull request"
**Atual:** `Merge pull request #1 from Rafael-Farsura/backup/main-monorepo`  
**Novo:** `chore: merge pull request #1 do backup/main-monorepo`

### 5. `ed9d67fa` - "Fix: Auth (401)"
**Atual:** `Fix: Auth (401) no Api Gateway trocando de hardcoded pra header`  
**Novo:** `fix(gateway): corrigir autenticação 401 usando header em vez de hardcoded`

### 6. `3687750f` - "chore: reorganizando repo"
**Atual:** `chore: reorganizando repo`  
**Novo:** `chore: reorganizar estrutura do repositório`

## Como Executar a Refatoração

### Opção 1: Rebase Interativo Manual (Recomendado)

1. **Fazer backup:**
   ```bash
   git branch backup-before-rebase
   git tag backup-tags-$(date +%Y%m%d)
   ```

2. **Iniciar rebase interativo:**
   ```bash
   git rebase -i c2fb3c9a^
   ```

3. **No editor, altere os commits:**
   - Para cada commit que deseja refatorar, mude `pick` para `reword`
   - Salve e feche o editor

4. **Para cada commit marcado como `reword`:**
   - O Git abrirá o editor novamente
   - Altere a mensagem do commit conforme o mapeamento acima
   - Salve e feche

5. **Verificar resultado:**
   ```bash
   git log --oneline -10
   ```

### Opção 2: Script Automatizado

Execute o script Python:
```bash
python3 scripts/refactor_commits.py
```

O script mostrará os commits que serão refatorados e instruções para prosseguir.

## Verificação Pós-Refatoração

Após refatorar os commits, verifique:

1. **Tags ainda apontam para os commits corretos:**
   ```bash
   git tag -l
   git show v0.7.1  # Verificar se ainda funciona
   ```

2. **Branches não foram afetados:**
   ```bash
   git branch -a
   git log --oneline --graph --all -20
   ```

3. **Histórico está correto:**
   ```bash
   git log --oneline
   ```

## Se Algo Der Errado

Se o rebase falhar ou você quiser desfazer:

```bash
# Abortar rebase em andamento
git rebase --abort

# Ou restaurar do backup
git reset --hard backup-before-rebase
```

## Atualizar Tags (se necessário)

Se os commits refatorados afetarem tags, você precisará recriá-las:

```bash
# Listar tags
git tag -l

# Deletar tag local (se necessário)
git tag -d v0.7.1

# Recriar tag no commit correto
git tag v0.7.1 <commit-hash>

# Forçar push da tag (CUIDADO!)
git push origin v0.7.1 --force
```

## Referências

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Rebase Interactive](https://git-scm.com/docs/git-rebase#_interactive_mode)
- [docs/COMMIT_CONVENTIONS.md](./COMMIT_CONVENTIONS.md) - Convenções de commits do projeto

