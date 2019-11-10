require('dotenv').config()
const Discord = require('discord.js')
const EC2 = require('aws-sdk').EC2

const helpers = require('./helpers')
const list = require('./list')
const start = require('./start')
const stop = require('./stop')

const REQ_ENV_VAR = [
  'DISCORD_TOKEN',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION'
]

const DEFAULT_ERR = 'Oops I ran into a problem. Go find Lemons.'

REQ_ENV_VAR.forEach(envVar => {
  if (!(envVar in process.env)) {
    throw new Error(
      `Using system env or a .env file make sure ${envVar} is available to Blockparty.`
    )
  }
  console.log(`Loaded ${envVar}:${process.env[envVar]}`)
})

console.log()

const client = new Discord.Client()

const ec2 = new EC2({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
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

client.login(process.env.DISCORDAUTH)
