const config = require('config')
const Discord = require('discord.js')
const EC2 = require('aws-sdk').EC2

const helpers = require('./helpers')
const list = require('./list')
const start = require('./start')
const stop = require('./stop')

const REQ_CONFIG = [
  'DISCORD_TOKEN',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
]

const DEFAULT_ERR = 'Oops I ran into a problem. Go find Lemons.'

REQ_CONFIG.forEach((c) => {
  if (!config.has(c)) {
    throw new Error(
      `Using the config file generated under config/ make sure ${c} is defined.`
    )
  }
  console.log(`Loaded ${c}:${config.get(c)}`)
})

console.log()

const client = new Discord.Client()

const ec2 = new EC2({
  accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
  secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
  region: config.get('AWS_REGION'),
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  if (
    helpers.botIsntAuthor(client, msg) &&
    helpers.botWasMentioned(client, msg)
  ) {
    if (msg.content.includes('list')) {
      list(client, msg, ec2, DEFAULT_ERR)
    } else if (msg.content.includes('start')) {
      start(client, msg, ec2, DEFAULT_ERR)
    } else if (msg.content.includes('stop')) {
      stop(client, msg, ec2, DEFAULT_ERR)
    } else {
      console.log(`${msg.author.tag} asked for help`)
      msg.reply(
        'Just tell me to:\n- **list**\n- **start** [*an instance name*]\n- **stop** [*an instance name*]    // This is an unsafe operation! Minor data loss may occur!\n- **help**'
      )
    }
  }
})

client.login(config.get('DISCORD_TOKEN'))
