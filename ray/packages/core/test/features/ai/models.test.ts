import { describe, expect, it } from 'vitest'
import type { RaycastAIModel } from '@ru/shared'
import { ofetch } from 'ofetch'

// keyof RaycastAIModel
type RaycastAIModelKeys = keyof RaycastAIModel | [keyof RaycastAIModel, [string] | string]

const raycastAIModelKeys: RaycastAIModelKeys[] = [
  'id',
  'description',
  'model',
  'name',
  'features',
  'speed',
  'intelligence',
  'provider',
  'provider_name',
  'provider_brand',
  'requires_better_ai',
  'context',
  'capabilities',
  'suggestions',
  'in_better_ai_subscription',
  'status',
  'availability',
  'abilities',
]

describe('keys are matched with official keys', async () => {
  const official = await ofetch<{
    default_model: Record<string, string>
    models: RaycastAIModel[]
  }>('https://backend.raycast.com/api/v1/ai/models')

  it('should match keys', () => {
    const internalKeys = raycastAIModelKeys.sort()
    const officialKeys = Object.keys(official.models[0]).sort() as (keyof RaycastAIModel)[]
    expect(internalKeys).toEqual(officialKeys)
  })
})
