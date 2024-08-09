interface modelInfo {
  description?: string
  intelligence: number
  speed: number
  context: number
  brand?: string
  capabilities?: string[]
}

const MODELS_INFO: {
  [key: string]: modelInfo
} = {
  'gpt-4o-mini': {
    description: 'GPT-4o Mini is a highly intelligent and fast model that is ideal for a variety of everyday tasks.\n',
    context: 128,
    speed: 3,
    intelligence: 4,
    capabilities: [
      'web_search',
    ],
  },
  'gpt-4o': {
    context: 128,
    speed: 3,
    intelligence: 5,
    description: 'GPT-4o is the most advanced and fastest model from OpenAI, making it a great choice for complex everyday problems and deeper conversations.\n',
    capabilities: [
      'web_search',
      'vision',
    ],
  },
  'gpt-3.5-turbo': {
    description: 'GPT-3.5 Turbo is OpenAI’s fastest model, making it ideal for tasks that require quick response times with basic language processing capabilities.\n',
    speed: 3,
    intelligence: 3,
    context: 16,
    capabilities: [
      'web_search',
    ],
  },
  'gpt-3.5': {
    description: 'GPT-3.5 is OpenAI’s most advanced model, making it ideal for tasks that require complex language processing capabilities.\n',
    speed: 2,
    intelligence: 3,
    context: 4,
    capabilities: [
      'web_search',
    ],
  },
  'gpt-4-turbo': {
    description: 'GPT-4 Turbo from OpenAI has a big context window that fits hundreds of pages of text, making it a great choice for workloads that involve longer prompts.\n',
    speed: 3,
    intelligence: 5,
    context: 128,
    capabilities: [
      'web_search',
    ],
  },
  'gpt-4-vision': {
    description: 'GPT-4 Vision GPT-4 Model with Vision Capabilities\n',
    speed: 1,
    intelligence: 6,
    context: 8,
    capabilities: [
      'web_search',
      'vision',
    ],
  },
  'gpt-4': {
    speed: 3,
    intelligence: 3,
    context: 16,
    capabilities: [
      'web_search',
    ],
  },
  'deepseek': {
    context: 128,
    description: 'A Strong, Economical, and Efficient Mixture-of-Experts Language Model',
    intelligence: 3,
    speed: 3,
  },
  'command-r-plus': {
    context: 128,
    speed: 3,
    intelligence: 3,
    capabilities: [
      'web_search',
    ],
    description: 'C4AI Command R+ is an open weights research release of a 104B billion parameter model with highly advanced capabilities.\n',
  },
  'command-r': {
    context: 128,
    speed: 3,
    intelligence: 3,
    capabilities: [
      'web_search',
    ],
    description: 'Command-R is a large language model with open weights optimized for a variety of use cases including reasoning, summarization, and question answering.\n',
  },
  'command': {
    context: 128,
    speed: 3,
    intelligence: 3,
    capabilities: [
      'web_search',
    ],
    description: 'It\'s a model that can do a lot of things',
  },
  'kimi': {
    context: 128,
    speed: 3,
    intelligence: 3,
    capabilities: [
      'web_search',
    ],
    description: 'Kimi is a highly intelligent and fast model that is ideal for a variety of everyday tasks.\n',
  },
  'claude-3-5-sonnet': {
    brand: 'anthropic',
    description: 'Claude 3.5 Sonnet from Anthropic has enhanced intelligence with increased speed. It excels at complex tasks like visual reasoning or workflow orchestrations.\n',
    speed: 3,
    intelligence: 5,
    context: 200,
    capabilities: [
      'web_search',
      'vision',
    ],
  },
  'claude-3-sonnet': {
    brand: 'anthropic',
    capabilities: [
      'web_search',
      'vision',
    ],
    context: 200,
    speed: 3,
    intelligence: 4,
  },
  'claude-3-haiku': {
    brand: 'anthropic',
    description: 'Claude 3 Haiku is Anthropic\'s fastest model, with a large context window that makes it ideal for analyzing code, documents, or large amounts of text.\n',
    speed: 3,
    intelligence: 3,
    capabilities: [
      'web_search',
      'vision',
    ],
    context: 200,
  },
  'claude-3-opus': {
    brand: 'anthropic',
    description: 'Claude 3 Opus is Anthropic\'s most intelligent model, with best-in-market performance on highly complex tasks. It stands out for remarkable fluency.\n',
    speed: 1,
    intelligence: 4,
    capabilities: [
      'web_search',
      'vision',
    ],
    context: 200,
  },
  'claude-3': {
    speed: 1,
    intelligence: 4,
    brand: 'anthropic',
    capabilities: [
      'web_search',
      'vision',
    ],
    context: 200,
  },
}

export function matchModelInfo(modelId: string) {
  const model = Object.keys(MODELS_INFO).find(key => modelId.includes(key))
  if (model) {
    return MODELS_INFO[model]
  }
}
