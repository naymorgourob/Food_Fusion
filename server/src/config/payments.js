import { Prisma } from '../generated/prisma/client.ts'

// Share of the total a customer pays up front to place an order or confirm
// a table booking. Fixed at 30%; the client shows the same figure.
export const ADVANCE_RATE = new Prisma.Decimal('0.30')

// The advance is paid by sending money to one of the restaurant's accounts
// (numbers set by Admin in Settings) and submitting the transaction ID.
// Admin checks the money arrived and approves it — there is no payment
// gateway.
export const MANUAL_PAYMENT_METHODS = ['BKASH', 'NAGAD', 'ROCKET', 'BANK']
