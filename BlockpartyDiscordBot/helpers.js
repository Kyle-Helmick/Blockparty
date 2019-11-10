module.exports = {
  botWasMentioned: (client, msg) => {
    return msg.mentions.users.get(client.user.id) !== undefined
  },
  botIsntAuthor: (client, msg) => {
    return msg.author.id !== client.user.id
  }
}
