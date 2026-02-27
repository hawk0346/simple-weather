#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/init-prototype.sh <new-project-name>

Example:
  scripts/init-prototype.sh my-next-weather-app
EOF
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

new_name="$1"

NEW_NAME="$new_name" bun -e "$(cat <<'JS'
const fs = require('node:fs');
const newName = process.env.NEW_NAME;

const packagePath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.name = newName;
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const devcontainerPath = '.devcontainer/devcontainer.json';
const devcontainer = JSON.parse(fs.readFileSync(devcontainerPath, 'utf8'));
devcontainer.name = `${newName}-dev`;
fs.writeFileSync(devcontainerPath, `${JSON.stringify(devcontainer, null, 2)}\n`);
JS
)"

if [[ -f README.md ]]; then
  if grep -q '^# ' README.md; then
    sed -i "1s|^# .*|# ${new_name}|" README.md
  fi
fi

echo "Prototype initialized."
echo "- package.json name -> ${new_name}"
echo "- .devcontainer/devcontainer.json name -> ${new_name}-dev"
echo "- README.md title updated"
