#!/bin/bash

npm install

dir=$(pwd)
node=$(which node)
user=$(whoami)

(
cat <<HEREDOC
[Unit]
Description=Discord bot for Blockparty
After=network.target

[Service]
Type=simple
User=$user
WorkingDirectory=$dir
ExecStart=$node $dir/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
HEREDOC
) > blockpartydiscordbot.service

chmod 644 blockpartydiscordbot.service

sudo mv blockpartydiscordbot.service /etc/systemd/system

sudo systemctl daemon-reload

sudo systemctl start blockpartydiscordbot

sudo systemctl enable blockpartydiscordbot

