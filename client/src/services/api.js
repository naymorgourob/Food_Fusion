import axios from 'axios'
import { AUTH_TOKEN_KEY } from '@/constants/auth'

// Every backend call in the app goes through this one instance, so the base
// URL and timeout are configured in exactly one place.
//
// No hardcoded Content-Type header here on purpose: axios sets
// 'application/json' automatically for plain object bodies, and — this is
// the part that matters — 'multipart/form-data; boundary=...' automatically
// for FormData bodies (menu item image uploads). A hardcoded 'application/
// json' default would either get stuck on multipart requests or need to be
// overridden per-request; leaving it unset lets axios infer it correctly
// every time, matching whatever `data` actually is.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// Attaches the JWT to every request if one is stored, in whichever storage
// AuthProvider decided to use (see contexts/AuthProvider.jsx "Remember me").
// Requests made before login (e.g. the login call itself) simply have no
// token to attach — this never blocks a request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
