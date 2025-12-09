import { jest } from '@jest/globals'

describe('Entra config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.ENTRA_WELL_KNOWN_URL = 'mockWellKnownUrl'
    process.env.ENTRA_CLIENT_ID = 'mockClientId'
    process.env.ENTRA_CLIENT_SECRET = 'mockClientSecret'
    process.env.ENTRA_REDIRECT_URL = 'mockRedirectUrl'
    process.env.ENTRA_SIGN_OUT_REDIRECT_URL = 'mockSignOutRedirectUrl'
    process.env.ENTRA_REFRESH_TOKENS = 'false'
  })

  afterEach(() => {
    jest.resetModules()
  })

  test('should return well known url from environment variable', async () => {
    const { default: config } = await import('../../../src/config/entra.js')
    expect(config.get('wellKnownUrl')).toBe('mockWellKnownUrl')
  })

  test('should return client id from environment variable', async () => {
    const { default: config } = await import('../../../src/config/entra.js')
    expect(config.get('clientId')).toBe('mockClientId')
  })

  test('should return client secret from environment variable', async () => {
    const { default: config } = await import('../../../src/config/entra.js')
    expect(config.get('clientSecret')).toBe('mockClientSecret')
  })

  test('should return redirect url from environment variable', async () => {
    const { default: config } = await import('../../../src/config/entra.js')
    expect(config.get('redirectUrl')).toBe('mockRedirectUrl')
  })

  test('should return sign out redirect url from environment variable', async () => {
    const { default: config } = await import('../../../src/config/entra.js')
    expect(config.get('signOutRedirectUrl')).toBe('mockSignOutRedirectUrl')
  })

  test('should return refresh tokens from environment variable', async () => {
    const { default: config } = await import('../../../src/config/entra.js')
    expect(config.get('refreshTokens')).toBe(false)
  })

  test('should default to refreshing tokens if environment variable is not set', async () => {
    delete process.env.ENTRA_REFRESH_TOKENS
    jest.resetModules()
    const { default: config } = await import('../../../src/config/entra.js')
    expect(config.get('refreshTokens')).toBe(true)
  })
})
