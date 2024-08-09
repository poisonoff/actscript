import type { FastifyRequest } from 'fastify'
import type { GeneralPermissionsConfig, User } from '@ru/shared'
import { getStore } from './store.util'
import { getConfig } from './env.util'

export function getUserPermissions(request: FastifyRequest) {
  const authorization = request.headers.authorization
  const user = (getStore<User[]>('users') || [])?.find(u => u.tokens.includes(authorization || ''))
  if (!user) {
    return []
  }
  const permissionsConfig = getConfig('general')?.permissions

  if (!permissionsConfig)
    return []

  if (permissionsConfig.full.includes(user.email)) {
    return ['full', 'sync', 'ai', 'translation'] as (keyof GeneralPermissionsConfig)[]
  }

  const permissions: string[] = []

  for (const permission of Object.keys(permissionsConfig)) {
    if ((permissionsConfig as any)[permission].includes(user.email)) {
      permissions.push(permission)
    }
  }
  return permissions
}

export function hasPermission(request: FastifyRequest, permission: keyof GeneralPermissionsConfig) {
  return getUserPermissions(request).includes(permission)
}
