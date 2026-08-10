import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { sendSuccess } from './utils/ApiResponse.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Uploaded menu images — served as plain static files, not through the
// /api/v1 JSON API. Cross-Origin-Resource-Policy is relaxed only for this
// path (Helmet's default 'same-origin' would otherwise block the Vite dev
// server on a different origin/port from displaying them in an <img>).
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin'),
  }),
)

// Simple liveness check — useful for confirming a Render deployment is up,
// and for confirming the server is running at all during local setup.
app.get('/health', (req, res) => {
  sendSuccess(res, { message: 'FoodFusion API is running' })
})

app.use('/api/v1', routes)

app.use(notFound)
app.use(errorHandler)
