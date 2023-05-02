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

```sh
export OPENAI_API_KEY=your_api_key_here
```

If `OPENAI_API_KEY` is not set for your environment, you will be prompted to provide it.

## Usage

Run the bashgpt command followed by your query without quotes:

```sh
bashgpt list all files in the current directory
```
