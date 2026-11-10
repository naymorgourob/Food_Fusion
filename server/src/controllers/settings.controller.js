import { validateSettings } from '../validators/settings.validator.js'
import { getSettings, updateSettings } from '../services/settings.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { getRestaurantStatus, setClosedToday } from '../services/restaurantStatus.service.js'

export async function getSettingsHandler(req, res) {
  const settings = await getSettings()
  sendSuccess(res, { message: 'Settings fetched successfully.', data: { settings } })
}

export async function getPaymentContactHandler(req, res) {
  const settings = await getSettings()
  sendSuccess(res, {
    message: 'Payment contact fetched successfully.',
    data: { restaurantName: settings.restaurantName, restaurantPhone: settings.restaurantPhone },
  })
}

export async function putSettingsHandler(req, res) {
  const errors = validateSettings(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const settings = await updateSettings(req.body)
  sendSuccess(res, { message: 'Settings updated successfully.', data: { settings } })
}

export async function getRestaurantStatusHandler(req, res) {
  const status = await getRestaurantStatus()
  sendSuccess(res, { message: 'Restaurant status fetched successfully.', data: { status } })
}

// Body: { closedToday: true } closes early for the rest of today,
// { closedToday: false } reopens.
export async function putRestaurantStatusHandler(req, res) {
  if (typeof req.body.closedToday !== 'boolean') {
    throw new ApiError(400, 'closedToday must be true or false.')
  }
  const status = await setClosedToday(req.body.closedToday)
  sendSuccess(res, { message: 'Restaurant status updated successfully.', data: { status } })
}
