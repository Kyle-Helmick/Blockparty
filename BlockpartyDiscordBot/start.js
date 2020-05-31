module.exports = (client, msg, ec2, DEFAULT_ERR) => {
  let match = msg.content.match(/.*start (.+)/)
  let noMatch = true

  if (match === null || match.length <= 1) {
    msg.reply(`Try saying "<@${client.user.id}> stop [name of server]"`)
    return
  }

  serverQuery = match[1]

  ec2.describeInstances({}, (err, data) => {
    if (err) {
      console.error(err)
      msg.reply(DEFAULT_ERR)
    } else {
      var instances = data['Reservations'].map(
        reservation => reservation['Instances'][0]
      )

      instances.forEach(instance => {
        var instanceName = instance['Tags'].filter(
          tag => tag['Key'] === 'Name'
        )[0]['Value']

        if (instanceName === serverQuery) {
          instanceId = instance['InstanceId']
          noMatch = false

          if (instance['State']['Name'] === 'running') {
            msg.reply('That server is already running!')
          } else {
            ec2.startInstances({ InstanceIds: [instanceId] }, (err, data) => {
              if (err) {
                console.error(err)
                msg.reply(DEFAULT_ERR)
              }
              console.log(`${msg.author.tag} started ${instanceName}`)
              msg.reply(`${instanceName} is starting up!`)
            })
          }
        }
      })

      if (noMatch) {
        msg.reply(
          `Try double checking the server name with "<@${client.user.id}> list"`
        )
      }
    }
  })
}