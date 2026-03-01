#!/usr/bin/env bash
set -euo pipefail

sudo apt update
sudo apt install -y ca-certificates curl git ufw
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"

echo "Done. Re-login then run: docker --version"
