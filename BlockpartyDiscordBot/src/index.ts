import 'module-alias/register'
import { DISCORD_TOKEN } from '@constants/index'
import { validateConfig } from '@config-helper/index'
import {
  botIsntAuthor,
  botWasMentioned,
  extractArgs,
} from '@discord-helper/index'
import config from 'config'
import Discord, { Client, ClientUser, Message } from 'discord.js'

validateConfig()

const client: Client = new Discord.Client()

client.on('ready', () => {
  if (client.user) {
    const bot: ClientUser = client.user
    console.log(`🚀 Logged in as ${bot.tag}!`)
  } else {
    throw new Error("The bot's user is undefined")
  }
})

client.on('message', (msg: Message) => {
  if (client.user) {
    const bot: ClientUser = client.user

    if (botWasMentioned(bot, msg) && botIsntAuthor(bot, msg)) {
      const args: String[] = extractArgs(bot, msg)

      console.log(args)
    }
  } else {
    throw new Error("The bot's user is undefined")
  }
})

client.login(config.get(DISCORD_TOKEN))
