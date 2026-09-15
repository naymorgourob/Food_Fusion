import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, X, ChefHat, Sparkles } from 'lucide-react'
import { orderNo } from '@/utils/format'

const PRESET_MINUTES = [10, 15, 20, 30, 45]

export function QuickEtaModal({ order, isOpen, onClose, onSave, isSaving, error = '' }) {
  const [selectedMinutes, setSelectedMinutes] = useState(15)
  const [customMinutes, setCustomMinutes] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSelectedMinutes(15)
    setCustomMinutes('')
    setIsCustom(false)
  }, [isOpen, order?.id])

  if (!order || !isOpen) return null

  const minutesToAdd = isCustom ? Number(customMinutes) || 15 : selectedMinutes
  const targetDate = new Date(Date.now() + minutesToAdd * 60000)
  const formattedTargetTime = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  function handleSubmit(e) {
    e?.preventDefault?.()
    onSave(order, targetDate.toISOString(), minutesToAdd)
  }

  const isDelivery = order.orderType === 'DELIVERY'
  const customValue = Number(customMinutes)
  const customIsValid = Number.isInteger(customValue) && customValue >= 1 && customValue <= 180

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rule bg-card p-6 shadow-2xl"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-full p-2 text-body-muted hover:bg-canvas-2 hover:text-body"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              <ChefHat className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-body">
                {order.status === 'PENDING' ? 'Accept & Set Prep Time' : 'Set Kitchen ETA'}
              </h3>
              <p className="text-xs text-body-faint">
                {orderNo(order.orderNumber)} · {order.customer?.fullName}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {/* Target time preview */}
            <div className="flex items-center justify-between rounded-2xl border border-gold-300/40 bg-gold-50/50 p-4 dark:border-gold-800/40 dark:bg-gold-950/20">
              <div className="flex items-center gap-2 text-gold-900 dark:text-gold-200">
                <Clock className="h-5 w-5 text-gold-600" />
                <span className="text-xs font-semibold">
                  Estimated {isDelivery ? 'Delivery' : 'Ready'} Time:
                </span>
              </div>
              <div className="text-right">
                <span className="font-display text-lg font-bold text-gold-900 dark:text-gold-100">
                  {formattedTargetTime}
                </span>
                <span className="block text-[0.7rem] text-gold-700 dark:text-gold-300">
                  (+{minutesToAdd} minutes)
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold text-body-muted">Select Prep Duration:</label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {PRESET_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setSelectedMinutes(mins)
                      setIsCustom(false)
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl py-2.5 text-xs font-bold transition ${
                      !isCustom && selectedMinutes === mins
                        ? 'bg-brand-700 text-white shadow-md shadow-brand-900/10'
                        : 'border border-rule bg-canvas-2 text-body hover:bg-canvas'
                    }`}
                  >
                    <span>{mins}m</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Minutes Input */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  isCustom ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-rule text-body-muted'
                }`}
              >
                Custom
              </button>
              {isCustom && (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="Enter minutes (e.g. 25)"
                    className="w-full rounded-xl border border-rule bg-canvas-2 px-3 py-2 text-xs text-body focus:border-brand-500 focus:outline-none"
                    autoFocus
                  />
                  <span className="text-xs text-body-faint">min</span>
                </div>
              )}
            </div>

            {isCustom && customMinutes && !customIsValid && (
              <p className="text-xs font-medium text-red-600 dark:text-red-300">
                Enter a whole number between 1 and 180 minutes.
              </p>
            )}

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                {error}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-2 flex items-center justify-end gap-2 border-t border-rule pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-body-muted hover:bg-canvas-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || (isCustom && !customIsValid)}
                className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-800 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {isSaving
                  ? 'Saving…'
                  : order.status === 'PENDING'
                  ? 'Accept & Set ETA'
                  : 'Confirm ETA'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

