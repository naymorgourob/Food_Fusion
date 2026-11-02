import { Prisma } from '../generated/prisma/client.ts'

// Share of the total a customer pays up front to place an order or confirm
// a table booking. Fixed at 30%; the client shows the same figure.
export const ADVANCE_RATE = new Prisma.Decimal('0.30')
