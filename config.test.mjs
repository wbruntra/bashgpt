import { jest } from '@jest/globals'
import fs from 'fs'
import { getConfig, setConfig } from './config.mjs'

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

describe('Config Module', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('getConfig returns default config when no file exists', () => {
    // Setup
    fs.existsSync.mockReturnValue(false)

    // Execute
    const config = getConfig()

    // Assert
    expect(config).toHaveProperty('apiKey', '')
    expect(config).toHaveProperty('model')
    expect(config).toHaveProperty('availableModels')
    expect(config.availableModels).toBeInstanceOf(Array)
  })

  test('getConfig reads from file when it exists', () => {
    // Setup
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        apiKey: 'test-key',
        model: 'gpt-4',
        availableModels: ['gpt-3.5-turbo', 'gpt-4'],
      }),
    )

    // Execute
    const config = getConfig()

    // Assert
    expect(config).toHaveProperty('apiKey', 'test-key')
    expect(config).toHaveProperty('model', 'gpt-4')
  })

  test('setConfig updates value and writes to file', () => {
    // Setup
    const mockConfig = {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      availableModels: ['gpt-3.5-turbo', 'gpt-4'],
    }
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig))

    // Execute
    setConfig('apiKey', 'new-test-key')

    // Assert
    expect(fs.writeFileSync).toHaveBeenCalled()
    const writtenConfig = JSON.parse(fs.writeFileSync.mock.calls[0][1])
    expect(writtenConfig).toHaveProperty('apiKey', 'new-test-key')
  })
})
