module.exports = {
  botWasMentioned: (msg, client) => {
    return msg.mentions.users.get(client.user.id) !== undefined
  },
  botIsntAuthor: (msg, client) => {
    return msg.author.id !== client.user.id
  }
}
