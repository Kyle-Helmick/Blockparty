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

      for (i in instances) {
        if (i !== 0) {
          response += '\n'
        }

        try {
          instanceName = instances[i]['Tags'].filter(
            (tag) => tag['Key'] === 'Name'
          )[0]['Value']

          response += `${instanceName}: ${instances[i]['State']['Name']}`
        } catch (e) {
          console.error(e)
          continue
        }
      }

      console.log(`${msg.author.tag} listed instances`)
      msg.reply(response)
    }
  })
}
