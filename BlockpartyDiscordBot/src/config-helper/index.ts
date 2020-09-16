import config from 'config'
import { REQ_CONFIG } from '@constants/index'

function validateConfig() {
  REQ_CONFIG.forEach((c: string) => {
    if (!config.has(c)) {
      throw new Error(
        `Make sure ${c} is defined in the production config file under \`config\``
      )
    }
    console.log(`Loaded ${c}`)
  })
}

export { validateConfig }
