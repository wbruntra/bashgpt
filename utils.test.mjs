import { jest } from '@jest/globals'
import os from 'os'

// Mock os module
jest.mock('os', () => ({
  platform: jest.fn(),
}))

// Import the function that uses os (you'll need to export it from your main file)
import { getOsInfo } from './yourCliModule.mjs'

describe('getOsInfo', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('returns correct OS info for Windows', () => {
    // Setup
    os.platform.mockReturnValue('win32')
    process.env.SHELL = 'powershell'

    // Execute
    const result = getOsInfo()

    // Assert
    expect(result.osName).toBe('Windows')
    expect(result.shell).toBe('powershell')
  })

  test('returns correct OS info for macOS', () => {
    // Setup
    os.platform.mockReturnValue('darwin')
    process.env.SHELL = '/bin/zsh'

    // Execute
    const result = getOsInfo()

    // Assert
    expect(result.osName).toBe('macOS')
    expect(result.shell).toBe('/bin/zsh')
  })

  // Add more tests for other platforms
})
