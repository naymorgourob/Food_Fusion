import { motion } from 'framer-motion'
import { Eye, Pencil, UserCheck, UserX, Mail, Phone, ShoppingBag, Calendar } from 'lucide-react'
import { StaffStatusBadge } from '@/features/staff/components/StaffStatusBadge'
import { StaffPositionBadge } from '@/features/staff/components/StaffPositionBadge'
import { getImageUrl } from '@/constants'

export function AdminStaffRow({
  member,
  onView,
  onEdit,
  onToggleStatus,
  isToggling,
}) {
  const avatarUrl = getImageUrl(member.profileImage)
  const initials = member.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const assignedOrdersCount = member._count?.assignedOrders ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
        member.isActive
          ? 'border-rule hover:border-brand-200'
          : 'border-border bg-surface-2/40 opacity-75'
      }`}
    >
      {/* Staff identity */}
      <div className="flex items-center gap-3.5 min-w-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-11 w-11 flex-none rounded-xl object-cover ring-1 ring-rule"
          />
        ) : (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-gold-600 to-gold-800 text-sm font-bold text-white shadow-sm">
            {initials}
          </span>
        )}

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-display text-sm font-bold text-body">
              {member.fullName}
            </span>
            <StaffPositionBadge position={member.position} />
            <StaffStatusBadge isActive={member.isActive} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body-muted">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-body-faint" />
              <span className="truncate max-w-[180px] sm:max-w-xs">{member.email}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-body-faint" />
              <span>{member.phone}</span>
            </span>
            <span className="hidden items-center gap-1 lg:flex text-body-faint">
              <Calendar className="h-3 w-3" />
              <span>Joined {new Date(member.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between gap-3 border-t border-rule pt-3 sm:border-t-0 sm:pt-0">
        {/* Assigned orders pill */}
        {assignedOrdersCount > 0 && (
          <span
            title="Total orders assigned"
            className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-body-muted"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>{assignedOrdersCount} assigned</span>
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onView(member)}
            aria-label={`View details for ${member.fullName}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-card px-3 py-1.5 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>

          <button
            type="button"
            onClick={() => onEdit(member)}
            aria-label={`Edit ${member.fullName}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-card px-3 py-1.5 text-xs font-semibold text-body transition-colors hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-400"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(member)}
            disabled={isToggling}
            aria-label={
              member.isActive
                ? `Deactivate account for ${member.fullName}`
                : `Activate account for ${member.fullName}`
            }
            title={member.isActive ? 'Suspend staff account' : 'Restore staff account'}
            className={`rounded-xl p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              member.isActive
                ? 'text-body-faint hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
          >
            {member.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

