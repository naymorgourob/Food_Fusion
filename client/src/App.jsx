import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingLayout from '@/layouts/LandingLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import CustomerLayout from '@/layouts/CustomerLayout'
import StaffLayout from '@/layouts/StaffLayout'
import ErrorLayout from '@/layouts/ErrorLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { USER_ROLES } from '@/constants'
import Home from '@/pages/landing/Home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import Account from '@/pages/account/Account'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import CategoriesPage from '@/pages/dashboard/menu/CategoriesPage'
import MenuItemsPage from '@/pages/dashboard/menu/MenuItemsPage'
import TablesPage from '@/pages/dashboard/tables/TablesPage'
import ReservationsPage from '@/pages/dashboard/reservations/ReservationsPage'
import MyReservationsPage from '@/pages/reservations/MyReservationsPage'
import OrdersPage from '@/pages/dashboard/orders/OrdersPage'
import MyOrdersPage from '@/pages/orders/MyOrdersPage'
import NewOrderPage from '@/pages/orders/NewOrderPage'
import OrderTrackingPage from '@/pages/orders/OrderTrackingPage'
import BillingPage from '@/pages/dashboard/billing/BillingPage'
import MyBillsPage from '@/pages/billing/MyBillsPage'
import LoyaltyPage from '@/pages/loyalty/LoyaltyPage'
import FavoritesPage from '@/pages/favorites/FavoritesPage'
import CustomersPage from '@/pages/dashboard/customers/CustomersPage'
import StaffPage from '@/pages/dashboard/staff/StaffPage'
import InventoryPage from '@/pages/dashboard/inventory/InventoryPage'
import ReportsPage from '@/pages/dashboard/reports/ReportsPage'
import ProfilePage from '@/pages/dashboard/profile/ProfilePage'
import MyProfilePage from '@/pages/profile/MyProfilePage'
import AccountSettingsPage from '@/pages/profile/AccountSettingsPage'
import SettingsPage from '@/pages/dashboard/settings/SettingsPage'
import StaffDashboardPage from '@/pages/staff/StaffDashboardPage'
import KitchenQueuePage from '@/pages/staff/KitchenQueuePage'
import StaffOrdersPage from '@/pages/staff/StaffOrdersPage'
import StaffReservationsPage from '@/pages/staff/StaffReservationsPage'
import StaffTablesPage from '@/pages/staff/StaffTablesPage'
import StaffSettingsPage from '@/pages/staff/StaffSettingsPage'
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'

// The last two placeholder modules (Settings, Profile — see the removed
// PLACEHOLDER_MODULES array) graduated in Part 17, the same way Menu and
// Categories did in Part 9, Tables in Part 10, Reservations in Part 11,
// Orders in Part 12, Billing in Part 13, Customers and Staff in Part 14,
// Inventory in Part 15, Reports in Part 16 — every module from the Part 8
// scaffold now has a real page.

const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [{ path: '/', element: <Home /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    // Every Customer page shares one shell (UI-02): emerald sidebar +
    // glass top bar, with orders/reservations/loyalty fetched once in the
    // layout and handed down via Outlet context. Gating is unchanged —
    // still Customer-only, exactly as each route was individually before.
    element: <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]} />,
    children: [
      {
        element: <CustomerLayout />,
        children: [
          { path: '/reservations', element: <MyReservationsPage /> },
          { path: '/orders', element: <MyOrdersPage /> },
          { path: '/orders/new', element: <NewOrderPage /> },
          { path: '/orders/:id', element: <OrderTrackingPage /> },
          { path: '/bills', element: <MyBillsPage /> },
          { path: '/loyalty', element: <LoyaltyPage /> },
          { path: '/favorites', element: <FavoritesPage /> },
        ],
      },
    ],
  },
  {
    // Staff's own workspace (UI-07) — /staff/*, gated to STAFF only.
    // Separate from the Admin-only /dashboard/* branch below: Admin's
    // Sidebar/DashboardLayout/Modal-based CRUD pages are untouched by this
    // redesign, so Staff gets a parallel set of routes instead of a
    // reskinned version of Admin's. /dashboard/orders and
    // /dashboard/billing still work for Staff exactly as before (see the
    // shared ADMIN+STAFF branch further down) — nothing there was removed.
    element: <ProtectedRoute allowedRoles={[USER_ROLES.STAFF]} />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { path: '/staff', element: <StaffDashboardPage /> },
          { path: '/staff/kitchen', element: <KitchenQueuePage /> },
          { path: '/staff/orders', element: <StaffOrdersPage /> },
          { path: '/staff/reservations', element: <StaffReservationsPage /> },
          { path: '/staff/tables', element: <StaffTablesPage /> },
          { path: '/staff/profile', element: <ProfilePage /> },
          { path: '/staff/settings', element: <StaffSettingsPage /> },
        ],
      },
    ],
  },
  {
    // /account, /profile, and /settings are shared by Customer AND Staff,
    // so they sit outside the Customer-gated branch above — a role-gated
    // wrapper here would bounce Staff to /unauthorized. Account redirects
    // Staff to /staff (their real home); MyProfilePage wraps itself by
    // role. In practice /settings is reached from the Customer sidebar
    // only — Staff has its own /staff/settings under the Staff branch —
    // but the route stays unrestricted-by-role here for the same reason
    // /profile is: any authenticated user's own settings, not a
    // Customer-specific resource.
    element: <ProtectedRoute />,
    children: [
      { path: '/account', element: <Account /> },
      { path: '/profile', element: <MyProfilePage /> },
      { path: '/settings', element: <AccountSettingsPage /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />,
        children: [
          { index: true, path: '/dashboard', element: <DashboardHome />, handle: { title: 'Dashboard' } },
          { path: '/dashboard/menu', element: <MenuItemsPage />, handle: { title: 'Menu Management' } },
          { path: '/dashboard/categories', element: <CategoriesPage />, handle: { title: 'Categories' } },
          { path: '/dashboard/tables', element: <TablesPage />, handle: { title: 'Tables' } },
          { path: '/dashboard/reservations', element: <ReservationsPage />, handle: { title: 'Reservations' } },
          { path: '/dashboard/customers', element: <CustomersPage />, handle: { title: 'Customers' } },
          { path: '/dashboard/staff', element: <StaffPage />, handle: { title: 'Staff' } },
          { path: '/dashboard/inventory', element: <InventoryPage />, handle: { title: 'Inventory' } },
          { path: '/dashboard/reports', element: <ReportsPage />, handle: { title: 'Reports' } },
          { path: '/dashboard/settings', element: <SettingsPage />, handle: { title: 'Settings' } },
        ],
      },
      {
        // Orders, Billing, and Profile are the modules both Admin and
        // Staff can reach — a separate branch from the Admin-only one
        // above, so Staff reaching /dashboard/menu (say) still correctly
        // bounces to /unauthorized. ProfileDropdown (Part 8) links here
        // for whichever of the two roles is currently signed in.
        element: <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.STAFF]} />,
        children: [
          { path: '/dashboard/orders', element: <OrdersPage />, handle: { title: 'Orders' } },
          { path: '/dashboard/billing', element: <BillingPage />, handle: { title: 'Billing' } },
          { path: '/dashboard/profile', element: <ProfilePage />, handle: { title: 'Profile' } },
        ],
      },
    ],
  },
  {
    element: <ErrorLayout />,
    children: [
      { path: '/unauthorized', element: <Unauthorized /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
