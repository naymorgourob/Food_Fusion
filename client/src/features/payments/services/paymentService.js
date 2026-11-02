import { api } from '@/services/api'

// Opens an SSLCommerz session for the advance on an order or reservation
// and returns { gatewayUrl } to send the browser to.
export async function startAdvancePayment(type, id) {
  const { data } = await api.post('/payments/sslcommerz/init', { type, id })
  return data.data
}
