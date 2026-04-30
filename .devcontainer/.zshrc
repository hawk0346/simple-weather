# ---- Zsh configuration for simple-weather dev container ----

# ---- History ----
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt SHARE_HISTORY
setopt APPEND_HISTORY
setopt INC_APPEND_HISTORY

# ---- Key bindings ----
bindkey -e
bindkey '^[[A' history-search-backward
bindkey '^[[B' history-search-forward
bindkey '^[[H' beginning-of-line
bindkey '^[[F' end-of-line
bindkey '^[[3~' delete-char

# ---- Completion ----
autoload -Uz compinit && compinit -C
zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"
zstyle ':completion:*:descriptions' format '%F{cyan}-- %d --%f'
zstyle ':completion:*:warnings' format '%F{red}-- no matches --%f'

# ---- Plugins ----
ZSH_PLUGINS_DIR="/usr/local/share/zsh/plugins"
[ -f "$ZSH_PLUGINS_DIR/zsh-autosuggestions/zsh-autosuggestions.zsh" ] && \
  source "$ZSH_PLUGINS_DIR/zsh-autosuggestions/zsh-autosuggestions.zsh"
[ -f "$ZSH_PLUGINS_DIR/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ] && \
  source "$ZSH_PLUGINS_DIR/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"

# Auto-suggestions style
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=244"
ZSH_AUTOSUGGEST_STRATEGY=(history completion)

# ---- Aliases ----
alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline --graph -20'
alias gp='git pull'
alias dev='bun run dev:all'
alias t='bun test'
alias tc='bunx tsc --noEmit'
alias lint='bunx biome check src'

# ---- Environment ----
export EDITOR=vi
export LANG=en_US.UTF-8

# Backward compat: source .bashrc env vars (e.g. GH_TOKEN)
[ -f ~/.bashrc ] && source ~/.bashrc 2>/dev/null

# ---- Starship prompt ----
eval "$(starship init zsh)"
