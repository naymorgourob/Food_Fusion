import { useState } from 'react'
import { Check, Copy, Info, Smartphone, Landmark, Upload } from 'lucide-react'
import { money } from '@/utils/format'
import { ADVANCE_METHODS } from '@/features/payments/constants'
import { compressImage } from '@/utils/compressImage'

/**
 * Pay the advance by sending money: pick bKash / Nagad / Rocket / bank,
 * see the restaurant's account for it, then enter the TrxID (screenshot
 * optional). Methods without an account in Settings are shown disabled.
 */
export function AdvancePaymentFields({
  accounts,
  method,
  onMethodChange,
  reference,
  onReferenceChange,
  proof,
  onProofChange,
  advanceAmount,
  approvalNote,
}) {
  const [copied, setCopied] = useState(false)
  const selected = ADVANCE_METHODS.find((entry) => entry.id === method)
  const account = selected ? accounts?.[selected.id]?.trim() : ''
  const anyAvailable = ADVANCE_METHODS.some(({ id }) => accounts?.[id]?.trim())

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked; the number is on screen to copy by hand.
    }
  }

  if (accounts && !anyAvailable) {
    return (
      <p className="flex items-start gap-2 rounded-2xl border border-rule bg-canvas p-4 text-sm text-body-muted">
        <Info className="mt-0.5 h-4 w-4 flex-none" />
        Advance payment isn&rsquo;t set up yet. Please call the restaurant.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold tracking-wide text-body-muted uppercase">
          Send the advance with
        </legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ADVANCE_METHODS.map(({ id, label }) => {
            const available = Boolean(accounts?.[id]?.trim())
            const active = method === id
            const Icon = id === 'BANK' ? Landmark : Smartphone
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!available}
                title={available ? undefined : 'Not available'}
                onClick={() => onMethodChange(id)}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? 'border-brand-700 bg-brand-50 text-body dark:border-brand-400 dark:bg-brand-900/30'
                    : 'border-rule bg-card text-body-muted hover:border-brand-200'
                }`}
              >
                <Icon className="h-4 w-4 flex-none" />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {selected && account && (
        <div className="flex flex-col gap-1 rounded-2xl border border-gold-300 bg-gold-100/60 p-4 dark:border-gold-700 dark:bg-gold-100/10">
          <span className="text-xs text-body-muted">
            Send {advanceAmount != null ? <strong>{money(advanceAmount)}</strong> : 'the advance'}{' '}
            to this {selected.accountLabel}:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold break-all text-body">{account}</span>
            <button
              type="button"
              onClick={copyAccount}
              aria-label={`Copy ${selected.accountLabel}`}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-body-muted hover:bg-card hover:text-body"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {selected && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-body-muted">
              Transaction ID (TrxID) <span className="text-red-600">*</span>
            </span>
            <input
              value={reference}
              onChange={(event) => onReferenceChange(event.target.value)}
              required
              className="rounded-xl border border-rule bg-card px-3 py-2.5 text-sm text-body"
              placeholder={selected.id === 'BANK' ? 'Bank reference number' : 'e.g. 9JK4XYZ12A'}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-rule bg-card px-4 py-3 text-sm text-body-muted">
            <Upload className="h-4 w-4 flex-none" />
            <span>{proof ? proof.name : 'Add a screenshot of the payment (optional)'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (event) => {
                const file = event.target.files?.[0] ?? null
                // Smaller upload: full-size screenshots timed out on slow connections.
                onProofChange(file ? await compressImage(file) : null)
              }}
              className="sr-only"
            />
          </label>
          <p className="flex items-start gap-2 text-xs text-body-faint">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
            {approvalNote}
          </p>
        </>
      )}
    </div>
  )
}
