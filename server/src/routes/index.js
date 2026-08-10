import { Router } from 'express'
import authRoutes from './auth.routes.js'
import menuRoutes from './menu.routes.js'
import ordersRoutes from './orders.routes.js'
import tablesRoutes from './tables.routes.js'
import reservationsRoutes from './reservations.routes.js'
import kitchenRoutes from './kitchen.routes.js'
import billingRoutes from './billing.routes.js'
import inventoryRoutes from './inventory.routes.js'
import employeesRoutes from './employees.routes.js'
import customersRoutes from './customers.routes.js'
import reportsRoutes from './reports.routes.js'
import settingsRoutes from './settings.routes.js'
import profileRoutes from './profile.routes.js'
import notificationsRoutes from './notifications.routes.js'
import activityLogsRoutes from './activityLogs.routes.js'
// Part 18.1 — the only two groups not present in the original Part 8
// scaffold, since loyalty and favorites weren't planned modules then.
import loyaltyRoutes from './loyalty.routes.js'
import favoritesRoutes from './favorites.routes.js'

// One mount point per API group from docs/02-database-design.md Step 12 —
// each is an empty router today; filling one in is a one-line change here
// plus the file itself, never a change to app.js.
const router = Router()

router.use('/auth', authRoutes)
router.use('/menu', menuRoutes)
router.use('/orders', ordersRoutes)
router.use('/tables', tablesRoutes)
router.use('/reservations', reservationsRoutes)
router.use('/kitchen', kitchenRoutes)
router.use('/billing', billingRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/employees', employeesRoutes)
router.use('/customers', customersRoutes)
router.use('/reports', reportsRoutes)
router.use('/settings', settingsRoutes)
router.use('/profile', profileRoutes)
router.use('/notifications', notificationsRoutes)
router.use('/activity-logs', activityLogsRoutes)
router.use('/loyalty', loyaltyRoutes)
router.use('/favorites', favoritesRoutes)

export default router
