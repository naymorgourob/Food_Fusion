// Shrinks a photo/screenshot before upload: at most 1600px on the long side,
// re-encoded as JPEG. A 1.5 MB PNG screenshot becomes ~150-300 KB, which
// uploads in seconds on a slow mobile connection instead of timing out.
// Falls back to the original file if the browser can't decode it.
const MAX_SIDE = 1600
const QUALITY = 0.82

export async function compressImage(file) {
  if (!file || !file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    // White under transparent PNG areas, which JPEG would otherwise turn black.
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
    if (!blob || blob.size >= file.size) return file
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}
