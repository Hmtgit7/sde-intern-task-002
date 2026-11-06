import type { HonoRequest } from 'hono'
import { HttpError } from './errors'

const MAX_TEXT_LENGTH = 100

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Reads the JSON body. Broken JSON, or JSON that is not an object, is a 400.
export async function readJsonObject(req: HonoRequest): Promise<Record<string, unknown>> {
  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON')
  }
  if (!isRecord(parsed)) {
    throw new HttpError(400, 'Request body must be a JSON object')
  }
  return parsed
}

// A required text field: must be a string, not blank, and not too long. A bad value is a 422.
export function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(422, `${field} must be a non-empty string`)
  }
  const text = value.trim()
  if (text.length > MAX_TEXT_LENGTH) {
    throw new HttpError(422, `${field} must be at most ${MAX_TEXT_LENGTH} characters`)
  }
  return text
}

// Money: a positive whole number of cents. Rejects 0, negatives, decimals (10.5), numbers
// sent as text ("1000"), null, and numbers too big to be exact in JavaScript. A bad value is a 422.
export function requireCents(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new HttpError(422, `${field} must be a positive whole number of cents`)
  }
  return value
}
