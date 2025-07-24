#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import boxen from 'boxen'
import readline from 'readline'
import { getConfig, setConfig } from './config.mjs'
import { fetchCommandFromAPI, executeCommand } from './bashgpt-core.mjs'

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
    let apiKey = getConfig().apiKey || process.env.OPENAI_API_KEY
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

      console.log('Sending query to ChatGPT API...')
      const response = await fetchCommandFromAPI(inputString, apiKey, getConfig().model)

      // Handle the new structured outputs response format
      if (response.status !== 'completed') {
        console.log(chalk.red('Error: API request was not completed successfully.'))
        if (response.incomplete_details) {
          console.log(chalk.red(`Reason: ${response.incomplete_details.reason}`))
        }
        return
      }

      const output = response.output[0]
      if (!output || !output.content || !output.content[0]) {
        console.log(chalk.red('Error: No content in API response.'))
        return
      }

      const content = output.content[0]
      
      // Check for refusal
      if (content.type === 'refusal') {
        console.log(chalk.red(`API refused the request: ${content.refusal}`))
        return
      }

      // Parse the structured output
      let parsedResponse
      try {
        // Get the actual text content from the structured response
        let textContent
        if (response.output_text) {
          textContent = response.output_text
        } else if (content.type === 'output_text') {
          textContent = content.text
        } else {
          throw new Error('No text content found in response')
        }
        
        parsedResponse = JSON.parse(textContent)
      } catch (parseError) {
        console.log(chalk.red('Error: Failed to parse API response.'))
        console.error('Parse error:', parseError)
        console.error('Raw response:', response)
        return
      }

      const { command, explanation, executable } = parsedResponse

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
        rl.question('Do you want to run the command? [y/N] ', async (answer) => {
          if (answer.toLowerCase() === 'y') {
            console.log(chalk.yellow('Running command...'))

            // Use executeCommand function instead of inline exec
            const result = await executeCommand(command)

            if (result.success) {
              console.log(chalk.green('Command output:'))
              console.log(result.output)
            } else {
              console.error(chalk.red(`Error: ${result.error}`))
            }
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

program
  .command('config')
  .description('Manage configuration')
  .addCommand(
    new Command('show').description('Show current configuration').action(() => {
      const config = getConfig()
      const boxenOptions = {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'green',
        backgroundColor: 'black',
      }

      console.log(
        boxen(
          `${chalk.white.bold('Current Configuration:')}\n\n` +
            `API Key: ${config.apiKey ? '********' : 'Not set'}\n` +
            `Model: ${config.model}\n` +
            `Available Models:\n${config.availableModels.map((m) => `- ${m}`).join('\n')}`,
          boxenOptions,
        ),
      )
    }),
  )
  .addCommand(
    new Command('set')
      .description('Set configuration values')
      .argument('<key>', 'Configuration key (apiKey/model)')
      .argument('<value>', 'Configuration value')
      .action((key, value) => {
        const config = getConfig()
        if (!['apiKey', 'model'].includes(key)) {
          console.log(chalk.red('Invalid configuration key. Use "apiKey" or "model"'))
          return
        }
        if (key === 'model' && !config.availableModels.includes(value)) {
          console.log(chalk.red('Invalid model. Available models:'))
          console.log(config.availableModels.join('\n'))
          return
        }
        setConfig(key, value)
        console.log(chalk.green(`${key} updated successfully`))
      }),
  )

program.parse(process.argv)
