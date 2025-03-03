# BashGPT

BashGPT is a Node.js CLI tool that uses OpenAI's ChatGPT API to generate BASH command suggestions and explanations for a given task.

## Prerequisites

- Node.js (v14 or higher)
- An OpenAI account and [API key](https://platform.openai.com/account/api-keys)

## Installation

1. Install the BashGPT package globally using npm:

```sh
npm install -g bashgpt-cli
```

## Configuration

You can set the `OPENAI_API_KEY` environmental variable in your shell, for example, at the end of your `.bashrc` file.


Configuration
There are two ways to configure BashGPT:

1. Environment Variable

You can set the OPENAI_API_KEY environmental variable in your shell, for example, at the end of your .bashrc file:

```sh
export OPENAI_API_KEY=your_api_key_here
```

2. Configuration Commands
BashGPT now supports persistent configuration using the following commands:

Available configuration options:

apiKey: Your OpenAI API key
model: The GPT model to use (available options: gpt-4o-2024-08-06, gpt-4o-mini-2024-07-18)

```sh
# View current configuration
bashgpt config show

# Set your API key
bashgpt config set apiKey your-api-key-here

# Set preferred model
bashgpt config set model gpt-4o-2024-08-06
```

If `OPENAI_API_KEY` is not set for your environment, you will be prompted to provide it.

## Usage

Run the bashgpt command followed by your query without quotes:

```sh
bashgpt list all files in the current directory
```
