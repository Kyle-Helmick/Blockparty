module.exports = (msg, ec2, DEFAULT_ERR) => {
  ec2.describeInstances({}, (err, data) => {
    if (err) {
      console.error(err)
      msg.reply(DEFAULT_ERR)
    } else {
      var instances = data['Reservations'][0]['Instances']
      var response = ''

      for (i in instances) {
        if (i !== 0) {
          response += '\n'
        }

        instanceName = instances[i]['Tags'].filter(
          tag => tag['Key'] === 'Name'
        )[0]['Value']

        response += `${instanceName}: ${instances[i]['State']['Name']}`
      }
      console.log(`${msg.author.tag} listed instances`)
      msg.reply(response)
    }
  })
}
