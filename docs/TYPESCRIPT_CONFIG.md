# Configuração TypeScript - Guia de Resolução de Problemas

## Problema: TS5110 - Incompatibilidade module/moduleResolution

### Erro Comum

```
error TS5110: Option 'module' must be set to 'Node16' when option 'moduleResolution' is set to 'Node16'.
```

### Causa

Quando você usa `moduleResolution: "node16"` no `tsconfig.json`, o TypeScript **exige** que `module` também seja `"Node16"`. No entanto, o **NestJS requer** `module: "commonjs"` para funcionar corretamente.

### Solução

**Use `moduleResolution: "node"` em vez de `"node16"`**

```json
{
  "compilerOptions": {
    "module": "commonjs",           // ✅ Necessário para NestJS
    "moduleResolution": "node",       // ✅ Compatível com commonjs
    // ... outras opções
  }
}
```

### Por que isso funciona?

- `moduleResolution: "node"` é compatível com `module: "commonjs"`
- `moduleResolution: "node16"` exige `module: "Node16"` (ESM)
- NestJS funciona melhor com CommonJS (`module: "commonjs"`)

### Diferenças entre moduleResolution

| moduleResolution | Compatível com module | Uso recomendado |
|-----------------|----------------------|------------------|
| `"node"` | `"commonjs"` | ✅ NestJS, projetos Node.js tradicionais |
| `"node16"` | `"Node16"` | ESM (ES Modules) puro |
| `"bundler"` | `"ESNext"` | Bundlers (webpack, vite) |

### Configuração Recomendada para NestJS

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "ES2021",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": false
  }
}
```

### Quando usar node16?

Use `moduleResolution: "node16"` apenas se:
- Você está usando **ES Modules puro** (`.mjs`, `type: "module"` no package.json)
- Não está usando NestJS ou frameworks que dependem de CommonJS
- Quer usar recursos modernos do Node.js 16+ para ESM

### Checklist de Verificação

- [ ] `module: "commonjs"` está definido
- [ ] `moduleResolution: "node"` está definido (não `"node16"`)
- [ ] `esModuleInterop: true` está definido
- [ ] `allowSyntheticDefaultImports: true` está definido

### Referências

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [NestJS TypeScript Configuration](https://docs.nestjs.com/cli/monorepo#typescript-configuration)

---

**Última atualização:** 2025-11-17

