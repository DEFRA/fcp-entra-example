import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'
import entra from './entra.js'
import cache from './cache.js'

convict.addFormats(convictFormatWithValidator)

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  isDev: {
    doc: 'True if the application is in development mode.',
    format: Boolean,
    default: process.env.NODE_ENV === 'development'
  },
  isProd: {
    doc: 'True if the application is in production mode.',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  host: {
    doc: 'The host to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3001,
    env: 'PORT',
    arg: 'port'
  },
  cookie: {
    password: {
      doc: 'The cookie password.',
      format: String,
      default: null,
      env: 'COOKIE_PASSWORD'
    },
    secure: {
      doc: 'set secure flag on cookie',
      format: Boolean,
      default: process.env.NODE_ENV === 'production',
      env: 'SESSION_COOKIE_SECURE'
    }
  },
  entra: entra.getProperties(),
  cache: cache.getProperties()
})

config.validate({ allowed: 'strict' })

export default config
