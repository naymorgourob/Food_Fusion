import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { env } from './env.js'

// Prisma's generated client connects through an explicit driver adapter
// rather than an implicit engine — this is what the `pg` package in the
// approved stack is actually for. One PrismaClient instance is created here
// and imported everywhere else, so the app never opens more connection
// pools than it needs to.
//
// --- Concurrency workaround for @prisma/adapter-pg 7.8.0 ---
//
// The adapter sends every query as Postgres's *unnamed* prepared statement,
// of which there is exactly one per session. Overlapping queries clobber
// each other's parameter plan, and Postgres rejects the loser with
// "bind message supplies N parameters, but prepared statement "" requires M"
// (SQLSTATE 08P01).
//
// This is not specific to any model added recently: a bare
// `prisma.food.findMany()` (a Part 9 model) fails ~10 times out of 15 when
// run concurrently. It simply went unnoticed until the customer dashboard
// became the first screen to issue several independent reads at once.
//
// The fix is two parts, and both are needed:
//   1. max: 1 — one connection, so there is exactly one unnamed statement
//      to contend over. With a larger pool the adapter still reuses
//      connections unsafely (PrismaPgAdapter.performIO calls
//      this.client.query directly rather than checking one out per query),
//      and roughly one request per parallel batch still failed.
//   2. The FIFO queue below — one query in flight at a time, so nothing
//      overlaps on that single connection.
// Measured: 72/72 concurrent requests succeed with both; without them,
// ~1 in 5 returned a 500.
//
// Rejected alternatives, recorded so this isn't re-litigated:
//   * statementNameGenerator — pg re-PREPAREs on every call, so any reused
//     name raises "prepared statement already exists".
//   * Upgrading only @prisma/adapter-pg to 7.9.1 — adapter and client must
//     be the same version, and the client is pinned at 7.8.0.
//
// Upgrading the whole Prisma set past 7.8.0 is the real fix and would let
// all of this be deleted, restoring a normal pool.
const pool = new pg.Pool({ connectionString: env.databaseUrl, max: 1 })

let queryChain = Promise.resolve()
const runPoolQuery = pool.query.bind(pool)

pool.query = (...args) => {
  // Chained off both outcomes so one rejected query can't stall the queue.
  const result = queryChain.then(
    () => runPoolQuery(...args),
    () => runPoolQuery(...args),
  )
  queryChain = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

// pool.connect() is deliberately left untouched. Transactions run on their
// own checked-out client (see PrismaPgAdapter.startTransaction), so their
// statements are already isolated. Both attempts to involve them here were
// tried and reverted: routing their statements through the queue deadlocks
// (a transaction holds its connection from BEGIN to COMMIT, so its own
// statements end up waiting behind its unsettled queue entry), and handing
// them a fresh dedicated pg.Client hangs the adapter's release path.
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
