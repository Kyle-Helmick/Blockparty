module.exports = (msg, ec2, DEFAULT_ERR) => {
  let match = msg.content.match(/.*start (.+)/)

  if (match === null || match.length <= 1) {
    msg.reply(`Try saying "<@${client.user.id}> start [name of server]"`)
  } else {
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

            if (instances[i]['State']['Name'] == 'running') {
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
          } else {
            msg.reply(
              `Try double checking the server name with "<@${client.user.id}> list"`
            )
          }
        }
      }
    })
  }
}
