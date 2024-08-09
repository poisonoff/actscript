import type { Buffer } from 'node:buffer'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RaycastAiFiles, RaycastAiFilesGet, RaycastAiFilesRequest } from '@ru/shared'
import { v4 } from 'uuid'
import { Debug } from '../../utils/log.util'
import { getCacheDirectory } from '../../utils/get-cache-directory'

const cacheDirectory = getCacheDirectory('raycast-unblock-ai-files')
const debug = Debug.create('Files')

if (!existsSync(cacheDirectory)) {
  mkdirSync(cacheDirectory, { recursive: true })
}

export async function FilesUpload(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as RaycastAiFilesRequest
  const id = v4()
  const res: RaycastAiFiles = {
    id,
    key: id,
    filename: body.blob.filename,
    content_type: body.blob.content_type,
    metadata: {},
    service_name: 'ai_files',
    byte_size: body.blob.byte_size,
    checksum: body.blob.checksum,
    created_at: new Date().toISOString(),
    attachable_sgid: id,
    signed_id: id,
    direct_upload: {
      url: `https://backend.raycast.com/api/v1/ai/files/${id}`,
      headers: {
        'Content-Type': body.blob.content_type,
        'Content-MD5': body.blob.checksum,
        'Content-Disposition': `attachment; filename="${body.blob.filename}"`,
      },
    },
  }

  return reply.send(res)
}

export async function FilesDirectUpload(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const contentType = request.headers['content-type']
  let suffix = contentType?.split('/')[1]
  if (suffix === 'octet-stream')
    suffix = 'bin'
  const file = request.body as Buffer
  // const path = resolve(tmpdir(), `${id}.${suffix}`)
  const path = resolve(cacheDirectory, `${id}.${suffix}`)
  writeFileSync(path, file)
  debug.success('File saved to', path)
  return reply.send()
}

export async function FilesGet(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  // const attachmentUrl = `https://backend.raycast.com/api/v1/ai/files/raw/${id}`
  // const file = readdirSync(resolve(tmpdir())).find(file => file.includes(id))
  const file = readdirSync(resolve(cacheDirectory)).find(file => file.includes(id))
  if (!file) {
    return reply.status(404).send()
  }
  // const base64 = readFileSync(resolve(tmpdir(), file)).toString('base64')
  const base64 = readFileSync(resolve(cacheDirectory, file)).toString('base64')
  const attachmentUrl = `data:image/png;base64,${base64}`
  const res: RaycastAiFilesGet = {
    id,
    attachment_url: attachmentUrl,
    expires_at: 4102444799999,
  }
  return reply.send(res)
}

export async function FilesGetRaw(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  // const dir = resolve(tmpdir())
  const dir = resolve(cacheDirectory)
  const files = readdirSync(dir)
  const file = files.find(file => file.includes(id))
  if (!file) {
    return reply.status(404).send()
  }
  const content = readFileSync(resolve(dir, file))
  return reply.send(content)
}
