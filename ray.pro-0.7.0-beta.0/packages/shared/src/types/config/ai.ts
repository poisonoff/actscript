import type { RaycastAIModel } from '../raycast/models'

export interface AIConfig {
  default?: string
  temperature?: number
  maxTokens?: number
  functions?: AIServiceFunctionsConfig

  openai?: OpenAIServiceConfig
  gemini?: GeminiServiceConfig
  groq?: GroqServiceConfig
  cohere?: CohereWebServiceConfig
}
export interface AIServiceFunctionsConfig {
  disable?: boolean
  plugins?: {
    [key: string]: string
  }
  serp?: {
    apyHubApiKey?: string
    tavilyAiApiKey?: string
  }
}
export interface AIServiceConfig {
  disable?: boolean
  apiKey?: string
  maxTokens?: number
  temperature?: number
}
export interface OpenAIServiceConfig extends AIServiceConfig {
  baseUrl?: string
  models?: AIServiceModelsConfig
  endpoints?: AIServiceEndpointConfig[]
  default?: string
  isAzure?: boolean
  azureDeploymentName?: string
}
export interface GeminiServiceConfig extends AIServiceConfig {}

export interface GroqServiceConfig extends Omit<AIServiceConfig, 'apiKey'> {
  refreshToken?: string
  default?: string
}

export interface CohereWebServiceConfig extends AIServiceConfig {
  default?: string
  type?: 'api' | 'web'
  email?: string
  password?: string
}

export interface AIModelConfig extends Omit<RaycastAIModel, 'capabilities'> {
  baseUrl?: string // Special endpoint for the model
  apiKey?: string // API key for the model
  realId?: string // Real ID for the model
  capabilities?: {
    imageGeneration: string
    webSearch: string | boolean
  }
}

export interface AIServiceModelsConfig {
  [key: string]: AIModelConfig
}

export interface AIServiceEndpointConfig {
  baseUrl?: string
  apiKey?: string
  tag?: string
  displayModels?: string[]
  addonModels?: string[]
  bannedModels?: string[]
}
