import 'dotenv/config'

// Every other file reads config from here, never from process.env directly —
// one place to see the full list of variables the app depends on, and one
// place that fails loudly at boot if something required is missing.
const required = ['DATABASE_URL', 'JWT_SECRET']

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  // Trimmed and without a trailing slash: it is compared exactly against
  // the browser's Origin header for CORS, and a pasted value can carry
  // stray whitespace or a "/" that would silently block every request.
  clientUrl: (process.env.CLIENT_URL ?? 'http://localhost:5173').trim().replace(/\/+$/, ''),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  apiPublicUrl: (process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 5000}`)
    .trim()
    .replace(/\/+$/, ''),
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID,
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD,
    live: process.env.SSLCOMMERZ_LIVE === 'true',
  },
}
