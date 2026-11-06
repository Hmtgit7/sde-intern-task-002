import { HttpError } from './errors'

// Throws a 404 when the home does not exist. Used by every route that lives under a home.
export async function requireHome(db: D1Database, homeId: string): Promise<void> {
  const home = await db
    .prepare('SELECT id FROM homes WHERE id = ?')
    .bind(homeId)
    .first<{ id: string }>()
  if (!home) {
    throw new HttpError(404, 'Home not found')
  }
}
