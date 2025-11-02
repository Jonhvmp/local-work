# GitHub Actions CI/CD Documentation

## Overview

Este projeto utiliza GitHub Actions para automação de testes, validação de código e publicação no NPM.

## Workflows Implementados

### 1. CI (Integração Contínua) - `ci.yml`

**Trigger:** Push ou PR nas branches `main` e `develop`

**Jobs:**

#### Test

- Executa em múltiplas versões do Node.js (14, 16, 18, 20)
- Instala dependências com cache
- Executa linter (ESLint)
- Executa suite de testes (Jest)
- Gera cobertura de código
- Upload de cobertura para Codecov (apenas Node 20)

#### Lint

- Valida formatação com ESLint
- Verifica formatação com Prettier
- Executa apenas no Node.js 20

#### Build

- Valida estrutura do pacote npm
- Verifica arquivos binários executáveis
- Testa comandos CLI básicos

**Comandos executados:**

```bash
npm ci
npm run lint
npm test
npm run test:coverage
npm run format:check
npm pack --dry-run
```

### 2. Publish (Publicação NPM) - `publish.yml`

**Trigger:** Push de tags no formato `v*.*.*` (exemplo: v2.0.0)

**Processo:**

1. Checkout do código
2. Setup Node.js 20 com NPM registry
3. Instalação de dependências
4. Execução de testes
5. Validação de lint
6. Verificação de versão (tag vs package.json)
7. Publicação no NPM com provenance
8. Criação de GitHub Release com notas

**Requisitos:**

- Secret `NPM_TOKEN` configurado no repositório
- Versão no package.json deve corresponder à tag

**Exemplo de publicação:**

```bash
# 1. Atualizar versão no package.json
npm version 2.1.0 --no-git-tag-version

# 2. Commit e push
git add package.json
git commit -m "chore: bump version to 2.1.0"
git push origin main

# 3. Criar e push tag
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0

# 4. GitHub Actions executará automaticamente a publicação
```

### 3. Release (Criação de Release) - `release.yml`

**Trigger:** Manual via workflow_dispatch

**Input:** Versão desejada (exemplo: 2.1.0)

**Processo:**

1. Checkout do código com histórico completo
2. Execução de testes e lint
3. Atualização da versão no package.json
4. Geração automática de changelog
5. Commit da nova versão
6. Criação e push da tag
7. Criação de GitHub Release com changelog

**Como usar:**

1. Acesse: Actions → Release → Run workflow
2. Digite a versão (exemplo: 2.1.0)
3. Clique em "Run workflow"
4. GitHub Actions criará o release e acionará o workflow de publicação

**Changelog automático:**

- Lista todos os commits desde a última tag
- Formato: `- commit message (hash)`
- Incluído automaticamente na release notes

## Configuração Necessária

### Secrets do GitHub

#### NPM_TOKEN

1. Acesse: https://www.npmjs.com/
2. Settings → Access Tokens → Generate New Token
3. Tipo: Automation (para CI/CD)
4. Copie o token
5. No GitHub: Settings → Secrets → New repository secret
6. Nome: `NPM_TOKEN`
7. Value: Cole o token do NPM

### Codecov (Opcional)

Para cobertura de código:

1. Acesse: https://codecov.io
2. Conecte o repositório GitHub
3. O token será automaticamente detectado via GitHub Actions

## Proteção de Branches

Recomendações para branch `main`:

```
Settings → Branches → Add rule → main

✅ Require a pull request before merging
✅ Require status checks to pass before merging
   - Test (Node.js 14.x)
   - Test (Node.js 16.x)
   - Test (Node.js 18.x)
   - Test (Node.js 20.x)
   - Lint and Format Check
   - Build and Package Check
✅ Require branches to be up to date before merging
```

## Badges no README

```markdown
[![CI Status](https://github.com/jonhvmp/local-work/workflows/CI/badge.svg)](https://github.com/jonhvmp/local-work/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/jonhvmp/local-work/branch/main/graph/badge.svg)](https://codecov.io/gh/jonhvmp/local-work)
[![npm version](https://img.shields.io/npm/v/local-work.svg)](https://www.npmjs.com/package/local-work)
```

## Fluxo de Desenvolvimento

### Feature Development

```bash
# 1. Criar branch
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e testar localmente
npm test
npm run lint

# 3. Commit e push
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade

# 4. Criar PR no GitHub
# CI executará automaticamente todos os testes

# 5. Após aprovação, merge para main
# CI executará novamente na branch main
```

### Release Process

```bash
# Opção 1: Manual
npm version patch  # ou minor/major
git push origin main
git push origin --tags

# Opção 2: Via GitHub Actions (Recomendado)
# Actions → Release → Run workflow → Digite versão
```

## Troubleshooting

### Testes falhando no CI mas passando localmente

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm test
```

### Publish falhando

- Verificar se NPM_TOKEN está configurado
- Verificar se versão no package.json corresponde à tag
- Verificar se já existe versão publicada no NPM

### Coverage não aparecendo no Codecov

- Verificar se repositório está conectado no Codecov
- Verificar se workflow tem permissão de escrita
- Pode levar alguns minutos para aparecer

## Arquivos de Configuração

```
.github/
└── workflows/
    ├── ci.yml         # Integração contínua
    ├── publish.yml    # Publicação NPM
    └── release.yml    # Criação de releases
```

## Monitoramento

### GitHub Actions

- **URL:** https://github.com/jonhvmp/local-work/actions
- **Status:** Visualizar status de todos os workflows
- **Logs:** Acessar logs detalhados de cada execução

### NPM

- **URL:** https://www.npmjs.com/package/local-work
- **Downloads:** Estatísticas de downloads
- **Versions:** Histórico de versões publicadas

### Codecov

- **URL:** https://codecov.io/gh/jonhvmp/local-work
- **Coverage:** Cobertura de código ao longo do tempo
- **Trends:** Tendências de cobertura
