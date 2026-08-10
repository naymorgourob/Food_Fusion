import { validateCategory } from '../validators/category.validator.js'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/category.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getCategories(req, res) {
  const categories = await listCategories({ search: req.query.search })
  sendSuccess(res, { message: 'Categories fetched successfully.', data: { categories } })
}

export async function postCategory(req, res) {
  const errors = validateCategory(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const category = await createCategory(req.body)
  sendSuccess(res, { statusCode: 201, message: 'Category created successfully.', data: { category } })
}

export async function putCategory(req, res) {
  const errors = validateCategory(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const category = await updateCategory(req.params.id, req.body)
  sendSuccess(res, { message: 'Category updated successfully.', data: { category } })
}

export async function removeCategory(req, res) {
  await deleteCategory(req.params.id)
  sendSuccess(res, { message: 'Category deleted successfully.' })
}
