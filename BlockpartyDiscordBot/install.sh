#!/bin/bash

npm install

dir=$(pwd)
node=$(which node)
user=$(whoami)
discord_server=$1

if [ $# -eq 0 ]
    then
        echo "You must supply a discord server name:"
        echo "./install.sh <discord-server-name>"
        exit 1
fi

cp config/default.json config/$1.json

(
cat <<HEREDOC
[Unit]
Description=Discord bot for Blockparty
After=network.target

[Service]
Type=simple
User=$user
WorkingDirectory=$dir
Environment=NODE_ENV=$1
ExecStart=$node $dir/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
HEREDOC
) > blockpartydiscordbot.$1.service

chmod 644 blockpartydiscordbot.$1.service

sudo mv blockpartydiscordbot.$1.service /etc/systemd/system

sudo systemctl daemon-reload

sudo systemctl start blockpartydiscordbot.$1

sudo systemctl enable blockpartydiscordbot.$1
