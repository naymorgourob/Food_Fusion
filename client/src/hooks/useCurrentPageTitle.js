import { useMatches } from 'react-router-dom'

// Split out of Breadcrumb.jsx so that file only exports a component
// (keeps eslint-plugin-react-refresh happy, same reasoning as useTheme/useAuth).
export function useCurrentPageTitle() {
  const matches = useMatches()
  const current = [...matches].reverse().find((match) => match.handle?.title)
  return current?.handle?.title ?? 'Dashboard'
}
