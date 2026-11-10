import { useEffect, useState } from 'react'
import * as settingsService from '@/features/settings/services/settingsService'
import { RestaurantStatusCard } from '@/features/settings/components/RestaurantStatusCard'
import { useRestaurantStatus } from '@/features/settings/hooks/useRestaurantStatus'

const EMPTY_FORM = {
  restaurantName: '',
  restaurantAddress: '',
  restaurantPhone: '',
  restaurantEmail: '',
  vatPercentage: '',
  currencySymbol: '',
  // Part 18.1 — loyalty scheme configuration.
  loyaltyPointsPerCurrency: '',
  loyaltyPointValue: '',
  firstOrderBonusPoints: '',
  openingTime: '',
  closingTime: '',
  bkashNumber: '',
  nagadNumber: '',
  rocketNumber: '',
  bankAccount: '',
}

const INPUT_CLASSES =
  'w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:border-ember-500 focus:outline-none focus:ring-3 focus:ring-ember-100'

function formFromSettings(settings) {
  return {
    restaurantName: settings.restaurantName,
    restaurantAddress: settings.restaurantAddress,
    restaurantPhone: settings.restaurantPhone,
    restaurantEmail: settings.restaurantEmail,
    vatPercentage: settings.vatPercentage,
    currencySymbol: settings.currencySymbol,
    loyaltyPointsPerCurrency: settings.loyaltyPointsPerCurrency,
    loyaltyPointValue: settings.loyaltyPointValue,
    firstOrderBonusPoints: settings.firstOrderBonusPoints,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    bkashNumber: settings.bkashNumber,
    nagadNumber: settings.nagadNumber,
    rocketNumber: settings.rocketNumber,
    bankAccount: settings.bankAccount,
  }
}

// Admin-only (see App.jsx). GET /settings always returns a row — the
// backend upserts a default one into existence on first read — so this
// form is never waiting on a "create settings" step of its own.
export default function SettingsPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const { refresh: refreshStatus } = useRestaurantStatus()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const settings = await settingsService.fetchSettings()
        if (!cancelled) setForm(formFromSettings(settings))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors([])
    setSuccessMessage('')
    setIsSubmitting(true)
    try {
      const updated = await settingsService.updateSettings(form)
      setForm(formFromSettings(updated))
      setSuccessMessage('Settings updated successfully.')
      // New opening hours change open/closed straight away.
      refreshStatus()
    } catch (error) {
      const details = error.response?.data?.details
      const message = error.response?.data?.message ?? 'Something went wrong. Please try again.'
      setErrors(details && details.length > 0 ? details : [message])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-ink-muted">Loading settings…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <RestaurantStatusCard />
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-border bg-surface p-6"
      >
        <h2 className="text-h4 font-semibold text-ink">Restaurant Settings</h2>

        {successMessage && (
          <p className="rounded-md border border-success-soft bg-success-soft px-3 py-2 text-sm text-success">
            {successMessage}
          </p>
        )}
        {errors.length > 0 && (
          <ul className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-name" className="text-sm font-medium text-ink">
            Restaurant Name
          </label>
          <input
            id="settings-name"
            required
            value={form.restaurantName}
            onChange={updateField('restaurantName')}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="settings-address" className="text-sm font-medium text-ink">
            Restaurant Address
          </label>
          <textarea
            id="settings-address"
            rows={2}
            required
            value={form.restaurantAddress}
            onChange={updateField('restaurantAddress')}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-phone" className="text-sm font-medium text-ink">
              Restaurant Phone
            </label>
            <input
              id="settings-phone"
              required
              value={form.restaurantPhone}
              onChange={updateField('restaurantPhone')}
              className={INPUT_CLASSES}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-email" className="text-sm font-medium text-ink">
              Restaurant Email
            </label>
            <input
              id="settings-email"
              type="email"
              required
              value={form.restaurantEmail}
              onChange={updateField('restaurantEmail')}
              className={INPUT_CLASSES}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-vat" className="text-sm font-medium text-ink">
              VAT Percentage (%)
            </label>
            <input
              id="settings-vat"
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              value={form.vatPercentage}
              onChange={updateField('vatPercentage')}
              className={INPUT_CLASSES}
            />
            <p className="text-xs text-ink-faint">
              Used as the default VAT rate when generating a bill.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-currency" className="text-sm font-medium text-ink">
              Currency Symbol
            </label>
            <input
              id="settings-currency"
              required
              maxLength={5}
              value={form.currencySymbol}
              onChange={updateField('currencySymbol')}
              className={INPUT_CLASSES}
            />
          </div>
        </div>

        {/* Part 18.1 — the loyalty scheme's three tunable numbers. Grouped
          under their own heading so they read as one coherent policy
          rather than more restaurant-profile fields. */}
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-ink">Loyalty Program</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-loyalty-rate" className="text-sm font-medium text-ink">
                Points per {form.currencySymbol || '৳'}1
              </label>
              <input
                id="settings-loyalty-rate"
                type="number"
                min="0"
                step="0.001"
                required
                value={form.loyaltyPointsPerCurrency}
                onChange={updateField('loyaltyPointsPerCurrency')}
                className={INPUT_CLASSES}
              />
              <p className="text-xs text-ink-faint">0.1 means 100 spent earns 10 points.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-point-value" className="text-sm font-medium text-ink">
                Value per point
              </label>
              <input
                id="settings-point-value"
                type="number"
                min="0"
                step="0.001"
                required
                value={form.loyaltyPointValue}
                onChange={updateField('loyaltyPointValue')}
                className={INPUT_CLASSES}
              />
              <p className="text-xs text-ink-faint">Discount each point is worth at checkout.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-first-order-bonus" className="text-sm font-medium text-ink">
                First order bonus
              </label>
              <input
                id="settings-first-order-bonus"
                type="number"
                min="0"
                step="1"
                required
                value={form.firstOrderBonusPoints}
                onChange={updateField('firstOrderBonusPoints')}
                className={INPUT_CLASSES}
              />
              <p className="text-xs text-ink-faint">
                Awarded once, on a customer&apos;s first completed order.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-ink">Advance Payment Accounts</h3>
            <p className="text-xs text-ink-faint">
              Customers send the 30% advance to these and enter the TrxID; you approve it once the
              money arrives. Leave a field empty to hide that method.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-bkash" className="text-sm font-medium text-ink">
                bKash number
              </label>
              <input
                id="settings-bkash"
                inputMode="tel"
                placeholder="01XXXXXXXXX"
                value={form.bkashNumber}
                onChange={updateField('bkashNumber')}
                className={INPUT_CLASSES}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-nagad" className="text-sm font-medium text-ink">
                Nagad number
              </label>
              <input
                id="settings-nagad"
                inputMode="tel"
                placeholder="01XXXXXXXXX"
                value={form.nagadNumber}
                onChange={updateField('nagadNumber')}
                className={INPUT_CLASSES}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-rocket" className="text-sm font-medium text-ink">
                Rocket number
              </label>
              <input
                id="settings-rocket"
                inputMode="tel"
                placeholder="01XXXXXXXXX"
                value={form.rocketNumber}
                onChange={updateField('rocketNumber')}
                className={INPUT_CLASSES}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-bank" className="text-sm font-medium text-ink">
              Bank account details
            </label>
            <textarea
              id="settings-bank"
              rows={2}
              maxLength={200}
              placeholder="Account name · account number · bank and branch"
              value={form.bankAccount}
              onChange={updateField('bankAccount')}
              className={INPUT_CLASSES}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-ink">Opening Hours</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-opening-time" className="text-sm font-medium text-ink">
                Opens at
              </label>
              <input
                id="settings-opening-time"
                type="time"
                required
                value={form.openingTime}
                onChange={updateField('openingTime')}
                className={INPUT_CLASSES}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="settings-closing-time" className="text-sm font-medium text-ink">
                Closes at
              </label>
              <input
                id="settings-closing-time"
                type="time"
                required
                value={form.closingTime}
                onChange={updateField('closingTime')}
                className={INPUT_CLASSES}
              />
            </div>
          </div>
          <p className="text-xs text-ink-faint">
            Every day, Bangladesh time. The restaurant opens and closes on these times
            automatically.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="self-start rounded-md bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
