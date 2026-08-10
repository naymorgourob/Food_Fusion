import { useRef, useState } from 'react'
import { ImagePlus, UtensilsCrossed, X, Upload } from 'lucide-react'
import { getImageUrl } from '@/constants'

/**
 * Food photo picker (UI-08.1 redesign) — drag & drop, click to browse,
 * and a Remove button, over the existing photo, a live preview of a
 * newly picked file, or an honest placeholder icon when there's none.
 *
 * "Remove" is scoped to exactly what is achievable without a backend
 * change: updateMenuItem only ever replaces imageUrl when a NEW file is
 * uploaded (`...(file ? { imageUrl: ... } : {})` in
 * server/src/services/menuItem.service.js) — there is no path to save a
 * food with imageUrl explicitly cleared to null. So Remove clears this
 * form's preview and cancels a pending upload, but if the admin saves
 * without picking a replacement, the existing photo on the server is
 * left untouched. The button's label and the helper text both say this
 * plainly rather than implying a delete that doesn't actually happen.
 *
 * No effect needed to react to `existingImageUrl` changing: this always
 * lives inside MenuItemFormModal, which the parent page remounts (fresh
 * `key`) whenever a different item is being edited, so the lazy useState
 * initializer below is never stale.
 */
export function ImageUploadField({ existingImageUrl, onFileSelected }) {
  const [previewUrl, setPreviewUrl] = useState(() => getImageUrl(existingImageUrl))
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  function applyFile(file) {
    if (!file) return
    onFileSelected(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleChange(event) {
    applyFile(event.target.files?.[0] ?? null)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    applyFile(event.dataTransfer.files?.[0] ?? null)
  }

  function handleRemove(event) {
    event.stopPropagation()
    onFileSelected(null)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-body">Photo</span>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-label={previewUrl ? 'Replace food photo' : 'Upload food photo'}
        className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-colors ${
          isDragging
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
            : 'border-rule bg-canvas-2 hover:border-brand-200'
        }`}
      >
        <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-xl border border-rule bg-card">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UtensilsCrossed className="h-7 w-7 text-body-faint" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-body">
            <ImagePlus className="h-4 w-4 text-brand-700 dark:text-brand-400" />
            {previewUrl ? 'Replace photo' : 'Upload a photo'}
          </span>
          <span className="text-xs text-body-faint">
            <Upload className="mr-1 inline h-3 w-3" />
            Drag &amp; drop, or click to browse — JPG, PNG or WebP
          </span>
        </div>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove selected photo"
            className="flex-none rounded-full bg-card p-1.5 text-body-faint shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {existingImageUrl && !previewUrl && (
        <p className="text-xs text-body-faint">
          The current photo stays as-is unless you upload a new one — there&rsquo;s no way to save this
          dish with no photo at all.
        </p>
      )}
    </div>
  )
}
