# 📊 Codecov Setup Guide

## Passo 1: Obter o Token do Codecov

1. Acesse: https://codecov.io/gh/Jonhvmp/local-work
2. Se ainda não adicionou o repositório:
   - Faça login com GitHub
   - Clique em "Add repository"
   - Selecione `Jonhvmp/local-work`
3. Na página do projeto, vá para **Settings** → **General**
4. Copie o **Repository Upload Token** (algo como `abc123-def456-...`)

## Passo 2: Adicionar Token como Secret no GitHub

1. Acesse: https://github.com/Jonhvmp/local-work/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Preencha:
   - **Name:** `CODECOV_TOKEN`
   - **Value:** Cole o token que você copiou do Codecov
4. Clique em **"Add secret"**

## Passo 3: Atualizar o Workflow (se necessário)

O workflow já está configurado corretamente! Verifique que existe esta seção:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  if: matrix.node-version == '20.x'
  with:
    files: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
```

## Passo 4: Fazer um Push para Ativar

Qualquer push para a branch `main` ou `develop` irá:

1. ✅ Executar os testes
2. ✅ Gerar o relatório de cobertura (`coverage/lcov.info`)
3. ✅ Fazer upload para o Codecov automaticamente

## Passo 5: Verificar no Codecov

Após o workflow executar:

1. Acesse: https://codecov.io/gh/Jonhvmp/local-work
2. Você verá:
   - 📊 Gráfico de cobertura ao longo do tempo
   - 📁 Cobertura por arquivo
   - 🔍 Linhas cobertas/não cobertas
   - 📈 Tendências de cobertura

## 🎯 O que acontece automaticamente:

- **Todo push/PR** → CI executa → Upload de cobertura
- **Badge no README** → Atualizado automaticamente
- **Comentários em PRs** → Codecov comenta mudanças de cobertura
- **Status checks** → Codecov reporta se cobertura caiu/subiu

## ✨ Badges no README

O badge já está configurado:

```markdown
[![codecov](https://codecov.io/gh/Jonhvmp/local-work/branch/main/graph/badge.svg)](https://codecov.io/gh/Jonhvmp/local-work)
```

## 🔧 Troubleshooting

### Se o upload falhar:

1. **Verifique o token:**

   ```bash
   # No GitHub Actions, você verá erro se o token estiver errado
   ```

2. **Verifique o arquivo de cobertura:**

   ```bash
   # Deve existir: coverage/lcov.info
   npm run test:coverage
   ls -la coverage/
   ```

3. **Verifique os logs do workflow:**
   - Acesse: https://github.com/Jonhvmp/local-work/actions
   - Clique no workflow que falhou
   - Veja os logs da step "Upload coverage to Codecov"

## 📝 Notas Importantes

- ✅ Token do Codecov é **diferente** do token do NPM
- ✅ Upload só acontece no Node.js 20.x (para evitar uploads duplicados)
- ✅ `fail_ci_if_error: false` - não falha o CI se Codecov tiver problema
- ✅ Coverage é gerado com `npm run test:coverage`

## 🎉 Pronto!

Após seguir esses passos, seu repositório terá:

- ✅ Coverage tracking automático
- ✅ Badge de cobertura no README
- ✅ Relatórios detalhados no Codecov
- ✅ Comentários automáticos em PRs
