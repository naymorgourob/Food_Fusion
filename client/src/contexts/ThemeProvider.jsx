import { useEffect, useState } from 'react'
import { ThemeContext } from '@/contexts/ThemeContext'
import { THEME_STORAGE_KEY, THEMES } from '@/constants/theme'

function getStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === THEMES.LIGHT || stored === THEMES.DARK ? stored : null
}

/**
 * Applies data-theme on <html> so the CSS variables in styles/index.css
 * switch — see docs/03-design-system.md "Dark mode". Falls back to the OS
 * preference until the user explicitly picks a theme.
 */
function getInitialTheme() {
  const stored = getStoredTheme()
  if (stored) return stored
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? THEMES.DARK : THEMES.LIGHT
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  )
}
