# Aliases e Configuração do Shell

Para tornar o uso do sistema de tasks e notes ainda mais rápido, você pode adicionar aliases ao seu shell.

## Bash (.bashrc)

Adicione ao arquivo `~/.bashrc`:

```bash
# Task and Note Management Aliases
export SCRIPTS_DIR="$HOME/documents/github/ecosystem-jrs-soft/scripts"

# Task aliases
alias t='cd $SCRIPTS_DIR && npm run task:list'
alias ta='cd $SCRIPTS_DIR && npm run task:list active'
alias tb='cd $SCRIPTS_DIR && npm run task:list backlog'
alias tc='cd $SCRIPTS_DIR && npm run task:list completed'
alias tn='cd $SCRIPTS_DIR && npm run task:new'
alias ts='cd $SCRIPTS_DIR && npm run task:start'
alias td='cd $SCRIPTS_DIR && npm run task:done'
alias tv='cd $SCRIPTS_DIR && npm run task:view'
alias te='cd $SCRIPTS_DIR && npm run task:edit'
alias tf='cd $SCRIPTS_DIR && npm run task:search'
alias tu='cd $SCRIPTS_DIR && npm run task:update'
alias tstat='cd $SCRIPTS_DIR && npm run task:stats'

# Note aliases
alias nd='cd $SCRIPTS_DIR && npm run note:daily'
alias nm='cd $SCRIPTS_DIR && npm run note:meeting'
alias nt='cd $SCRIPTS_DIR && npm run note:tech'
alias ni='cd $SCRIPTS_DIR && npm run note:til'
alias nl='cd $SCRIPTS_DIR && npm run note:list'
alias nf='cd $SCRIPTS_DIR && npm run note:search'

# Quick navigation
alias goto-tasks='cd $HOME/documents/github/ecosystem-jrs-soft/tasks'
alias goto-notes='cd $HOME/documents/github/ecosystem-jrs-soft/notes'

# Editor configuration
export EDITOR=nano  # Altere para seu editor preferido (code, vim, nano)
```

## Zsh (.zshrc)

Adicione ao arquivo `~/.zshrc`:

```zsh
# Task and Note Management Aliases
export SCRIPTS_DIR="$HOME/documents/github/ecosystem-jrs-soft/scripts"

# Task aliases
alias t='cd $SCRIPTS_DIR && npm run task:list'
alias ta='cd $SCRIPTS_DIR && npm run task:list active'
alias tb='cd $SCRIPTS_DIR && npm run task:list backlog'
alias tc='cd $SCRIPTS_DIR && npm run task:list completed'
alias tn='cd $SCRIPTS_DIR && npm run task:new'
alias ts='cd $SCRIPTS_DIR && npm run task:start'
alias td='cd $SCRIPTS_DIR && npm run task:done'
alias tv='cd $SCRIPTS_DIR && npm run task:view'
alias te='cd $SCRIPTS_DIR && npm run task:edit'
alias tf='cd $SCRIPTS_DIR && npm run task:search'
alias tu='cd $SCRIPTS_DIR && npm run task:update'
alias tstat='cd $SCRIPTS_DIR && npm run task:stats'

# Note aliases
alias nd='cd $SCRIPTS_DIR && npm run note:daily'
alias nm='cd $SCRIPTS_DIR && npm run note:meeting'
alias nt='cd $SCRIPTS_DIR && npm run note:tech'
alias ni='cd $SCRIPTS_DIR && npm run note:til'
alias nl='cd $SCRIPTS_DIR && npm run note:list'
alias nf='cd $SCRIPTS_DIR && npm run note:search'

# Quick navigation
alias goto-tasks='cd $HOME/documents/github/ecosystem-jrs-soft/tasks'
alias goto-notes='cd $HOME/documents/github/ecosystem-jrs-soft/notes'

# Editor configuration
export EDITOR=nano  # Altere para seu editor preferido (code, vim, nano)
```

## Fish (~/.config/fish/config.fish)

Adicione ao arquivo de configuração do Fish:

```fish
# Task and Note Management Aliases
set -gx SCRIPTS_DIR "$HOME/documents/github/ecosystem-jrs-soft/scripts"

# Task aliases
alias t='cd $SCRIPTS_DIR && npm run task:list'
alias ta='cd $SCRIPTS_DIR && npm run task:list active'
alias tb='cd $SCRIPTS_DIR && npm run task:list backlog'
alias tc='cd $SCRIPTS_DIR && npm run task:list completed'
alias tn='cd $SCRIPTS_DIR && npm run task:new'
alias ts='cd $SCRIPTS_DIR && npm run task:start'
alias td='cd $SCRIPTS_DIR && npm run task:done'
alias tv='cd $SCRIPTS_DIR && npm run task:view'
alias te='cd $SCRIPTS_DIR && npm run task:edit'
alias tf='cd $SCRIPTS_DIR && npm run task:search'
alias tu='cd $SCRIPTS_DIR && npm run task:update'
alias tstat='cd $SCRIPTS_DIR && npm run task:stats'

# Note aliases
alias nd='cd $SCRIPTS_DIR && npm run note:daily'
alias nm='cd $SCRIPTS_DIR && npm run note:meeting'
alias nt='cd $SCRIPTS_DIR && npm run note:tech'
alias ni='cd $SCRIPTS_DIR && npm run note:til'
alias nl='cd $SCRIPTS_DIR && npm run note:list'
alias nf='cd $SCRIPTS_DIR && npm run note:search'

# Quick navigation
alias goto-tasks='cd $HOME/documents/github/ecosystem-jrs-soft/tasks'
alias goto-notes='cd $HOME/documents/github/ecosystem-jrs-soft/notes'

# Editor configuration
set -gx EDITOR nano  # Altere para seu editor preferido (code, vim, nano)
```

## Aplicar as Mudanças

Depois de adicionar os aliases:

```bash
# Bash/Zsh
source ~/.bashrc
# ou
source ~/.zshrc

# Fish
source ~/.config/fish/config.fish
```

## Uso com Aliases

Com os aliases configurados, você pode usar comandos muito mais curtos:

```bash
# Em vez de: npm run task:list
t

# Em vez de: npm run task:new "Minha task"
tn "Minha task" -p high

# Em vez de: npm run task:start TASK-001
ts TASK-001

# Em vez de: npm run task:done TASK-001
td TASK-001

# Em vez de: npm run task:view TASK-001
tv TASK-001

# Em vez de: npm run note:daily
nd

# Em vez de: npm run note:meeting "Sprint Planning"
nm "Sprint Planning"

# Ver estatísticas
tstat
```

## Aliases Explicados

### Tasks

- `t` - Listar todas as tasks
- `ta` - Listar tasks ativas
- `tb` - Listar backlog
- `tc` - Listar completadas
- `tn` - Nova task
- `ts` - Start (mover para active)
- `td` - Done (marcar como completa)
- `tv` - View (ver detalhes)
- `te` - Edit (editar)
- `tf` - Find (buscar)
- `tu` - Update (atualizar campo)
- `tstat` - Statistics (estatísticas)

### Notes

- `nd` - Daily note
- `nm` - Meeting note
- `nt` - Technical/ADR note
- `ni` - TIL (Today I Learned)
- `nl` - List notes
- `nf` - Find/search notes

### Navegação

- `goto-tasks` - Ir para pasta de tasks
- `goto-notes` - Ir para pasta de notes

## Funções Avançadas (Opcional)

Você pode criar funções mais avançadas:

### Bash/Zsh

```bash
# Criar task e já começar a trabalhar nela
function tnow() {
    cd $SCRIPTS_DIR
    local output=$(npm run task:new "$@" 2>&1)
    echo "$output"
    local task_id=$(echo "$output" | grep -oP 'TASK-\d+' | head -1)
    if [ ! -z "$task_id" ]; then
        npm run task:start "$task_id"
    fi
}

# Ver task por número (sem precisar digitar TASK-)
function tt() {
    cd $SCRIPTS_DIR
    npm run task:view "TASK-$1"
}

# Buscar e editar task
function tef() {
    cd $SCRIPTS_DIR
    npm run task:search "$@"
    read -p "Enter task ID to edit: " task_id
    if [ ! -z "$task_id" ]; then
        npm run task:edit "$task_id"
    fi
}

# Daily workflow: criar daily note e ver tasks ativas
function daily() {
    cd $SCRIPTS_DIR
    npm run note:daily
    echo "\n"
    npm run task:list active
}
```

### Fish

```fish
# Criar task e já começar a trabalhar nela
function tnow
    cd $SCRIPTS_DIR
    set output (npm run task:new $argv 2>&1)
    echo $output
    set task_id (echo $output | grep -oP 'TASK-\d+' | head -1)
    if test -n "$task_id"
        npm run task:start "$task_id"
    end
end

# Ver task por número
function tt
    cd $SCRIPTS_DIR
    npm run task:view "TASK-$argv[1]"
end

# Daily workflow
function daily
    cd $SCRIPTS_DIR
    npm run note:daily
    echo "\n"
    npm run task:list active
end
```

## Autocomplete (Bash)

Para bash, você pode adicionar autocomplete:

```bash
# Task autocomplete
_task_completion() {
    local cur prev
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    case ${prev} in
        t|task)
            COMPREPLY=( $(compgen -W "list new start done view edit search update stats archive" -- ${cur}) )
            return 0
            ;;
        *)
            ;;
    esac
}

complete -F _task_completion t
```

## Workflow Recomendado

Com os aliases configurados, seu workflow diário pode ser:

```bash
# Manhã
daily                                    # Cria daily note e mostra tasks ativas

# Criar nova task
tn "Implementar feature X" -p high      # Criar task

# Trabalhar
ts TASK-001                              # Começar task
tv TASK-001                              # Ver detalhes
te TASK-001                              # Editar se necessário

# Atualizar progresso
tu TASK-001 estimated 4h                 # Estimar tempo
tu TASK-001 actual 3.5h                  # Tempo real

# Completar
td TASK-001                              # Marcar como completo

# Fim do dia
tstat                                    # Ver estatísticas
t                                        # Ver todas as tasks
```

## Dicas

1. **Personalize os aliases** conforme seu estilo
2. **Use nomes curtos** para comandos que usa muito
3. **Configure o EDITOR** para seu editor preferido
4. **Crie funções** para workflows comuns
5. **Use autocomplete** para comandos mais complexos

## Testando

Depois de configurar, teste:

```bash
t           # Deve listar tasks
tn "Test"   # Deve criar uma task
tstat       # Deve mostrar estatísticas
nd          # Deve criar daily note
```

Se funcionar, você está pronto! 🚀
