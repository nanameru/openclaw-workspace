#!/usr/bin/env bash
set -euo pipefail

SERVICE_PATH=/etc/systemd/system/jp-transcript-extractor.service
WORKDIR=${1:-$HOME/extractor-api}

sudo tee "$SERVICE_PATH" > /dev/null <<EOF
[Unit]
Description=JP Transcript Extractor API (Docker Compose)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory=$WORKDIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
RemainAfterExit=yes
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable jp-transcript-extractor
sudo systemctl start jp-transcript-extractor
sudo systemctl status jp-transcript-extractor --no-pager
