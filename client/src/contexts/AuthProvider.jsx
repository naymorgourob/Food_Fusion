import { useEffect, useState } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { AUTH_TOKEN_KEY } from '@/constants/auth'
import { loginRequest, registerRequest, fetchCurrentUser } from '@/services/authService'

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY)
}

function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}

/**
 * Holds the single source of truth for "who is logged in" across the whole
 * app. On first load, if a token was saved from a previous visit, it's
 * verified against GET /profile/me (rather than trusted blindly) so a
 * revoked or expired token doesn't leave the UI thinking someone is still
 * logged in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function hydrateFromStoredToken() {
      const token = getStoredToken()
      if (token) {
        try {
          setUser(await fetchCurrentUser())
        } catch {
          clearStoredToken()
        }
      }
      setIsLoading(false)
    }

    hydrateFromStoredToken()
  }, [])

  async function login({ email, password, rememberMe }) {
    const { user: loggedInUser, token } = await loginRequest({ email, password })
    // Remember me decides WHERE the token lives, not how long it lasts:
    // localStorage survives closing the browser, sessionStorage clears
    // when the tab/browser closes. Either way any old token is cleared
    // first so a stale copy never lingers in the other storage.
    clearStoredToken()
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem(AUTH_TOKEN_KEY, token)
    setUser(loggedInUser)
    return loggedInUser
  }

  async function register(payload) {
    const { user: newUser, token } = await registerRequest(payload)
    clearStoredToken()
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    setUser(newUser)
    return newUser
  }

  function logout() {
    clearStoredToken()
    setUser(null)
  }

  // Called after a successful profile edit (Part 17) so the cached user —
  // and everything reading it (TopNav, ProfileDropdown, Sidebar avatar) —
  // reflects the change immediately, without a full page reload.
  function updateUser(updatedUser) {
    setUser((current) => ({ ...current, ...updatedUser }))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
