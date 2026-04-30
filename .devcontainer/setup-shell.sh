#!/bin/bash
set -e

# ---- Zsh + Starship + plugins installer for dev container ----

echo "==> Installing zsh..."
apt-get update -qq
apt-get install -y -qq zsh curl git openssh-client

echo "==> Installing Starship prompt..."
STARSHIP_VERSION="v1.22.1"
curl -fsSL "https://github.com/starship/starship/releases/download/${STARSHIP_VERSION}/starship-x86_64-unknown-linux-musl.tar.gz" -o /tmp/starship.tar.gz
tar -xzf /tmp/starship.tar.gz -C /tmp
install -m 755 /tmp/starship /usr/local/bin/starship
rm -f /tmp/starship.tar.gz /tmp/starship

echo "==> Installing zsh-autosuggestions..."
ZSH_PLUGINS_DIR="/usr/local/share/zsh/plugins"
ZSH_AUTOSUGGESTIONS_VERSION="v0.7.1"
ZSH_SYNTAX_HIGHLIGHTING_VERSION="0.8.0"
mkdir -p "$ZSH_PLUGINS_DIR"
if [ ! -d "$ZSH_PLUGINS_DIR/zsh-autosuggestions" ]; then
  git clone --branch "$ZSH_AUTOSUGGESTIONS_VERSION" --depth=1 https://github.com/zsh-users/zsh-autosuggestions "$ZSH_PLUGINS_DIR/zsh-autosuggestions"
fi

echo "==> Installing zsh-syntax-highlighting..."
if [ ! -d "$ZSH_PLUGINS_DIR/zsh-syntax-highlighting" ]; then
  git clone --branch "$ZSH_SYNTAX_HIGHLIGHTING_VERSION" --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_PLUGINS_DIR/zsh-syntax-highlighting"
fi

echo "==> Copying config files..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/.zshrc" /root/.zshrc
mkdir -p /root/.config
cp "$SCRIPT_DIR/starship.toml" /root/.config/starship.toml

echo "==> Setting zsh as default shell..."
chsh -s "$(command -v zsh)" root 2>/dev/null || true

echo "==> Shell setup complete!"
