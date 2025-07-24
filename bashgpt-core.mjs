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

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: model,
      messages: [
        {
          role: 'system',
          content:
            `Please respond in JSON format. The object should have the following keys:\n` +
            `command: The command to run. Use brackets [] for placeholders (missing parameters).\n` +
            `explanation: An explanation of the command\n` +
            `executable: true/false if the command is directly executable (i.e. user does not need to fill in parameters)`,
        },
        {
          role: 'user',
          content: `Generate a command for ${osName} on ${shell}: ${query}\n`,
        },
      ],
      response_format: { type: 'json_object' },
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
