import { createContext } from 'react'

// Split from ThemeProvider.jsx so this file exports only the context value —
// keeps eslint-plugin-react-refresh happy (it wants component files to only
// export components) and keeps the provider/consumer wiring easy to trace.
export const ThemeContext = createContext(null)
