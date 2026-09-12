import { validateInventoryItem } from '../validators/inventory.validator.js'
import {
  listInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryStock,
  deleteInventoryItem,
} from '../services/inventory.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getInventoryItems(req, res) {
  const items = await listInventoryItems()
  sendSuccess(res, { message: 'Inventory fetched successfully.', data: { items } })
}

export async function postInventoryItem(req, res) {
  const errors = validateInventoryItem(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const item = await createInventoryItem(req.body)
  sendSuccess(res, { statusCode: 201, message: 'Inventory item created successfully.', data: { item } })
}

export async function putInventoryItem(req, res) {
  const errors = validateInventoryItem(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const item = await updateInventoryItem(req.params.id, req.body)
  sendSuccess(res, { message: 'Inventory item updated successfully.', data: { item } })
}

export async function patchInventoryStock(req, res) {
  const { quantity } = req.body
  if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0) {
    throw new ApiError(400, 'A valid non-negative quantity is required.')
  }

  const item = await updateInventoryStock(req.params.id, { quantity: Number(quantity) })
  sendSuccess(res, { message: 'Stock quantity updated successfully.', data: { item } })
}

export async function removeInventoryItem(req, res) {
  await deleteInventoryItem(req.params.id)
  sendSuccess(res, { message: 'Inventory item deleted successfully.' })
}
