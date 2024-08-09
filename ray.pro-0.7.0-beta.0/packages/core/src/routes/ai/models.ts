import type { AIConfig, AIModelConfig, AIServiceEndpointConfig, OpenAIServiceConfig, RaycastAIModel } from '@ru/shared'
import { ofetch } from 'ofetch'
import type { Model as IOpenAIModel } from 'openai/resources/index'
import { getConfig } from '../../utils/env.util'
import { toSnakeCase } from '../../utils/others.util'
import { matchModelInfo } from '../../utils/match-model-info.util'
import { genModelNameMaybeWithContextFromId } from '../../utils/gen-model-name-from-id'
import { Debug } from '../../utils/log.util'
import { getCache, setCache } from '../../utils/cache.util'
import { COHERE_SERVICE_PROVIDERS, GEMINI_SERVICE_PROVIDERS, GROQ_SERVICE_PROVIDERS, OPENAI_SERVICE_PROVIDERS, RAYCAST_DEFAULT_GROQ_MODELS, RAYCAST_DEFAULT_MODELS, RAYCAST_GEMINI_PRO_ONLY_MODELS } from './constants'

const debug = Debug.create('features:ai:models')

function getCustomModelsFromStandloneConfig() {
  return Object.entries(getConfig('ai')?.openai?.models || {}).map(([key, value]) => {
    const capabilities: {
      [key: string]: string | undefined
    } = {}
    const abilities: {
      [key: string]: {
        [key: string]: any
      }
    } = {}
    for (const [key, val] of Object.entries(value.capabilities || {})) {
      const _key = toSnakeCase(key)
      if (val) {
        switch (_key) {
          case 'web_search':
            capabilities[_key] = val !== 'fixed' ? 'full' : 'always_on'
            abilities[_key] = {
              toggleable: val !== 'fixed',
            }
            break
          case 'image_generation':
            capabilities[_key] = 'full'
            abilities[_key] = {
              model: val || 'dall-e-2',
            }
            break
          case 'vision':
            // capabilities[_key] = 'full'
            abilities[_key] = {
              formats: [
                'image/png',
                'image/jpeg',
                'image/webp',
                'image/gif',
              ],
            }
            break
        }
      }
      else {
        continue
      }
    }

    return ({
      id: value.id || key,
      description: value.description || '',
      model: value.model || key,
      name: value.name || key,
      provider: 'openai',
      // Config processing will convert key to providerName, so it needs to be processed here
      provider_name: (value as any).providerName || 'OpenAI',
      provider_brand: 'openai',
      speed: Number(value.speed) || 3,
      intelligence: Number(value.intelligence) || 3,
      capabilities,
      abilities,
      context: Number(value.context) || 16,
      features: ['chat', 'quick_ai', 'commands', 'api', 'emoji_search'],
      suggestions: [],
      in_better_ai_subscription: false,
      requires_better_ai: false,
      // status: value.status || undefined,
      // status
    } as RaycastAIModel)
  })
}

async function getCustomModelsFromAnEndpoint(endpoint: string, config: AIServiceEndpointConfig) {
  const remoteEndpointsCache = getCache('openai-model', 'remoteEndpoints') as { [key: string]: IOpenAIModel[] } || {}
  const cache = remoteEndpointsCache[endpoint]
  let modelsRemoteData: {
    data: IOpenAIModel[]
    success: boolean
  }
  if (cache) {
    debug.info('Hit custom models cache', endpoint)
    modelsRemoteData = {
      data: cache,
      success: true,
    }
  }
  else {
    debug.info('Fetching custom models from endpoint', endpoint)
    modelsRemoteData = await ofetch<{
      data: IOpenAIModel[]
      success: boolean
    }>('/models', {
      method: 'GET',
      baseURL: endpoint,
      headers: {
        authorization: config.apiKey!,
      },
    }).catch(() => {
      debug.warn('Failed to fetch custom models from endpoint', endpoint)
      return {
        data: [],
        success: false,
      }
    })

    if (!modelsRemoteData.success || modelsRemoteData.data.length === 0) {
      return []
    }

    setCache('openai-model', 'remoteEndpoints', {
      ...remoteEndpointsCache,
      [endpoint]: modelsRemoteData.data,
    })
  }
  if (modelsRemoteData.success) {
    const displayModels = config.displayModels || []
    const bannedModels = config.bannedModels || []
    const addonModels = config.addonModels || [] // 附加模型
    if (addonModels.length) {
      addonModels.forEach((model) => {
        const addon = {
          id: model,
          created: Date.now(),
          object: 'model' as const,
          owned_by: 'addon',
        }
        modelsRemoteData.data.push(addon)
      })
    }
    return modelsRemoteData.data.map((model) => {
      if (displayModels.length && !displayModels.includes(model.id)) // Display models
        return null
      if (bannedModels.length && bannedModels.includes(model.id)) // Banned models
        return null

      const modelInfo = matchModelInfo(model.id)
      const modelNameMaybeWithContext = genModelNameMaybeWithContextFromId(model.id, endpoint)
      const capabilities = {} as {
        [key: string]: string | undefined
      }
      const abilities = {} as {
        [key: string]: {
          [key: string]: any
        }
      }
      modelInfo?.capabilities?.forEach((capability) => {
        const _capability = toSnakeCase(capability)
        switch (_capability) {
          case 'web_search':
            capabilities[_capability] = 'full'
            abilities[_capability] = {
              toggleable: true,
            }
            break
          case 'image_generation':
            capabilities[_capability] = 'full'
            abilities[_capability] = {
              model: 'dall-e-2',
            }
            break
          case 'vision':
            // capabilities[_capability] = 'full'
            abilities[_capability] = {
              formats: [
                'image/png',
                'image/jpeg',
                'image/webp',
                'image/gif',
              ],
            }
            break
        }
      })
      return ({
        id: model.id,
        description: modelInfo?.description || `This is a AI model from ${endpoint}. You can use it for various tasks like chat, quick AI, commands, API and emoji search.`,
        model: model.id,
        name: modelNameMaybeWithContext.name,
        provider: 'openai',
        provider_name: config.tag || 'OpenAI',
        provider_brand: modelInfo?.brand || 'openai',
        speed: modelInfo?.speed || 3,
        intelligence: modelInfo?.intelligence || 3,
        capabilities,
        abilities,
        context: modelInfo?.context || modelNameMaybeWithContext.context || 16,
        features: ['chat', 'quick_ai', 'commands', 'api', 'emoji_search'],
        suggestions: [],
        in_better_ai_subscription: false,
        requires_better_ai: false,
        // status: value.status || undefined,
        // status
      } as RaycastAIModel)
    })
  }
}

async function getCustomModelsFromEndpoints() {
  const config = Object.values(getConfig('ai')?.openai?.endpoints || {})
  const models = []
  const fromConfig = getCustomModelsFromStandloneConfig()
  for (const endpoint of config) {
    if (!endpoint.baseUrl) {
      continue
    }
    const fromRemote = await getCustomModelsFromAnEndpoint(endpoint.baseUrl!, endpoint) || []

    for (const model of fromRemote) {
      if (!model)
        continue
      const index = fromConfig.findIndex(m => m.id === model.id)
      if (index !== -1) {
        fromConfig[index] = model
      }
      else {
        models.push(model)
      }
    }
  }

  return models.concat(fromConfig) as RaycastAIModel[]
}

async function getCustomModels() {
  return await getCustomModelsFromEndpoints()
}

async function generateRaycastAIServiceProviders() {
  const config = getConfig('ai')
  const default_models = []
  if (config?.openai && !config?.openai?.disable) {
    default_models.push([
      ...OPENAI_SERVICE_PROVIDERS,
      ...await getCustomModels(),
    ])
  }
  if (config?.gemini && !config?.gemini?.disable)
    default_models.push(...GEMINI_SERVICE_PROVIDERS)
  if (config?.groq && !config?.groq.disable)
    default_models.push(...GROQ_SERVICE_PROVIDERS)
  if (config?.cohere && !config?.cohere.disable)
    default_models.push(...COHERE_SERVICE_PROVIDERS)
  default_models.forEach((models) => {
    if (!Array.isArray(models))
      models = [models]

    models.forEach((model) => {
      if (!model.availability)
        model.availability = 'public'
      if (!model.status)
        model.status = null
    })
  })
  return default_models.flat()
}

type AIServiceConfigWithNoSingleModel = Omit<AIConfig, 'default' | 'temperature' | 'maxTokens' | 'functions' | 'gemini'>

function getDefaultInModels(ai: keyof AIServiceConfigWithNoSingleModel) {
  const aiConfig = (getConfig('ai') as AIServiceConfigWithNoSingleModel)?.[ai]

  if (aiConfig?.disable)
    return RAYCAST_DEFAULT_MODELS

  let default_model = RAYCAST_DEFAULT_MODELS
  let id = aiConfig?.default || RAYCAST_DEFAULT_MODELS.api

  if (aiConfig?.default) {
    if (ai === 'openai') {
      const model = (aiConfig as OpenAIServiceConfig).models?.[aiConfig.default] || {} as AIModelConfig
      if (model)
        id = model.id || aiConfig.default
    }
  }
  else {
    switch (ai) {
      case 'groq':
        id = RAYCAST_DEFAULT_GROQ_MODELS.api
        break
      case 'cohere':
        id = 'command-r-plus'
        break
      default:
        break
    }
  }

  default_model = {
    chat: id,
    quick_ai: id,
    commands: id,
    api: id,
    emoji_search: id,
  }

  return default_model
}

export async function AIModels() {
  const config = getConfig('ai')
  let default_models
  switch (config?.default?.toLowerCase()) {
    case 'gemini':
      default_models = RAYCAST_GEMINI_PRO_ONLY_MODELS
      break
    default:
      default_models = getDefaultInModels(config?.default?.toLowerCase() as keyof AIServiceConfigWithNoSingleModel)
      break
  }
  const models = await generateRaycastAIServiceProviders()
  return {
    default_models,
    models,
  }
}
