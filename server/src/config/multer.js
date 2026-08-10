import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { ApiError } from '../utils/ApiError.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

function fileFilter(req, file, cb) {
  // A real ApiError, not a plain Error — so errorHandler.js reports this as
  // the 400 it actually is, instead of falling through to a generic 500.
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new ApiError(400, 'Only JPEG, PNG, and WEBP images are allowed.'))
  }
  cb(null, true)
}

// Shared by every image upload in the app (menu items, now profile
// photos) — only the destination folder differs, so that's the one thing
// each call site provides.
function createImageUploader(subfolder) {
  // Resolved relative to this file, not process.cwd() — works the same
  // regardless of which directory `node`/`nodemon` was launched from.
  const uploadDir = path.join(__dirname, '../../uploads', subfolder)
  fs.mkdirSync(uploadDir, { recursive: true })

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${crypto.randomUUID()}${ext}`)
    },
  })

  return multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_BYTES } })
}

export const uploadMenuImage = createImageUploader('menu').single('image')
export const uploadProfileImage = createImageUploader('profile').single('image')
