import { useState } from 'react'
import { Camera, User } from 'lucide-react'
import { getImageUrl } from '@/constants'

/**
 * Profile photo picker (UI-09 restyle) — same interaction model as
 * before (preview existing photo, live-preview a newly picked file, or an
 * honest placeholder when there's none), redrawn as a large circular
 * portrait with a camera-icon hover affordance instead of a small avatar
 * plus a separate "Change photo" button.
 */
export function AvatarUploadField({ existingImageUrl, onFileSelected }) {
  const [previewUrl, setPreviewUrl] = useState(() => getImageUrl(existingImageUrl))

  function handleChange(event) {
    const file = event.target.files?.[0] ?? null
    onFileSelected(file)
    if (file) setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <label className="group relative flex h-24 w-24 flex-none cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-rule bg-canvas-2 transition-colors hover:border-brand-300">
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <User className="h-9 w-9 text-body-faint" strokeWidth={1.5} />
      )}

      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 text-transparent transition-all group-hover:bg-charcoal/50 group-hover:text-white">
        <Camera className="h-6 w-6" strokeWidth={1.75} />
      </span>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        aria-label={previewUrl ? 'Change profile photo' : 'Upload profile photo'}
        className="hidden"
      />
    </label>
  )
}
