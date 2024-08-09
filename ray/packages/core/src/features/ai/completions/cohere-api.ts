import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Cohere } from 'cohere-ai'
import { CohereClient } from 'cohere-ai'
import type { RaycastCompletions } from '@ru/shared'
import destr from 'destr'
import { getConfig } from '../../../utils/env.util'
import { Debug } from '../../../utils/log.util'

import { PreUniversalAICompletions } from './universal'

export async function CohereAPICompletions(request: FastifyRequest, reply: FastifyReply) {
  const config = getConfig('ai')?.cohere
  if (!config?.apiKey)
    throw new Error('API key is required for Cohere API')

  const debug = Debug.create('features:ai:completions:cohere-api')
  const cohere = new CohereClient({
    token: config?.apiKey,
  })
  const preUniversalAICompletions = await PreUniversalAICompletions(request, config)
  const body = preUniversalAICompletions.body
  const chat = body.messages
  debug.info(`Handling completions for model: ${body.model}`)
  const chatHistory = chat.map((message) => {
    if (message.role === 'assistant') {
      return {
        role: 'CHATBOT',
        message: message.content,
      }
    }
    else {
      return {
        role: message.role.toUpperCase(),
        message: message.content,
      }
    }
  })

  const raycastBody = request.body as RaycastCompletions

  const chatStream = await cohere.chatStream({
    model: body.model,
    p: body.top_p,
    temperature: body.temperature,
    chatHistory: chatHistory.slice(0, -1) as Cohere.ChatMessage[], // Remove the last message
    message: chatHistory[chatHistory.length - 1].message, // The last message
    maxTokens: body.max_tokens,
    connectors: [
      // RAG is not supported for c4ai-aya-23
      ...raycastBody.web_search_tool && raycastBody.model !== 'c4ai-aya-23'
        ? [{
            id: 'web-search',
          }]
        : [],
    ],
  }).catch((e) => {
    const error = e.body.read()?.toString()
    throw new Error(destr<{
      message?: string
    }>(error)?.message)
  })

  return reply.sse((async function* source() {
    try {
      for await (const message of chatStream) {
        switch (message.eventType) {
          case 'text-generation': {
            const res = {
              text: message.text,
              finish_reason: 'continue',
            }
            yield { data: JSON.stringify(res) }
            break
          }
          case 'stream-end': {
            const res = {
              text: '',
              finish_reason: 'stop',
            }
            yield { data: JSON.stringify(res) }
            break
          }
          case 'search-results': {
            const references = [] as Array<{
              title: string
              description: string
              url: string
            }>
            message.documents?.forEach((doc) => {
              references.push({
                title: doc.title,
                description: doc.description,
                url: doc.url,
              })
            })
            const res = {
              references,
              text: '',
            }
            yield { data: JSON.stringify(res) }
          }
        }
      }
    }
    catch (e: any) {
      console.error('Error: ', e.message)
      const res = {
        text: '',
        finish_reason: e.message,
      }
      yield { data: JSON.stringify(res) }
    }
    finally {
      // console.log('finally')
      const res = {
        text: '',
        finish_reason: 'stop',
      }
      yield { data: JSON.stringify(res) }
    }
  })())
}
