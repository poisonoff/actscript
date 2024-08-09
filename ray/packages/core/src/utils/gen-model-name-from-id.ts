export function genModelNameMaybeWithContextFromId(modelId: string, endpoint: string) {
  const _endpointId = endpoint.replace(/https?:\/\//, '').replace(/\./g, '-').replace(/\//g, '-')
  const _modelId = modelId.replace(_endpointId, '')
  const _model = _modelId.replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // 'gpt-4o' -> 'GPT 4o'
    .replace(/-\d+$/, '') // 'claude-3-sonnet-20240229' -> 'Claude 3 Sonnet'
    .replace(/(^|\s)[a-z]/g, L => L.toUpperCase()) // 'moonshot v1 -> 'Moonshot v1
    .replace(/(\d)-(\d)/g, '$1.$2')
    .replace(/Gpt/g, 'GPT') // 'gpt-4o' -> 'GPT 4o'

  // 检查后面有没有跟着什么 k
  const _context = _modelId.match(/-\d+k$/) || []
  // 取出 k 前面的数字
  const context = Number.parseInt(_context[0]?.replace('k', '').replace('-', '') || '16')
  return {
    name: _model,
    context,
  }
}
