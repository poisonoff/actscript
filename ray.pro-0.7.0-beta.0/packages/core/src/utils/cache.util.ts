import fs from 'node:fs'
import { resolve } from 'node:path'
import destr from 'destr'
import { DATA } from '../constants'
import { Debug } from './log.util'

export function prepareCache() {
  const debug = Debug.create('Cache')
  debug.info('Checking cache data folder...')
  const data = resolve(DATA, 'cache')
  if (!fs.existsSync(data)) {
    debug.info('Creating cache data folder...')
    fs.mkdirSync(data, { recursive: true })
  }
  debug.success('Cache data folder is ready')
}

export function registCache(name: string) {
  const debug = Debug.create('Cache')
  const dataPath = resolve(DATA, 'cache', `${name}.json`)
  debug.info('Registering cache data file...', dataPath, fs.existsSync(dataPath))
  if (!fs.existsSync(dataPath))
    fs.writeFileSync(dataPath, '')
  debug.success(`${name} is registered`)
  return dataPath
}

export function getCache<T>(name: string, key?: string): T | undefined {
  const dataPath = resolve(DATA, 'cache', `${name}.json`)
  const o = fs.readFileSync(dataPath, 'utf-8')
  const de = destr(o) as any
  if (key) {
    if (!de[key])
      return undefined
    if (de[key].expire && de[key].expire < Date.now()) {
      delete de[key]
      fs.writeFileSync(dataPath, JSON.stringify(de))
      return undefined
    }
    return de[key].value
  }
  return de
}

export function setCache(name: string, key: string, value: any, expire?: number) {
  const dataPath = resolve(DATA, 'cache', `${name}.json`)
  const o = getCache(name) as any || {}
  // o[key] = value
  o[key] = {
    value,
    expire: expire || Date.now() + 3600000,
  }
  fs.writeFileSync(dataPath, JSON.stringify(o))
  return true
}

export function removeCache(name: string) {
  const dataPath = resolve(DATA, 'cache', `${name}.json`)
  fs.unlinkSync(dataPath)
  return true
}

export function removeCacheKey(name: string, key: string) {
  const dataPath = resolve(DATA, 'cache', `${name}.json`)
  const o = getCache(name) as any || {}
  delete o[key]
  fs.writeFileSync(dataPath, JSON.stringify(o))
  return true
}
