const VALID_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED', 'COMPLETED', 'CANCELLED']
const VALID_ORDER_TYPES = ['DINE_IN', 'DELIVERY', 'TAKEAWAY']
const PHONE_REGEX = /^[+\d][\d\s-]{6,14}\d$/

// Structural checks only (shape, types, presence) — whether the menu item
// ids actually exist and are available is a database question, answered
// in order.service.js, same split as reservation.validator.js /
// reservation.service.js.
export function validateOrder({
  items,
  tableId,
  orderType,
  deliveryAddress,
  deliveryPhone,
  scheduledArrivalTime,
  guestCount,
  paymentReference,
  paymentProofImage,
  requirePaymentProof = true,
}) {
  const errors = []

  if (requirePaymentProof && (!paymentReference || !String(paymentReference).trim()) && !paymentProofImage) {
    errors.push('Submit a transaction/reference ID or upload payment proof.')
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one menu item.')
  } else {
    items.forEach((item, index) => {
      if (!item.menuItemId || !String(item.menuItemId).trim()) {
        errors.push(`Item ${index + 1}: menu item is required.`)
      }

      if (item.quantity === undefined || item.quantity === null || item.quantity === '') {
        errors.push(`Item ${index + 1}: quantity is required.`)
      } else if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
        errors.push(`Item ${index + 1}: quantity must be a positive whole number.`)
      }
    })
  }

  if (tableId !== undefined && tableId !== null && tableId !== '' && typeof tableId !== 'string') {
    errors.push('Table selection is invalid.')
  }

  if (!orderType || !VALID_ORDER_TYPES.includes(orderType)) {
    errors.push('Select an order type: Dine-In, Delivery, or Takeaway.')
  }

  // Type-specific requirements — "the ordering flow should change
  // depending on the selected order type."
  if (orderType === 'DELIVERY') {
    if (!deliveryAddress || !deliveryAddress.trim()) errors.push('Delivery address is required.')
    if (!deliveryPhone || !deliveryPhone.trim()) errors.push('Delivery phone number is required.')
    else if (!PHONE_REGEX.test(deliveryPhone)) errors.push('Enter a valid delivery phone number.')
  }

  // Only "Schedule Dine-In" (scheduledArrivalTime present) needs these —
  // "Dine-In Now" needs neither, per the spec's own split of the two.
  if (orderType === 'DINE_IN' && scheduledArrivalTime) {
    const arrival = new Date(scheduledArrivalTime)
    if (Number.isNaN(arrival.getTime()) || arrival.getTime() <= Date.now()) {
      errors.push('Scheduled arrival time must be in the future.')
    }

    if (guestCount === undefined || guestCount === null || guestCount === '') {
      errors.push('Number of guests is required for a scheduled dine-in.')
    } else if (!Number.isInteger(Number(guestCount)) || Number(guestCount) <= 0) {
      errors.push('Number of guests must be a positive whole number.')
    }
  }

  return errors
}

export function validateStatus(status) {
  if (!status || !VALID_STATUSES.includes(status)) {
    return ['Enter a valid order status.']
  }
  return []
}

export function validateEstimatedTime({ estimatedReadyTime, estimatedDeliveryTime }) {
  const errors = []

  if (estimatedReadyTime) {
    if (Number.isNaN(new Date(estimatedReadyTime).getTime())) errors.push('Estimated ready time is invalid.')
  }

  if (estimatedDeliveryTime) {
    if (Number.isNaN(new Date(estimatedDeliveryTime).getTime())) errors.push('Estimated delivery time is invalid.')
  }

  if (!estimatedReadyTime && !estimatedDeliveryTime) {
    errors.push('Provide at least one estimated time to update.')
  }

  return errors
}
