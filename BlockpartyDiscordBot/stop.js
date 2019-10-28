module.exports = (msg, ec2, DEFAULT_ERR) => {
  let match = msg.content.match(/.*stop (.+)/)

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
      var instances = data['Reservations'][0]['Instances']

      for (i in instances) {
        instanceName = instances[i]['Tags'].filter(
          tag => tag['Key'] === 'Name'
        )[0]['Value']

        if (instanceName === serverQuery) {
          instanceId = instances[i]['InstanceId']

          if (instances[i]['State']['Name'] == 'stopped') {
            msg.reply('That server is already stopped!')
          } else {
            ec2.stopInstances({ InstanceIds: [instanceId] }, (err, data) => {
              if (err) {
                console.error(err)
                msg.reply(DEFAULT_ERR)
              }
              console.log(`${msg.author.tag} stopped ${instanceName}`)
              msg.reply(`${instanceName} is shutting down!`)
            })
          }
        } else {
          msg.reply(
            `Try double checking the server name with "<@${client.user.id}> list"`
          )
        }
      }
    }
  })
}
