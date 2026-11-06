import { Hono } from 'hono'
import { HttpError } from './errors'
import { homes } from './routes/homes'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.route('/api/homes', homes)

// Every error response is JSON: { "error": "message" }
app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json({ error: err.message }, err.status)
  }
  // Unexpected error: log it, but never leak internals to the client.
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
