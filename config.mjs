import Conf from 'conf'

const config = new Conf({
  projectName: 'bashgpt',
  defaults: {
    apiKey: '',
    model: 'gpt-4o-2024-08-06',
    availableModels: ['gpt-4o-2024-08-06', 'gpt-4o-mini-2024-07-18'],
  },
})

export const getConfig = () => {
  return {
    apiKey: config.get('apiKey'),
    model: config.get('model'),
    availableModels: config.get('availableModels'),
  }
}

export const setConfig = (key, value) => {
  config.set(key, value)
}
