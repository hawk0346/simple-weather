#!/bin/bash
set -e

# ---- Zsh + Starship + plugins installer for dev container ----

echo "==> Installing zsh..."
apt-get update -qq
apt-get install -y -qq zsh curl git > /dev/null 2>&1

echo "==> Installing Starship prompt..."
curl -fsSL https://starship.rs/install.sh | sh -s -- --yes > /dev/null 2>&1

echo "==> Installing zsh-autosuggestions..."
ZSH_PLUGINS_DIR="/usr/local/share/zsh/plugins"
mkdir -p "$ZSH_PLUGINS_DIR"
if [ ! -d "$ZSH_PLUGINS_DIR/zsh-autosuggestions" ]; then
  git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions "$ZSH_PLUGINS_DIR/zsh-autosuggestions"
fi

echo "==> Installing zsh-syntax-highlighting..."
if [ ! -d "$ZSH_PLUGINS_DIR/zsh-syntax-highlighting" ]; then
  git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_PLUGINS_DIR/zsh-syntax-highlighting"
fi

echo "==> Copying config files..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/.zshrc" /root/.zshrc
mkdir -p /root/.config
cp "$SCRIPT_DIR/starship.toml" /root/.config/starship.toml

echo "==> Setting zsh as default shell..."
chsh -s "$(which zsh)" root 2>/dev/null || true

echo "==> Shell setup complete!"
