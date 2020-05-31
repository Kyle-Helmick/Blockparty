# Blockparty

Simple AWS server manager for Minecraft

## BlockpartyService

I mean honestly this should work right out of the box with the install script. But also the install script was tested only once on a kind of already configured ec2 instance so open a ticket if you need help.

## BlockpartyDiscordBot

A. Why do discord bots have to run 24/7.

B. There's no install script for this. It'll eventually need to be like a systemd service (I can probably do some sort of templated systemd file in an install script)

## Minecraft server setup

`sudo yum install java-1.8.0-openjdk python3`

`sudo pip3 install pipenv`

`sudo groupadd minecraft`

`sudo adduser -m -r -s /bin/bash -d /opt/minecraft -g minecraft minecraft`

`sudo su - minecraft`

`wget <https://.../server.jar>`

`echo "eula=true" > /opt/minecraft/eula.txt`

`java -Xms1024M -Xmx4096M -jar server.jar`

Stop the server

Edit server.properties:

```conf
# Minecraft server properties
spawn-protection=0
max-tick-time=60000
query.port=25565
generator-settings=
force-gamemode=false
allow-nether=true
enforce-whitelist=false
gamemode=survival
broadcast-console-to-ops=true
enable-query=false
player-idle-timeout=0
difficulty=easy
spawn-monsters=true
broadcast-rcon-to-ops=true
op-permission-level=4
pvp=true
snooper-enabled=true
level-type=default
hardcore=false
enable-command-block=false
max-players=20
network-compression-threshold=256
resource-pack-sha1=
max-world-size=29999984
function-permission-level=2
rcon.port=25575
server-port=25565
server-ip=
spawn-npcs=true
allow-flight=false
level-name=world
view-distance=10
resource-pack=
spawn-animals=true
white-list=false
rcon.password=password
generate-structures=true
max-build-height=256
online-mode=true
level-seed=
use-native-transport=true
prevent-proxy-connections=false
enable-rcon=true
motd=A Minecraft Server
```

`exit`

`sudo touch /etc/systemd/system/minecraft.service`

```system.d
[Unit]
Description=Minecraft Server
After=network.target

[Service]
WorkingDirectory=/opt/minecraft/
User=minecraft
Group=minecraft

ExecStart=/usr/bin/java -server -Xms1024M -Xmx4096M -XX:+UseG1GC -XX:+CMSIncrementalPacing -XX:+CMSClassUnloadingEnabled -XX:ParallelGCThreads=2 -XX:MinHeapFreeRatio=5 -XX:MaxHeapFreeRatio=10 -jar server.jar

Restart=on-failure
RestartSec=60s

[Install]
WantedBy=multi-user.target
```

`sudo systemctl enable minecraft.service`

---

`sudo su - minecraft`

`git clone https://github.com/Kyle-Helmick/BlockParty blockparty`

`cd Blockparty/BlockpartyService`

Create the cron job config as **config.json**

```json
{
  "server_store": "/opt/minecraft/blockparty/BlockpartyService/blockparty_store.json",
  "servers": {
    "vanilla": {
      "host": "localhost",
      "port": 25575,
      "password": "password"
    }
  }
}
```

`bash install.sh`
