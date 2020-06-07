module.exports = (client, msg, ec2, DEFAULT_ERR) => {
  ec2.describeInstances({}, (err, data) => {
    if (err) {
      console.error(err)
      msg.reply(DEFAULT_ERR)
    } else {
      var instances = data['Reservations'].map(
        (reservation) => reservation['Instances'][0]
      )

      var response = ''

      instances.forEach((instance) => {
        try {
          var instanceName = instance['Tags'].filter(
            (tag) => tag['Key'] === 'Minecraft'
          )[0]['Value']

          if (instanceName === '') {
            return // skip instances who's Minecraft tag is blank
          }

          var newline = response === '' ? '' : '\n'

          response += `${newline}${instanceName}: ${instance['State']['Name']}`
        } catch (e) {
          console.error(e)
        }
      })

      console.log(`${msg.author.tag} listed instances`)
      msg.reply(response)
    }
  })
}
