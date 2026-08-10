import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  Trash2,
  Info,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useLocalPreferences } from '@/features/profile/hooks/useLocalPreferences'
import { AuthFormMessage } from '@/components/AuthFormMessage'
import { ROUTES } from '@/constants'

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 py-3">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-body">{label}</span>
        <span className="text-xs text-body-muted">{description}</span>
      </span>
      <span className="relative inline-flex h-6 w-11 flex-none items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-canvas-2 transition-colors peer-checked:bg-brand-700" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <section className="flex flex-col gap-1 rounded-2xl border border-rule bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-700 dark:text-brand-400" />
        <h2 className="font-display text-base font-semibold text-body">{title}</h2>
      </div>
      <div className="flex flex-col divide-y divide-rule">{children}</div>
    </section>
  )
}

/**
 * Account Settings (UI-09) — new page, no prior equivalent existed.
 *
 * Theme is the one genuinely functional setting here: it reads and writes
 * the app's real ThemeProvider, the same toggle used elsewhere in the
 * app, just relocated to a settings page.
 *
 * Notification Preferences and Language are real and persisted, but only
 * to this browser (useLocalPreferences/localStorage) — there is no
 * preferences table or notification-delivery system on the backend, and
 * the app has exactly one language. Both facts are stated in the section,
 * not hidden.
 *
 * Delete Account is UI-only, as the spec explicitly asked for. Clicking
 * it opens a confirmation that explains this rather than silently doing
 * nothing — a button with no disclosed behaviour would be worse than one
 * that says plainly what it doesn't do yet.
 */
export default function AccountSettingsPage({ profilePath = ROUTES.PROFILE }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { preferences, update } = useLocalPreferences()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas font-sans">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Link
            to={profilePath}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-body-muted transition-colors hover:text-brand-700 dark:hover:text-brand-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-body">Account settings</h1>
          <p className="text-sm text-body-muted">
            Signed in as <span className="font-medium text-body">{user?.email}</span>
          </p>
        </div>

        {/* --- Appearance -------------------------------------------- */}
        <SettingsSection icon={theme === 'dark' ? Moon : Sun} title="Appearance">
          <ToggleRow
            label="Dark mode"
            description="Applies everywhere in FoodFusion, on this device."
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </SettingsSection>

        {/* --- Notifications ------------------------------------------ */}
        <SettingsSection icon={Bell} title="Notification preferences">
          <ToggleRow
            label="Order updates"
            description="Status changes shown in the notifications bell."
            checked={preferences.notifyOrderUpdates}
            onChange={(value) => update({ notifyOrderUpdates: value })}
          />
          <ToggleRow
            label="Reservation updates"
            description="Confirmations and reminders shown in the notifications bell."
            checked={preferences.notifyReservationUpdates}
            onChange={(value) => update({ notifyReservationUpdates: value })}
          />
          <ToggleRow
            label="Offers and promotions"
            description="Seasonal menus and loyalty perks."
            checked={preferences.notifyPromotions}
            onChange={(value) => update({ notifyPromotions: value })}
          />
          <p className="flex items-start gap-2 pt-3 text-xs text-body-faint">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
            Saved to this device only — FoodFusion doesn&rsquo;t send email or push notifications
            yet, so these control what appears in-app.
          </p>
        </SettingsSection>

        {/* --- Language ------------------------------------------------ */}
        <SettingsSection icon={Globe} title="Language">
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-body">Display language</span>
              <span className="text-xs text-body-muted">FoodFusion is currently available in English only.</span>
            </span>
            <select
              disabled
              value={preferences.language}
              className="cursor-not-allowed rounded-xl border border-rule bg-canvas-2 px-3 py-2 text-sm text-body-faint"
            >
              <option value="en">English</option>
            </select>
          </div>
        </SettingsSection>

        {/* --- Privacy & security --------------------------------------- */}
        <SettingsSection icon={ShieldCheck} title="Privacy &amp; security">
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-body">Change your password</span>
              <span className="text-xs text-body-muted">Update the password used to sign in.</span>
            </span>
            <Link
              to={`${profilePath}#change-password`}
              className="rounded-full border border-rule px-4 py-2 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
            >
              Go to profile
            </Link>
          </div>
        </SettingsSection>

        {/* --- Danger zone ---------------------------------------------- */}
        <section className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-300" />
            <h2 className="font-display text-base font-semibold text-red-800 dark:text-red-200">Delete account</h2>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            Permanently remove your account and all associated data. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-fit rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            Delete my account
          </button>
        </section>

        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => setDeleteDialogOpen(false)}
              className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Delete account"
              className="relative z-10 w-full max-w-sm rounded-2xl border border-rule bg-card p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-body">Delete account</h2>
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-1 text-body-faint hover:bg-canvas-2 hover:text-body"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3">
                <AuthFormMessage
                  variant="info"
                  messages="Account deletion isn't available yet in this build — there's no delete endpoint to call. This dialog shows what the confirmation step will look like once there is."
                />
              </div>

              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="mt-4 w-full rounded-full border border-rule py-2.5 text-sm font-semibold text-body-muted transition-colors hover:border-brand-200 hover:text-brand-700 dark:hover:text-brand-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
