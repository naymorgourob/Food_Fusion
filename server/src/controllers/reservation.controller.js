import { validateReservation, validateStatus } from '../validators/reservation.validator.js'
import {
  listReservations,
  createReservation,
  updateReservationStatus,
  cancelReservation,
} from '../services/reservation.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getReservations(req, res) {
  const reservations = await listReservations(req.user)
  sendSuccess(res, { message: 'Reservations fetched successfully.', data: { reservations } })
}

export async function postReservation(req, res) {
  const errors = validateReservation(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const reservation = await createReservation(req.user.id, req.body)
  sendSuccess(res, { statusCode: 201, message: 'Reservation created successfully.', data: { reservation } })
}

export async function putReservationStatus(req, res) {
  const errors = validateStatus(req.body.status)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const reservation = await updateReservationStatus(req.params.id, req.body.status)
  sendSuccess(res, { message: 'Reservation status updated successfully.', data: { reservation } })
}

export async function removeReservation(req, res) {
  const reservation = await cancelReservation(req.user, req.params.id)
  sendSuccess(res, { message: 'Reservation cancelled successfully.', data: { reservation } })
}
