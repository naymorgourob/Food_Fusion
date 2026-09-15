import { validateTable } from '../validators/table.validator.js'
import { listTables, createTable, updateTable, deleteTable } from '../services/table.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'

export async function getTables(req, res) {
  const tables = await listTables(req.query)
  sendSuccess(res, { message: 'Tables fetched successfully.', data: { tables } })
}

export async function postTable(req, res) {
  const errors = validateTable(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const table = await createTable(req.body)
  sendSuccess(res, { statusCode: 201, message: 'Table created successfully.', data: { table } })
}

export async function putTable(req, res) {
  const errors = validateTable(req.body)
  if (errors.length > 0) throw new ApiError(400, 'Validation failed.', errors)

  const table = await updateTable(req.params.id, req.body)
  sendSuccess(res, { message: 'Table updated successfully.', data: { table } })
}

export async function removeTable(req, res) {
  await deleteTable(req.params.id)
  sendSuccess(res, { message: 'Table deleted successfully.' })
}
