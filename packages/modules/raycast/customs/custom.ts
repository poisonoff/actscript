import { ResponseDone } from '@as/shared'

/**
 * @url https://backend.raycast.com/api/v1/me/trial_status
 */
export function raycastTrialStatus() {
  const body = $request.body || '{}'
  const data = JSON.parse(body)
  data.organizations = []
  data.trial_limits = {
    commands_limit: 999,
    quicklinks_limit: 999,
    snippets_limit: 999,
  }

  return ResponseDone({
    body: data,
  })
}
