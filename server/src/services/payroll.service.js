import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

// Salaries are paid outside the website (bank, mobile banking or cash);
// these records are the shared history admin and staff both see.
const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/
const METHODS = ['BANK', 'BKASH', 'NAGAD', 'ROCKET', 'CASH']

function assertPeriod(period) {
  if (!PERIOD.test(period ?? '')) throw new ApiError(400, 'Period must be a month like 2026-10.')
}

const STAFF_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  position: true,
  monthlySalary: true,
  isActive: true,
}

/** Every staff member with their salary and this month's payment, if any. */
export async function getPayroll(period) {
  assertPeriod(period)
  const staff = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: {
      ...STAFF_SELECT,
      salaryPayments: { where: { period }, include: { paidBy: { select: { fullName: true } } } },
    },
    orderBy: [{ isActive: 'desc' }, { fullName: 'asc' }],
  })

  const rows = staff.map(({ salaryPayments, ...member }) => ({
    ...member,
    payment: salaryPayments[0] ?? null,
  }))
  const active = rows.filter((row) => row.isActive)
  const sum = (list, pick) => list.reduce((total, row) => total + Number(pick(row) ?? 0), 0)

  return {
    period,
    staff: rows,
    summary: {
      staffCount: active.length,
      totalPayroll: sum(active, (row) => row.monthlySalary),
      paid: sum(rows, (row) => row.payment?.amount),
      paidCount: rows.filter((row) => row.payment).length,
      unpaidCount: active.filter((row) => !row.payment).length,
      salaryNotSet: active.filter((row) => row.monthlySalary == null).length,
      outstanding: sum(
        active.filter((row) => !row.payment),
        (row) => row.monthlySalary,
      ),
    },
  }
}

async function getStaffOrThrow(staffId) {
  const staff = await prisma.user.findUnique({ where: { id: staffId } })
  if (!staff || staff.role !== 'STAFF') throw new ApiError(404, 'Staff member not found.')
  return staff
}

export async function setMonthlySalary(staffId, monthlySalary) {
  await getStaffOrThrow(staffId)
  const amount = Number(monthlySalary)
  if (!Number.isFinite(amount) || amount < 0)
    throw new ApiError(400, 'Salary must be zero or more.')
  return prisma.user.update({
    where: { id: staffId },
    data: { monthlySalary: amount.toFixed(2) },
    select: STAFF_SELECT,
  })
}

export async function recordSalaryPayment(
  adminId,
  { staffId, period, amount, method, reference, note },
) {
  assertPeriod(period)
  await getStaffOrThrow(staffId)
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0)
    throw new ApiError(400, 'Amount must be greater than zero.')
  if (!METHODS.includes(method))
    throw new ApiError(400, `Method must be one of: ${METHODS.join(', ')}.`)
  if (method !== 'CASH' && !reference?.trim()) {
    throw new ApiError(400, 'Add the transaction or reference ID for this transfer.')
  }

  const existing = await prisma.salaryPayment.findUnique({
    where: { staffId_period: { staffId, period } },
  })
  if (existing) throw new ApiError(409, 'This staff member is already paid for that month.')

  return prisma.salaryPayment.create({
    data: {
      staffId,
      period,
      amount: value.toFixed(2),
      method,
      reference: reference?.trim() || null,
      note: note?.trim() || null,
      paidById: adminId,
    },
  })
}

// Undo a mistaken entry (e.g. wrong amount) so it can be recorded again.
export async function deleteSalaryPayment(id) {
  const payment = await prisma.salaryPayment.findUnique({ where: { id } })
  if (!payment) throw new ApiError(404, 'Salary payment not found.')
  await prisma.salaryPayment.delete({ where: { id } })
}

/** A staff member's own payslips, newest month first. */
export async function listMySalaryPayments(staffId) {
  const [me, payments] = await Promise.all([
    prisma.user.findUnique({ where: { id: staffId }, select: { monthlySalary: true } }),
    prisma.salaryPayment.findMany({ where: { staffId }, orderBy: { period: 'desc' } }),
  ])
  return { monthlySalary: me?.monthlySalary ?? null, payments }
}
