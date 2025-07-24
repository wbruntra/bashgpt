// bashgpt-core.mjs
import axios from 'axios'
import axiosRetry from 'axios-retry'
import os from 'os'
import { exec as execChild } from 'child_process'
import { promisify } from 'util'

export const exec = promisify(execChild)

// Configure axios-retry
axiosRetry(axios, {
  retries: 2,
  retryDelay: (retryCount) => {
    return retryCount * 2000
  },
  retryCondition: (error) => {
    return error.response?.status === 429
  },
})

export const getOsInfo = () => {
  // Get the platform (operating system) information
  const platform = os.platform()

  // Get the shell information
  const shell = process.env.SHELL

  // Determine the user's operating system
  let osName
  switch (platform) {
    case 'win32':
      osName = 'Windows'
      break
    case 'darwin':
      osName = 'macOS'
      break
    case 'linux':
      osName = 'Linux'
      break
    default:
      osName = 'Unknown'
  }

  return {
    osName,
    shell,
  }
}

export const fetchCommandFromAPI = async (query, apiKey, model) => {
  const { osName, shell } = getOsInfo()

  // Define the JSON schema for structured outputs
  const schema = {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The command to run. Use brackets [] for placeholders (missing parameters).'
      },
      explanation: {
        type: 'string',
        description: 'An explanation of the command'
      },
      executable: {
        type: 'boolean',
        description: 'true/false if the command is directly executable (i.e. user does not need to fill in parameters)'
      }
    },
    required: ['command', 'explanation', 'executable'],
    additionalProperties: false
  }

  const response = await axios.post(
    'https://api.openai.com/v1/responses',
    {
      model: model,
      input: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates shell commands for ${osName} using ${shell}. Generate appropriate commands based on user requests.`,
        },
        {
          role: 'user',
          content: `Generate a command for ${osName} on ${shell}: ${query}`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'bash_command',
          schema: schema,
          strict: true
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )

  return response.data
}

export const executeCommand = async (command) => {
  try {
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      return { success: false, error: stderr }
    }
    return { success: true, output: stdout }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
