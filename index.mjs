#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import boxen from 'boxen'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import readline from 'readline'
import { exec } from 'child_process'
import os from 'os'

const getOsInfo = () => {
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
// Configure axios-retry
axiosRetry(axios, {
  retries: 2, // Number of retries
  retryDelay: (retryCount) => {
    return retryCount * 2000 // Time interval between retries (in milliseconds)
  },
  retryCondition: (error) => {
    return error.response.status === 429
  },
})

const getApiKey = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question('Please enter your OPENAI_API_KEY: ', (apiKey) => {
      resolve(apiKey)
      rl.close()
    })
  })
}

const program = new Command()

program
  .version('1.0.0')
  .addHelpText('after', '\nExample:\n  $ bashgpt list all files in current directory')
  .argument('[query...]', 'Query for ChatGPT API')
  .action(async (query) => {
    // Check if the required environment variable is set
    let apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log(chalk.yellow('OPENAI_API_KEY environment variable is not set.'))
      apiKey = await getApiKey()
    }
    if (apiKey.trim().length === 0) {
      console.log(chalk.red('Error: API key needed to proceed'))
      process.exit(1)
    }

    try {
      const inputString = query.join(' ')
      if (inputString.trim().length === 0) {
        console.log(chalk.red('Error: Please provide a query.'))
        process.exit(1)
      }

      const { osName, shell } = getOsInfo()

      console.log('Sending query to ChatGPT API...')
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                `Please respond in JSON format. The object should have the following keys:\n` +
                `command: The command to run. Use brackets [] for placeholders (missing parameters).\n` +
                `explanation: An explanation of the command\n` +
                `executable: true/false if the command is directly executable (i.e. no missing parameters)`,
            },
            {
              role: 'user',
              content: `Generate a command for ${osName} on ${shell}: ${inputString}\n`,
            },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        },
      )

      const { finish_reason } = response.data.choices[0]

      if (finish_reason !== 'stop') {
        console.log(chalk.red('Error: ChatGPT API did not generate a command.'))
        return
      }

      const message = response.data.choices[0].message

      const { command, explanation, executable } = JSON.parse(message.content)

      const boxenOptions = {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
        backgroundColor: 'black',
      }

      // Display the command
      const commandBox = boxen(
        `${chalk.white.bold('BASH Command:')}\n\n${chalk.green.bold(command)}`,
        boxenOptions,
      )

      console.log(commandBox)

      // Display the explanation
      const explanationBox = boxen(
        `${chalk.white.bold('Explanation:')}\n\n${chalk.cyan(explanation)}`,
        boxenOptions,
      )
      console.log(explanationBox)

      // Conditionally prompt for execution
      if (executable) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        })

        console.log(`\n`, chalk.green.bold(command))
        rl.question('Do you want to run the command? [y/N] ', (answer) => {
          if (answer.toLowerCase() === 'y') {
            console.log(chalk.yellow('Running command...'))
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error(chalk.red(`Error: ${error.message}`))
                return
              }
              if (stderr) {
                console.error(chalk.red(`Error: ${stderr}`))
                return
              }
              console.log(chalk.green('Command output:'))
              console.log(stdout)
            })
          } else {
            console.log(chalk.yellow('Command not executed.'))
          }
          rl.close()
        })
      } else {
        console.log(chalk.yellow('The command has placeholders and cannot be executed directly.'))
      }
    } catch (error) {
      console.log(error)
      console.error('Error:', error.message)
    }
  })

program.parse(process.argv)
