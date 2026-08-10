export function DashboardFooter() {
  return (
    <footer className="flex-none border-t border-border px-6 py-4 lg:px-8">
      <p className="text-xs text-ink-faint">
        © {new Date().getFullYear()} FoodFusion. Admin Dashboard.
      </p>
    </footer>
  )
}
