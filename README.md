# BashGPT

BashGPT is a Node.js CLI tool that uses OpenAI's ChatGPT API to generate BASH command suggestions and explanations for a given task.

## Prerequisites

- Node.js (v14 or higher)
- An OpenAI API key

## Installation

1. Install the BashGPT package globally using npm:

```sh
npm install -g bashgpt
```

## Configuration
Your shell need to have the `OPENAI_API_KEY` environmental variable accessible, perhaps in a `.bashrc` file.

```sh
OPENAI_API_KEY=your_api_key_here
```
Replace `your_api_key_here` with your actual API key.


## Usage
Run the bashgpt command followed by your query without quotes:

```sh
bashgpt list all files in the current directory
```