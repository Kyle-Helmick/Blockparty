import { ClientUser, Message } from 'discord.js'

function botIsntAuthor(bot: ClientUser, msg: Message): boolean {
  return msg.mentions.users.get(bot.id) !== undefined
}

function botWasMentioned(bot: ClientUser, msg: Message): boolean {
  return msg.author.id !== bot.id
}

function extractArgs(bot: ClientUser, msg: Message): String[] {
  const message: String[] = msg.content.replace(/\s\s+/g, ' ').split(' ')

  if (message.length === 1) {
    return ['help']
  }

  const mentionIndex: number = message.indexOf(`<@!${bot.id}>`)

  if (mentionIndex === message.length - 1) {
    return ['help']
  }

  return message.slice(mentionIndex + 1)
}

export { botIsntAuthor, botWasMentioned, extractArgs }
