import { Hono } from 'hono'
import { requireHome } from '../db'
import { readJsonObject, requireText } from '../validation'

export const homes = new Hono<{ Bindings: Env }>()

// POST /api/homes
homes.post('/', async (c) => {
  const body = await readJsonObject(c.req)
  const name = requireText(body.name, 'name')
  const id = crypto.randomUUID()

  await c.env.DB.prepare('INSERT INTO homes (id, name) VALUES (?, ?)').bind(id, name).run()

  return c.json({ id, name }, 201)
})

// POST /api/homes/:homeId/members
// The members table has an auto-increment "seq" column, so the order members join is stored.
homes.post('/:homeId/members', async (c) => {
  const homeId = c.req.param('homeId')
  await requireHome(c.env.DB, homeId)

  const body = await readJsonObject(c.req)
  const name = requireText(body.name, 'name')
  const id = crypto.randomUUID()

  await c.env.DB.prepare('INSERT INTO members (id, home_id, name) VALUES (?, ?, ?)')
    .bind(id, homeId, name)
    .run()

  return c.json({ id, homeId, name }, 201)
})
