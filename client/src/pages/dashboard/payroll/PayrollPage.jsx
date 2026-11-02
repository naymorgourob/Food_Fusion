import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Users, CheckCircle2, Clock3, X, Pencil, Undo2, AlertCircle } from 'lucide-react'
import {
  fetchPayroll,
  updateSalary,
  recordSalaryPayment,
  removeSalaryPayment,
} from '@/features/payroll/services/payrollService'
import { money } from '@/utils/format'

const METHODS = [
  { value: 'BANK', label: 'Bank transfer' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'ROCKET', label: 'Rocket' },
  { value: 'CASH', label: 'Cash' },
]
const METHOD_LABEL = Object.fromEntries(METHODS.map(({ value, label }) => [value, label]))

const FIELD =
  'w-full rounded-xl border border-rule bg-card px-3.5 py-2.5 text-base text-body focus:border-brand-400 focus:outline-none'

function thisMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(period) {
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString([], { month: 'long', year: 'numeric' })
}

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-rule bg-card p-5">
      <span className="flex items-center justify-between text-sm font-semibold text-body-muted">
        {label}
        <Icon className="h-4 w-4" />
      </span>
      <span className="font-display text-2xl font-bold text-body">{value}</span>
      <span className="text-sm text-body-faint">{hint}</span>
    </div>
  )
}

/**
 * Payroll (admin). Salaries are paid outside the website — bank transfer,
 * bKash/Nagad/Rocket or cash — and recorded here with the transaction ID,
 * so admin and each staff member see the same history.
 */
export default function PayrollPage() {
  const [period, setPeriod] = useState(thisMonth)
  const [payroll, setPayroll] = useState(null)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(null)
  const [editing, setEditing] = useState(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const reload = useCallback(() => setRefreshIndex((index) => index + 1), [])

  useEffect(() => {
    let cancelled = false
    fetchPayroll(period)
      .then((data) => !cancelled && (setPayroll(data), setError('')))
      .catch(
        (err) => !cancelled && setError(err.response?.data?.message ?? 'Could not load payroll.'),
      )
    return () => {
      cancelled = true
    }
  }, [period, refreshIndex])

  async function undo(payment) {
    if (!window.confirm('Remove this salary payment record?')) return
    await removeSalaryPayment(payment.id)
    reload()
  }

  const summary = payroll?.summary

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-body">Payroll</h1>
          <p className="text-base text-body-muted">
            Set staff salaries and record each month&rsquo;s payment with its transaction ID.
          </p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body-muted">
          Month
          <input
            type="month"
            value={period}
            max={thisMonth()}
            onChange={(event) => event.target.value && setPeriod(event.target.value)}
            className={`${FIELD} w-48`}
          />
        </label>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          <AlertCircle className="h-5 w-5" />
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Users}
          label="Active staff"
          value={summary?.staffCount ?? '—'}
          hint="On payroll this month"
        />
        <Stat
          icon={Wallet}
          label="Monthly payroll"
          value={summary ? money(summary.totalPayroll) : '—'}
          hint="Sum of active salaries"
        />
        <Stat
          icon={CheckCircle2}
          label={`Paid · ${monthLabel(period)}`}
          value={summary ? money(summary.paid) : '—'}
          hint={
            summary
              ? `${summary.paidCount} payment${summary.paidCount === 1 ? '' : 's'} recorded`
              : ''
          }
        />
        <Stat
          icon={Clock3}
          label="Outstanding"
          value={summary ? money(summary.outstanding) : '—'}
          hint={
            summary
              ? `${summary.unpaidCount} not yet paid${summary.salaryNotSet ? ` · ${summary.salaryNotSet} with no salary set` : ''}`
              : ''
          }
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-rule bg-card">
        <div className="hidden grid-cols-[1.6fr_1fr_1.1fr_1.6fr_auto] gap-4 border-b border-rule px-5 py-3 text-sm font-semibold text-body-muted lg:grid">
          <span>Staff member</span>
          <span>Monthly salary</span>
          <span>Status</span>
          <span>Payment</span>
          <span className="w-32 text-right">Action</span>
        </div>
        {!payroll && !error && <p className="p-6 text-body-muted">Loading payroll…</p>}
        {payroll?.staff.length === 0 && (
          <p className="p-6 text-body-muted">No staff accounts yet.</p>
        )}
        {payroll?.staff.map((member) => {
          const paid = member.payment
          return (
            <div
              key={member.id}
              className={`grid gap-3 border-b border-rule px-5 py-4 last:border-b-0 lg:grid-cols-[1.6fr_1fr_1.1fr_1.6fr_auto] lg:items-center lg:gap-4 ${
                member.isActive ? '' : 'opacity-60'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold text-body">{member.fullName}</span>
                <span className="text-sm text-body-faint">
                  {member.position ?? 'Staff'}
                  {member.isActive ? '' : ' · inactive'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-body">
                  {member.monthlySalary != null ? money(Number(member.monthlySalary)) : 'Not set'}
                </span>
                <button
                  type="button"
                  onClick={() => setEditing(member)}
                  aria-label={`Edit salary for ${member.fullName}`}
                  className="rounded-lg p-1.5 text-body-faint transition-colors hover:bg-canvas-2 hover:text-body"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <span>
                {paid ? (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                    Paid
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Unpaid
                  </span>
                )}
              </span>

              <span className="text-sm text-body-muted">
                {paid ? (
                  <>
                    {money(Number(paid.amount))} · {METHOD_LABEL[paid.method]}
                    {paid.reference ? ` · ${paid.reference}` : ''}
                    <br />
                    <span className="text-body-faint">
                      {new Date(paid.paidAt).toLocaleDateString()} by{' '}
                      {paid.paidBy?.fullName ?? 'Admin'}
                    </span>
                  </>
                ) : (
                  '—'
                )}
              </span>

              <div className="flex w-32 justify-end">
                {paid ? (
                  <button
                    type="button"
                    onClick={() => undo(paid)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-2 text-sm font-semibold text-body-muted transition-colors hover:text-rose-500"
                  >
                    <Undo2 className="h-4 w-4" /> Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPaying(member)}
                    className="rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-charcoal transition-colors hover:bg-gold-400"
                  >
                    Pay salary
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {paying && (
          <PayModal
            member={paying}
            period={period}
            onClose={() => setPaying(null)}
            onDone={() => {
              setPaying(null)
              reload()
            }}
          />
        )}
        {editing && (
          <SalaryModal
            member={editing}
            onClose={() => setEditing(null)}
            onDone={() => {
              setEditing(null)
              reload()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-rule bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-body">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-body-faint hover:bg-canvas-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function PayModal({ member, period, onClose, onDone }) {
  const [form, setForm] = useState({
    amount: member.monthlySalary != null ? String(Number(member.monthlySalary)) : '',
    method: 'BANK',
    reference: '',
    note: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await recordSalaryPayment({ staffId: member.id, period, ...form })
      onDone()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not record the payment.')
      setSaving(false)
    }
  }

  return (
    <Modal title={`Pay ${member.fullName}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-body-muted">
          Salary for <strong className="text-body">{monthLabel(period)}</strong>. Send the money
          from your bank or mobile banking app first, then record it here.
        </p>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body-muted">
          Amount (৳)
          <input
            type="number"
            min="1"
            step="0.01"
            required
            value={form.amount}
            onChange={update('amount')}
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body-muted">
          Paid by
          <select value={form.method} onChange={update('method')} className={FIELD}>
            {METHODS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {form.method !== 'CASH' && (
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body-muted">
            Transaction / reference ID
            <input
              required
              value={form.reference}
              onChange={update('reference')}
              placeholder="e.g. 9K7X2AB1"
              className={FIELD}
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body-muted">
          Note <span className="font-normal text-body-faint">(optional)</span>
          <input
            value={form.note}
            onChange={update('note')}
            placeholder="e.g. includes Eid bonus"
            className={FIELD}
          />
        </label>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-1 rounded-full bg-gold-500 px-5 py-3 font-bold text-charcoal transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Record payment'}
        </button>
      </form>
    </Modal>
  )
}

function SalaryModal({ member, onClose, onDone }) {
  const [value, setValue] = useState(
    member.monthlySalary != null ? String(Number(member.monthlySalary)) : '',
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await updateSalary(member.id, value)
      onDone()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not save the salary.')
      setSaving(false)
    }
  }

  return (
    <Modal title={`Salary · ${member.fullName}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body-muted">
          Monthly salary (৳)
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={FIELD}
          />
        </label>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gold-500 px-5 py-3 font-bold text-charcoal transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save salary'}
        </button>
      </form>
    </Modal>
  )
}
