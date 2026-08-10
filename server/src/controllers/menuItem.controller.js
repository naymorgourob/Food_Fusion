import { validateMenuItem } from '../validators/menuItem.validator.js'
import {
  listMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../services/menuItem.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getMenuItems(req, res) {
  const { search, categoryId, isAvailable, categoryStatus, sortBy, page, pageSize } = req.query
  const result = await listMenuItems({ search, categoryId, isAvailable, categoryStatus, sortBy, page, pageSize })
  sendSuccess(res, { message: 'Menu items fetched successfully.', data: result })
}

export async function getMenuItem(req, res) {
  const food = await getMenuItemById(req.params.id)
  sendSuccess(res, { message: 'Menu item fetched successfully.', data: { food } })
}

export async function postMenuItem(req, res) {
  const errors = validateMenuItem(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const food = await createMenuItem(req.body, req.file)
  sendSuccess(res, { statusCode: 201, message: 'Menu item created successfully.', data: { food } })
}

export async function putMenuItem(req, res) {
  const errors = validateMenuItem(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const food = await updateMenuItem(req.params.id, req.body, req.file)
  sendSuccess(res, { message: 'Menu item updated successfully.', data: { food } })
}

export async function removeMenuItem(req, res) {
  await deleteMenuItem(req.params.id)
  sendSuccess(res, { message: 'Menu item deleted successfully.' })
}
