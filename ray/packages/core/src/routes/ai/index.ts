import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { Debug } from '../../utils/log.util'
import { hasPermission } from '../../utils/permissions.util'
import { AIModels } from './models'
import { Completions } from './completions'
import { FilesDirectUpload, FilesGet, FilesGetRaw, FilesUpload } from './files'

export function AIRoute(fastify: FastifyInstance, opts: Record<any, any>, done: Function) {
  fastify.addHook('preHandler', async (request: FastifyRequest, _: FastifyReply) => {
    if (!hasPermission(request, 'ai')) {
      throw new Error('Permission denied. This account is not allowed to use this feature.')
    }
  })
  fastify.get('/models', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /ai/models --> Local Handler')
    const model = await AIModels()
    return reply.send(model)
  })

  fastify.post('/chat_completions', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /ai/chat_completions --> Local Handler')
    return Completions(request, reply)
  })

  fastify.post('/files', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[POST] /ai/files --> Local Handler')
    return FilesUpload(request, reply)
  })

  fastify.put('/files/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[PUT] /ai/files/:id --> Local Handler')
    return FilesDirectUpload(request, reply)
  })

  fastify.get('/files/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /ai/files/:id --> Local Handler')
    return FilesGet(request, reply)
  })

  fastify.get('/files/raw/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /ai/files/raw/:id --> Local Handler')
    return FilesGetRaw(request, reply)
  })

  done()
}
