import { Router } from 'express'
import { authenticateUser, authorizeAdmin, authorizeStaff } from '../middlewares/auth.middleware.js'
import {
  getPayrollHandler,
  putSalaryHandler,
  postSalaryPaymentHandler,
  deleteSalaryPaymentHandler,
  getMyPayslipsHandler,
} from '../controllers/payroll.controller.js'

const router = Router()

router.get('/mine', authenticateUser, authorizeStaff, getMyPayslipsHandler)

router.get('/', authenticateUser, authorizeAdmin, getPayrollHandler)
router.put('/staff/:staffId/salary', authenticateUser, authorizeAdmin, putSalaryHandler)
router.post('/payments', authenticateUser, authorizeAdmin, postSalaryPaymentHandler)
router.delete('/payments/:id', authenticateUser, authorizeAdmin, deleteSalaryPaymentHandler)

export default router
