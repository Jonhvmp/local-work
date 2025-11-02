# Quick Start Guide 🚀

Este guia rápido mostra os comandos mais úteis para começar a usar o sistema de tasks e notes.

## Instalação

Não precisa instalar nada! O sistema usa apenas Node.js nativo.

```bash
cd scripts
```

## Fluxo de Trabalho Diário

### 1. Comece o dia com uma nota diária

```bash
npm run note:daily
```

Isso cria uma nota para o dia atual e abre no seu editor. Use para planejar o dia e anotar o que fez.

### 2. Crie uma nova task

```bash
npm run task:new "Implementar autenticação com JWT" -p high -a jonhvmp
```

Parâmetros:
- `-p`: prioridade (low, medium, high)
- `-a`: responsável (seu usuário)

### 3. Veja todas as suas tasks

```bash
npm run task:list
```

Ou veja apenas as tasks ativas:

```bash
npm run task:list active
```

### 4. Comece a trabalhar em uma task

```bash
npm run task:start TASK-001
```

Isso move a task para o status "active".

### 5. Veja os detalhes de uma task

```bash
npm run task:view TASK-001
```

Mostra todos os detalhes: status, prioridade, tempo estimado, etc.

### 6. Edite uma task

```bash
npm run task:edit TASK-001
```

Abre a task no seu editor de texto preferido.

### 7. Atualize informações específicas

```bash
# Atualizar tempo estimado
npm run task:update TASK-001 estimated 4h

# Atualizar tempo real gasto
npm run task:update TASK-001 actual 3.5h

# Adicionar tags
npm run task:update TASK-001 tags "backend,security,auth"

# Mudar prioridade
npm run task:update TASK-001 priority medium
```

### 8. Complete a task

```bash
npm run task:done TASK-001
```

Isso move a task para "completed".

### 9. Veja suas estatísticas

```bash
npm run task:stats
```

Mostra:
- Número de tasks por status
- Distribuição de prioridades
- Tempo estimado vs tempo real
- Total de tasks

## Documentando Decisões Técnicas

### Criar um ADR (Architecture Decision Record)

```bash
npm run note:tech "Migração de Next.js 14 para 15"
```

Use para documentar decisões importantes de arquitetura.

## Documentando Aprendizados

### Criar uma nota TIL (Today I Learned)

```bash
npm run note:til "Como usar React Server Components"
```

Use para documentar coisas novas que você aprendeu.

## Reuniões

### Criar nota de reunião

```bash
npm run note:meeting "Sprint Planning - Time Backend"
```

Use para documentar reuniões com agenda e action items.

## Buscar

### Buscar tasks

```bash
npm run task:search "autenticação"
```

### Buscar notas

```bash
npm run note:search "next.js"
```

## Listar

### Listar notas recentes

```bash
npm run note:list
```

### Listar notas de um tipo específico

```bash
npm run note:list technical
npm run note:list learning
npm run note:list meetings
npm run note:list daily
```

## Manutenção

### Arquivar tasks antigas

Tasks completadas há mais de 30 dias são movidas para "archived":

```bash
npm run task:archive
```

Ou especifique o número de dias:

```bash
npm run task:archive 60
```

## Dicas Pro 💡

1. **Configure seu editor preferido:**
   ```bash
   export EDITOR=code  # VS Code
   export EDITOR=vim   # Vim
   ```

2. **Use aliases no seu .bashrc ou .zshrc:**
   ```bash
   alias t='cd ~/path/to/scripts && npm run task:list'
   alias tn='cd ~/path/to/scripts && npm run task:new'
   alias nd='cd ~/path/to/scripts && npm run note:daily'
   ```

3. **Workflow sugerido:**
   - 🌅 Manhã: `note:daily` para planejar o dia
   - 📋 Criar tasks conforme surgem
   - ▶️ `task:start` quando começar a trabalhar
   - ✅ `task:done` quando terminar
   - 📊 `task:stats` no fim do dia para ver progresso
   - 🗄️ `task:archive` no fim do mês

4. **Use tags para organizar:**
   ```bash
   npm run task:update TASK-001 tags "frontend,bug,urgente"
   ```

5. **Busque tasks relacionadas:**
   ```bash
   npm run task:search "login"
   ```

## Exemplos Práticos

### Exemplo 1: Bug urgente

```bash
# Criar task de bug
npm run task:new "Corrigir erro de login no Chrome" -p high -a jonhvmp

# Listar para pegar o ID (ex: TASK-005)
npm run task:list

# Começar a trabalhar
npm run task:start TASK-005

# Adicionar tags
npm run task:update TASK-005 tags "bug,frontend,chrome"

# Atualizar tempo
npm run task:update TASK-005 estimated 2h
npm run task:update TASK-005 actual 1.5h

# Completar
npm run task:done TASK-005
```

### Exemplo 2: Nova feature

```bash
# Criar task
npm run task:new "Implementar sistema de notificações" -p medium

# Criar ADR para decisão técnica
npm run note:tech "Escolha de biblioteca de notificações - Toast vs Notification API"

# Começar
npm run task:start TASK-006

# Criar TIL ao aprender algo
npm run note:til "Como usar Web Notifications API"

# Completar
npm run task:done TASK-006
```

### Exemplo 3: Sprint Planning

```bash
# Criar nota de reunião
npm run note:meeting "Sprint Planning - Sprint 23"

# Criar tasks da sprint
npm run task:new "Refatorar componente Header" -p medium
npm run task:new "Adicionar testes E2E" -p high
npm run task:new "Atualizar documentação" -p low

# Ver todas as tasks
npm run task:list backlog
```

## Estrutura de Arquivos

Depois de usar o sistema, você terá:

```
tasks/
├── active/          # Tasks em andamento
├── backlog/         # Tasks planejadas
├── completed/       # Tasks completadas (últimos 30 dias)
└── archived/        # Tasks antigas

notes/
├── daily/           # 2025-11-01.md, 2025-11-02.md, ...
├── meetings/        # 2025-11-01-sprint-planning.md, ...
├── technical/       # ADR-001-migration.md, ...
└── learning/        # 2025-11-01-react-hooks.md, ...
```

## Ajuda

Para ver todos os comandos disponíveis:

```bash
node cli/task.js
node cli/note.js
```

## Problemas Comuns

**Q: O editor não abre**
```bash
# Configure a variável EDITOR
export EDITOR=nano
```

**Q: Cores não aparecem no terminal**
```bash
# A maioria dos terminais modernos suporta cores ANSI
# Se não funcionar, pode ser limitação do seu terminal
```

**Q: Como mudar o template das tasks/notes?**
```bash
# Edite os arquivos:
# - cli/task.js (função createTask)
# - cli/note.js (funções create*)
```

---

Pronto! Agora você está pronto para usar o sistema de tasks e notes. 🎉
