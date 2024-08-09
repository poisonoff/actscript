import type { FastifyRequest } from 'fastify'
import { GetCloudSync, PutCloudSync } from '../../features/sync/impl'
import { Debug } from '../../utils/log.util'
import { hasPermission } from '../../utils/permissions.util'

export function check(request: FastifyRequest) {
  if (!hasPermission(request, 'sync')) {
    throw new Error('Permission denied. This account is not allowed to use this feature.')
  }
}

export async function GetSync(request: FastifyRequest) {
  check(request)
  Debug.info('[GET] /me/sync --> Pro Feature Impl')
  return await GetCloudSync(request)
}

export async function PutSync(request: FastifyRequest) {
  check(request)
  Debug.info('[PUT] /me/sync --> Pro Feature Impl')
  return PutCloudSync(request)
}
