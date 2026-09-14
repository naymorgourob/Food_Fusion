import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, CalendarDays, Users, Armchair, MessageSquare, UtensilsCrossed, Upload } from 'lucide-react'
import { fetchTables } from '@/features/tables/services/tableService'
import { createReservation } from '@/features/reservations/services/reservationService'
import { RESERVATION_OCCASIONS } from '@/features/reservations/constants'
import { TablePicker } from '@/features/reservations/components/TablePicker'
import { ReservationSummary } from '@/features/reservations/components/ReservationSummary'
import { FIELD, LABEL, OPTIONAL } from '@/features/orders/components/fieldStyles'
import { useAuth } from '@/hooks/useAuth'
import { money } from '@/utils/format'
import { fetchPaymentContact } from '@/features/settings/services/settingsService'

/**
 * The booking flow (UI-06): when → who → where → anything else.
 *
 * Replaces a single 9-field form that asked for name, phone, table, guests,
 * date, time, occasion and requests all at once — which made a two-minute
 * task look like paperwork.
 *
 * The submitted payload is byte-for-byte what the old form sent, so
 * reservation.service.js and its validator are untouched. Name and phone
 * are still submitted; they're pre-filled from the signed-in profile and
 * shown on the last step for correction rather than asked for up front,
 * because the customer already told us who they are when they registered.
 */

const STEPS = [
  { label: 'When', icon: CalendarDays },
  { label: 'Guests', icon: Users },
  { label: 'Table', icon: Armchair },
  { label: 'Details', icon: MessageSquare },
]

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  tableId: '',
  guestCount: '',
  reservationDate: '',
  reservationTime: '',
  specialRequest: '',
  occasion: '',
  occasionNote: '',
  paymentReference: '',
  paymentProof: null,
}

// Service windows the restaurant actually runs, offered as chips so the
// customer isn't left guessing what a valid time looks like. A free
// <input type="time"> stays available for anything in between.
const SUGGESTED_TIMES = ['12:00', '12:30', '13:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']

const GUEST_CHIPS = [1, 2, 3, 4, 5, 6, 8]

function todayIsoDate() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10)
}

/** The next `count` days, as chips, so the common case is one tap. */
function upcomingDays(count = 5) {
  const days = []
  for (let index = 0; index < count; index += 1) {
    const date = new Date()
    date.setDate(date.getDate() + index)
    const offset = date.getTimezoneOffset()
    days.push({
      iso: new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10),
      weekday: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString([], { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString([], { month: 'short' }),
    })
  }
  return days
}

function StepRail({ current, furthest, onJump }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {STEPS.map(({ label }, index) => {
        const done = index < current
        const active = index === current
        const reachable = index <= furthest && index !== current

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(index)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${label}${done ? ' (completed)' : ''}`}
              className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done
                  ? 'bg-brand-700 text-white hover:bg-brand-800'
                  : active
                    ? 'bg-gold-500 text-charcoal ring-4 ring-gold-500/20'
                    : 'bg-canvas-2 text-body-faint'
              } ${reachable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </button>
            <span
              className={`hidden text-xs font-semibold whitespace-nowrap sm:inline ${
                done || active ? 'text-body' : 'text-body-faint'
              }`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span className={`h-px flex-1 ${done ? 'bg-brand-700' : 'bg-rule'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function ReservationWizard({ onCreated }) {
  const { user } = useAuth()

  const [step, setStep] = useState(0)
  const [furthest, setFurthest] = useState(0)
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    customerName: user?.fullName ?? '',
    customerPhone: user?.phone ?? '',
  }))
  const [preOrder, setPreOrder] = useState(false)
  const [tables, setTables] = useState([])
  const [tablesLoading, setTablesLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])
  const [paymentContact, setPaymentContact] = useState(null)

  useEffect(() => {
    // Reuses the Part 10 table service as-is — this reservation form is
    // the concrete reason GET /tables was loosened to any authenticated
    // role (see server/src/routes/tables.routes.js).
    fetchTables()
      .then((data) => setTables(data.filter((table) => table.status !== 'INACTIVE')))
      .catch(() => setTables([]))
      .finally(() => setTablesLoading(false))
  }, [])

  useEffect(() => {
    fetchPaymentContact().then(setPaymentContact).catch(() => setPaymentContact(null))
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function go(next) {
    setStep(next)
    setFurthest((current) => Math.max(current, next))
    setErrors([])
  }

  const selectedTable = tables.find((table) => table.id === form.tableId) ?? null
  const reservationCost = Number(selectedTable?.reservationCost ?? 0)
  const advanceAmount = reservationCost * 0.2

  const canAdvance =
    step === 0
      ? Boolean(form.reservationDate && form.reservationTime)
      : step === 1
        ? Boolean(form.guestCount) && Number(form.guestCount) > 0
        : step === 2
          ? Boolean(form.tableId)
          : Boolean(
              form.customerName &&
                form.customerPhone &&
                selectedTable &&
                (form.paymentReference.trim() || form.paymentProof),
            )

  async function handleSubmit(event) {
    event.preventDefault()

    // Guard against submitting from an earlier step. AnimatePresence keeps
    // the outgoing step mounted while it animates out, so for a few frames
    // both step 3's "Continue" and step 4's submit button are in the DOM —
    // a click landing on the latter used to skip step 4 entirely and book
    // the table without the name, phone, requests, or pre-order choice.
    if (step !== STEPS.length - 1) return

    setErrors([])
    setIsSubmitting(true)
    try {
      // Exactly the payload the previous form sent — the extra `preOrder`
      // toggle is a UI affordance that routes to the ordering flow after
      // booking; there is no column for it, so it is never submitted.
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'paymentProof' && value !== '') payload.append(key, value)
      })
      if (form.paymentProof) payload.append('paymentProof', form.paymentProof)
      const reservation = await createReservation(payload)
      onCreated(reservation, { preOrder })
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  // Grid tracks use minmax(0,1fr) rather than the implicit `auto`: an
  // `auto` track grows to fit its widest child, which let the horizontally
  // scrolling date strip stretch the whole page on narrow screens.
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start"
    >
      <div className="flex min-w-0 flex-col gap-6 rounded-2xl border border-rule bg-card p-5 sm:p-7">
        <StepRail current={step} furthest={furthest} onJump={go} />

        {errors.length > 0 && (
          <ul
            role="alert"
            className="flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
          >
            {errors.map((message) => (
              <li key={message} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                {message}
              </li>
            ))}
          </ul>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-w-0 flex-col gap-5"
          >
            {/* --- Step 1: when ---------------------------------------- */}
            {step === 0 && (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-semibold text-body">When are you joining us?</h2>
                  <p className="text-sm text-body-muted">Pick a day and the time you&rsquo;d like your table.</p>
                </div>

                <div className="flex min-w-0 flex-col gap-2.5">
                  <span className={LABEL}>Date</span>
                  <div className="no-scrollbar -mx-1 flex min-w-0 gap-2.5 overflow-x-auto px-1 pb-1">
                    {upcomingDays().map((day) => {
                      const active = form.reservationDate === day.iso
                      return (
                        <button
                          key={day.iso}
                          type="button"
                          aria-pressed={active}
                          onClick={() => update('reservationDate', day.iso)}
                          className={`flex w-20 flex-none flex-col items-center gap-0.5 rounded-2xl border py-3 transition-all ${
                            active
                              ? 'border-brand-700 bg-brand-700 text-white'
                              : 'border-rule bg-card text-body-muted hover:-translate-y-0.5 hover:border-brand-200'
                          }`}
                        >
                          <span className="text-[0.65rem] font-semibold tracking-wide uppercase">
                            {day.weekday}
                          </span>
                          <span className="font-display text-xl leading-none font-semibold">{day.day}</span>
                          <span className="text-[0.65rem]">{day.month}</span>
                        </button>
                      )
                    })}
                  </div>

                  <label htmlFor="res-date" className="text-xs text-body-faint">
                    Or choose another date
                  </label>
                  <input
                    id="res-date"
                    type="date"
                    min={todayIsoDate()}
                    required
                    value={form.reservationDate}
                    onChange={(event) => update('reservationDate', event.target.value)}
                    className={FIELD}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className={LABEL}>Time</span>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TIMES.map((time) => {
                      const active = form.reservationTime === time
                      return (
                        <button
                          key={time}
                          type="button"
                          aria-pressed={active}
                          onClick={() => update('reservationTime', time)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                            active
                              ? 'border-brand-700 bg-brand-700 text-white'
                              : 'border-rule bg-card text-body-muted hover:-translate-y-0.5 hover:border-brand-200'
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>

                  <label htmlFor="res-time" className="text-xs text-body-faint">
                    Or choose another time
                  </label>
                  <input
                    id="res-time"
                    type="time"
                    required
                    value={form.reservationTime}
                    onChange={(event) => update('reservationTime', event.target.value)}
                    className={FIELD}
                  />
                </div>
              </>
            )}

            {/* --- Step 2: guests + occasion --------------------------- */}
            {step === 1 && (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-semibold text-body">Who&rsquo;s coming?</h2>
                  <p className="text-sm text-body-muted">
                    We&rsquo;ll match you to a table that seats everyone.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className={LABEL}>Number of guests</span>
                  <div className="flex flex-wrap gap-2">
                    {GUEST_CHIPS.map((count) => {
                      const active = Number(form.guestCount) === count
                      return (
                        <button
                          key={count}
                          type="button"
                          aria-pressed={active}
                          onClick={() => update('guestCount', String(count))}
                          className={`h-11 w-11 rounded-full border font-display text-base font-semibold transition-all ${
                            active
                              ? 'border-brand-700 bg-brand-700 text-white'
                              : 'border-rule bg-card text-body-muted hover:-translate-y-0.5 hover:border-brand-200'
                          }`}
                        >
                          {count}
                        </button>
                      )
                    })}
                  </div>

                  <label htmlFor="res-guests" className="text-xs text-body-faint">
                    Larger party? Enter a number
                  </label>
                  <input
                    id="res-guests"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.guestCount}
                    onChange={(event) => update('guestCount', event.target.value)}
                    className={FIELD}
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className={LABEL}>
                    Occasion <span className={OPTIONAL}>(optional)</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {RESERVATION_OCCASIONS.map(({ value, label }) => {
                      const active = form.occasion === value
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => update('occasion', active ? '' : value)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                            active
                              ? 'border-gold-500 bg-gold-500 text-charcoal'
                              : 'border-rule bg-card text-body-muted hover:-translate-y-0.5 hover:border-gold-300'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Only meaningful alongside "Others" — the backend
                      discards it for the named occasions. */}
                  {form.occasion === 'OTHER' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex flex-col gap-1.5 pt-1"
                    >
                      <label htmlFor="res-occasion-note" className={LABEL}>
                        Tell us the occasion
                      </label>
                      <input
                        id="res-occasion-note"
                        value={form.occasionNote}
                        onChange={(event) => update('occasionNote', event.target.value)}
                        placeholder="e.g. Graduation dinner"
                        className={FIELD}
                      />
                    </motion.div>
                  )}
                </div>
              </>
            )}

            {/* --- Step 3: table -------------------------------------- */}
            {step === 2 && (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-semibold text-body">Choose your table</h2>
                  <p className="text-sm text-body-muted">
                    Tables too small for {form.guestCount || 'your party'} are shown unavailable.
                  </p>
                </div>

                <TablePicker
                  tables={tables}
                  selectedId={form.tableId}
                  onSelect={(id) => update('tableId', id)}
                  guestCount={form.guestCount}
                  isLoading={tablesLoading}
                />
              </>
            )}

            {/* --- Step 4: details ------------------------------------ */}
            {step === 3 && (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-semibold text-body">Anything else?</h2>
                  <p className="text-sm text-body-muted">
                    Tell us how to reach you and anything we should prepare for.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="res-name" className={LABEL}>
                      Name
                    </label>
                    <input
                      id="res-name"
                      required
                      value={form.customerName}
                      onChange={(event) => update('customerName', event.target.value)}
                      className={FIELD}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="res-phone" className={LABEL}>
                      Phone number
                    </label>
                    <input
                      id="res-phone"
                      required
                      value={form.customerPhone}
                      onChange={(event) => update('customerPhone', event.target.value)}
                      className={FIELD}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-gold-300 bg-gold-100/60 p-5 dark:border-gold-700 dark:bg-gold-100/10">
                  <div>
                    <span className={LABEL}>Table reservation cost</span>
                    <p className="mt-1 text-sm font-semibold text-body">{selectedTable ? money(reservationCost) : 'Select a table first'}</p>
                    <p className="mt-1 text-xs text-body-muted">Required 20% advance: {selectedTable ? money(advanceAmount) : 'Select a table first'}.</p>
                    <p className="mt-2 text-sm font-semibold text-body">
                      Pay to {paymentContact?.restaurantName || 'FoodFusion'}: {paymentContact?.restaurantPhone || 'Contact the restaurant'}
                    </p>
                  </div>
                  <input
                    value={form.paymentReference}
                    onChange={(event) => update('paymentReference', event.target.value)}
                    className={FIELD}
                    placeholder="Transaction ID / Reference ID"
                  />
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-rule bg-card px-4 py-3 text-sm text-body-muted">
                    <Upload className="h-4 w-4" />
                    <span>{form.paymentProof ? form.paymentProof.name : 'Upload payment screenshot or photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => update('paymentProof', event.target.files?.[0] ?? null)}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-body-faint">Your proof is sent to the restaurant for verification before the reservation is confirmed.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="res-request" className={LABEL}>
                    Special requests <span className={OPTIONAL}>(optional)</span>
                  </label>
                  <textarea
                    id="res-request"
                    rows={3}
                    value={form.specialRequest}
                    onChange={(event) => update('specialRequest', event.target.value)}
                    placeholder="A quiet corner, a high chair, dietary needs…"
                    className={FIELD}
                  />
                </div>

                {/* Dining choice. Reserve-only books the table; the
                    pre-order option hands off to the ordering flow after
                    the booking is created — the two are separate records
                    in this system, so this is a routing choice, not a
                    field on the reservation. */}
                <div className="flex flex-col gap-2.5">
                  <span className={LABEL}>Dining</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: false, title: 'Reserve only', hint: 'Order when you arrive' },
                      { value: true, title: 'Reserve + pre-order', hint: 'Food ready as you sit down' },
                    ].map(({ value, title, hint }) => {
                      const active = preOrder === value
                      return (
                        <button
                          key={title}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setPreOrder(value)}
                          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                            active
                              ? 'border-brand-700 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30'
                              : 'border-rule bg-card hover:-translate-y-0.5 hover:border-brand-200'
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${
                              active ? 'bg-brand-700 text-white' : 'bg-canvas-2 text-body-muted'
                            }`}
                          >
                            <UtensilsCrossed className="h-4 w-4" />
                          </span>
                          <span className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-body">{title}</span>
                            <span className="text-xs text-body-faint">{hint}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* --- Navigation ------------------------------------------- */}
        <div className="flex items-center justify-between gap-3 border-t border-rule pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {/* Distinct keys: without them React reuses the same <button>
              DOM node across the Continue -> Submit swap, so a click can
              land on the newly-swapped-in submit handler. */}
          {step < STEPS.length - 1 ? (
            <button
              key="advance"
              type="button"
              disabled={!canAdvance}
              onClick={() => go(step + 1)}
              className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Continue
            </button>
          ) : (
            <button
              key="submit"
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Reserving…' : 'Confirm reservation'}
            </button>
          )}
        </div>
      </div>

      <ReservationSummary
        form={form}
        table={selectedTable}
        preOrder={preOrder}
        className="lg:sticky lg:top-24"
      />
    </form>
  )
}
