import { Hono } from 'hono'
import { requireHome } from '../db'
import { HttpError } from '../errors'
import { splitAmongMembers } from '../split'
import { readJsonObject, requireCents, requireText } from '../validation'

export const bills = new Hono<{ Bindings: Env }>()

// POST /api/homes/:homeId/bills
bills.post('/homes/:homeId/bills', async (c) => {
  const db = c.env.DB
  const homeId = c.req.param('homeId')
  await requireHome(db, homeId)

  const body = await readJsonObject(c.req)
  const title = requireText(body.title, 'title')
  const totalCents = requireCents(body.totalCents, 'totalCents')

  // Members in the order they joined the home. "seq" is the auto-increment column.
  const { results: members } = await db
    .prepare('SELECT id FROM members WHERE home_id = ? ORDER BY seq')
    .bind(homeId)
    .all<{ id: string }>()
  if (members.length === 0) {
    throw new HttpError(422, 'Cannot create a bill for a home with no members')
  }

  const billId = crypto.randomUUID()
  const shares = splitAmongMembers(
    totalCents,
    members.map((member) => member.id),
  ).map((share) => ({ id: crypto.randomUUID(), ...share, paidAt: null }))

  // db.batch() runs all statements in ONE transaction: the bill and every share are saved
  // together, or none of them are. A failure can never leave a bill without its shares.
  const insertBill = db
    .prepare('INSERT INTO bills (id, home_id, title, total_cents) VALUES (?, ?, ?, ?)')
    .bind(billId, homeId, title, totalCents)
  const insertShares = shares.map((share) =>
    db
      .prepare('INSERT INTO shares (id, bill_id, member_id, amount_cents) VALUES (?, ?, ?, ?)')
      .bind(share.id, billId, share.memberId, share.amountCents),
  )
  await db.batch([insertBill, ...insertShares])

  return c.json({ id: billId, homeId, title, totalCents, shares }, 201)
})
