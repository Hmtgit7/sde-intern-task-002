import type { ContentfulStatusCode } from 'hono/utils/http-status'

// An error we throw on purpose. The global handler in index.ts turns it into
// { "error": message } with the right status code.
export class HttpError extends Error {
  readonly status: ContentfulStatusCode

  constructor(status: ContentfulStatusCode, message: string) {
    super(message)
    this.status = status
  }
}
