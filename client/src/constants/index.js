export const APP_NAME = 'FoodFusion'

// The API returns image paths as server-relative ("/uploads/menu/x.jpg"),
// not full URLs — VITE_API_BASE_URL includes the "/api/v1" suffix, so the
// origin has to be derived by stripping it, once, here.
export const API_ORIGIN = new URL(
  import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
).origin

export function getImageUrl(imagePath) {
  if (!imagePath) return null
  if (/^https?:\/\//i.test(imagePath)) return imagePath
  // Files shipped in client/public (dishes, tables…) are served by the app
  // itself; only /uploads lives on the API.
  if (!imagePath.startsWith('/uploads') && imagePath.startsWith('/')) return imagePath
  return `${API_ORIGIN}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

const MENU_IMAGE_FALLBACKS = {
  biryani:
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80',
  beef: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=900&q=80',
  fish: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80',
  prawn:
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80',
  chicken:
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
  dessert:
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
  beverage:
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
  default:
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
}

const BENGALI_DISH_IMAGES = {
  // Photos supplied for the menu, shown as-is on the dish cards.
  'dhaka kacchi biryani': '/dishes/kacchi-biryani.jpg',
  'royal mutton kacchi biryani': '/dishes/kacchi-biryani.jpg',
  'fish and chips': '/dishes/fish-and-chips.jpg',
  'buffalo wings': '/dishes/buffalo-wings.jpg',
  'crispy calamari': '/dishes/crispy-calamari.jpg',
  'naga wings': '/dishes/naga-wings.jpg',
  'truffle bruschetta': '/dishes/truffle-bruschetta.jpg',
  'dhakai crispy prawn tempura': '/dishes/prawn-tempura.jpg',
  'beef tehari': '/dishes/beef-tehari.jpg',
  'ilish bhapa': 'https://commons.wikimedia.org/wiki/Special:FilePath/Ilish%20Bhapa.jpg?width=900',
  'chingri malai curry': '/dishes/chingri-malai-curry.jpg',
  'chicken bhuna khichuri': '/dishes/bhuna-khichuri.jpg',
  'shorshe ilish platter': '/dishes/shorshe-ilish.jpg',
  'begun bhaja': '/dishes/begun-bhaja.jpg',
  'mishti doi': '/dishes/mishti-doi.jpg',
  'bhetki paturi': '/dishes/bhetki-paturi.jpg',
  'bhorta platter': '/dishes/bhorta-platter.jpg',
  'dab chingri': '/dishes/dab-chingri.jpg',
  'seafood platter': '/dishes/seafood-platter.jpg',
  'ginger milk tea': '/dishes/ginger-milk-tea.jpg',
  'coffee milk bubble tea': '/dishes/coffee-boba.jpg',
  'taro boba milk': '/dishes/taro-boba.jpg',
  'passionfruit mocktail': '/dishes/passionfruit-mocktail.jpg',
  'hot chocolate': '/dishes/hot-chocolate.jpg',
  'sweet mango lassi': '/dishes/mango-lassi.jpg',
  'mint lemonade cooler': '/dishes/mint-lemonade.jpg',
  'caramel macchiato': '/dishes/caramel-macchiato.jpg',
  espresso: '/dishes/espresso.jpg',
  'iced caramel latte': '/dishes/iced-caramel-latte.jpg',
  'hazelnut latte': '/dishes/hazelnut-latte.jpg',
  'tres leches': '/dishes/tres-leches.jpg',
  'classic tiramisu': '/dishes/tiramisu.jpg',
  'warm chocolate lava cake': '/dishes/lava-cake.jpg',
  'shahi tukra with rabri': '/dishes/shahi-tukra.jpg',
  'signature san sebastian cake': '/dishes/san-sebastian-cake.jpg',
  'chocolate bomb with brownie': '/dishes/chocolate-bomb.jpg',
}

export function getMenuImageUrl(dish) {
  const dishName = String(dish?.name || '')
    .toLowerCase()
    .trim()
  const name = `${dishName} ${dish?.category?.name || ''}`.toLowerCase()
  const fallbackKey =
    name.includes('biryani') ||
    name.includes('tehari') ||
    name.includes('rice') ||
    name.includes('khichuri')
      ? 'biryani'
      : name.includes('beef') || name.includes('steak') || name.includes('lamb')
        ? 'beef'
        : name.includes('fish') || name.includes('ilish') || name.includes('salmon')
          ? 'fish'
          : name.includes('prawn') || name.includes('chingri') || name.includes('calamari')
            ? 'prawn'
            : name.includes('chicken') || name.includes('kebab') || name.includes('wing')
              ? 'chicken'
              : name.includes('dessert') ||
                  name.includes('cake') ||
                  name.includes('doi') ||
                  name.includes('tiramisu')
                ? 'dessert'
                : name.includes('drink') ||
                    name.includes('lemonade') ||
                    name.includes('lassi') ||
                    name.includes('latte') ||
                    name.includes('mocktail')
                  ? 'beverage'
                  : 'default'

  return {
    primary: BENGALI_DISH_IMAGES[dishName] || getImageUrl(dish?.imageUrl),
    fallback: MENU_IMAGE_FALLBACKS[fallbackKey],
  }
}

// Mirrors the UserRole enum in server/prisma/schema.prisma. Kept here as the
// single frontend source of truth so role checks never compare against a
// typo'd string literal scattered across the codebase.
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  // Both UI-only (UI-09) — there is no forgot/reset-password backend, only
  // POST /register and POST /login. See ForgotPasswordPage.jsx for what
  // that means for these two routes' behaviour.
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ACCOUNT: '/account',
  RESERVATIONS: '/reservations',
  ORDERS: '/orders',
  TRACK_ORDER: '/orders/track',
  BILLS: '/bills',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOYALTY: '/loyalty',
  FAVORITES: '/favorites',
  UNAUTHORIZED: '/unauthorized',
  // Staff's workspaces (separated into Chef and Waiter)
  STAFF_HOME: '/staff',
  // Chef workspace routes
  CHEF_HOME: '/staff/chef',
  CHEF_ORDERS: '/staff/chef/orders',
  CHEF_INVENTORY: '/staff/chef/inventory',
  CHEF_PROFILE: '/staff/chef/profile',
  CHEF_SETTINGS: '/staff/chef/settings',
  // Waiter workspace routes
  WAITER_HOME: '/staff/waiter',
  WAITER_ORDERS: '/staff/waiter/orders',
  WAITER_TABLES: '/staff/waiter/tables',
  WAITER_RESERVATIONS: '/staff/waiter/reservations',
  WAITER_PROFILE: '/staff/waiter/profile',
  WAITER_SETTINGS: '/staff/waiter/settings',
  // Legacy aliases
  STAFF_KITCHEN: '/staff/kitchen',
  STAFF_ORDERS: '/staff/orders',
  STAFF_INVENTORY: '/staff/inventory',
  STAFF_RESERVATIONS: '/staff/reservations',
  STAFF_TABLES: '/staff/tables',
  STAFF_PROFILE: '/staff/profile',
  STAFF_SETTINGS: '/staff/settings',
}

// Where a just-logged-in user lands: the real Admin Dashboard for Admins,
// the appropriate workspace for Staff based on user position, and /account
// for Customer.
export function getHomeRouteForRole(role, user) {
  if (role === USER_ROLES.ADMIN) return ROUTES.DASHBOARD
  if (role === USER_ROLES.STAFF) {
    if (user) {
      const pos = String(user.position || '')
        .toLowerCase()
        .trim()
      const isChef =
        pos.includes('chef') ||
        pos.includes('cook') ||
        pos.includes('kitchen') ||
        pos.includes('baker') ||
        pos.includes('pastry') ||
        pos.includes('culinary')
      return isChef ? ROUTES.CHEF_HOME : ROUTES.WAITER_HOME
    }
    return ROUTES.STAFF_HOME
  }
  return ROUTES.ACCOUNT
}

/**
 * Validates whether an authenticated user with a specific role and position
 * has permission to navigate to the specified path.
 * Used during login redirects to prevent bouncing unauthorized roles into guarded routes.
 */
export function canAccessPath(pathname, role, user) {
  if (!pathname || typeof pathname !== 'string') return false
  const cleanPath = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'

  // Never redirect to auth or error routes
  if (
    cleanPath === ROUTES.LOGIN ||
    cleanPath === ROUTES.REGISTER ||
    cleanPath === ROUTES.FORGOT_PASSWORD ||
    cleanPath === ROUTES.RESET_PASSWORD ||
    cleanPath === ROUTES.UNAUTHORIZED ||
    cleanPath === ''
  ) {
    return false
  }

  // Public landing page
  if (cleanPath === ROUTES.HOME) {
    return true
  }

  // Admin-only routes
  if (
    cleanPath === '/dashboard' ||
    cleanPath.startsWith('/dashboard/menu') ||
    cleanPath.startsWith('/dashboard/categories') ||
    cleanPath.startsWith('/dashboard/tables') ||
    cleanPath.startsWith('/dashboard/reservations') ||
    cleanPath.startsWith('/dashboard/customers') ||
    cleanPath.startsWith('/dashboard/staff') ||
    cleanPath.startsWith('/dashboard/inventory') ||
    cleanPath.startsWith('/dashboard/reports') ||
    cleanPath.startsWith('/dashboard/settings')
  ) {
    return role === USER_ROLES.ADMIN
  }

  // Shared Admin & Staff dashboard routes
  if (
    cleanPath.startsWith('/dashboard/orders') ||
    cleanPath.startsWith('/dashboard/billing') ||
    cleanPath.startsWith('/dashboard/profile')
  ) {
    return role === USER_ROLES.ADMIN || role === USER_ROLES.STAFF
  }

  // Staff routes
  if (cleanPath.startsWith('/staff')) {
    if (role !== USER_ROLES.STAFF) return false
    if (cleanPath.startsWith('/staff/chef')) {
      const pos = String(user?.position || '')
        .toLowerCase()
        .trim()
      const isChef =
        pos.includes('chef') ||
        pos.includes('cook') ||
        pos.includes('kitchen') ||
        pos.includes('baker') ||
        pos.includes('pastry') ||
        pos.includes('culinary')
      return isChef
    }
    if (cleanPath.startsWith('/staff/waiter')) {
      const pos = String(user?.position || '')
        .toLowerCase()
        .trim()
      const isChef =
        pos.includes('chef') ||
        pos.includes('cook') ||
        pos.includes('kitchen') ||
        pos.includes('baker') ||
        pos.includes('pastry') ||
        pos.includes('culinary')
      return !isChef
    }
    return true
  }

  // Customer-only routes
  if (
    cleanPath.startsWith('/orders') ||
    cleanPath.startsWith('/track-order') ||
    cleanPath.startsWith('/reservations') ||
    cleanPath.startsWith('/bills') ||
    cleanPath.startsWith('/loyalty') ||
    cleanPath.startsWith('/favorites')
  ) {
    return role === USER_ROLES.CUSTOMER
  }

  // Customer account page
  if (cleanPath === '/account') {
    return role === USER_ROLES.CUSTOMER
  }

  // Profile and settings are accessible to authenticated users
  if (cleanPath === '/profile' || cleanPath === '/settings') {
    return true
  }

  return false
}
