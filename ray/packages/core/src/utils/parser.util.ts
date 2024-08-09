export function imageParser(payload: any, done: any): void {
  const body = payload.body
  done(null, body)
}
