import { createContext } from 'react'

// Split from AuthProvider.jsx for the same reason as ThemeContext —
// keeps this file's only export a non-component, which is what
// eslint-plugin-react-refresh wants from a context file.
export const AuthContext = createContext(null)
