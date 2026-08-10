const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[+\d][\d\s-]{6,14}\d$/

export function validateSettings({
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  restaurantEmail,
  vatPercentage,
  currencySymbol,
  loyaltyPointsPerCurrency,
  loyaltyPointValue,
  firstOrderBonusPoints,
}) {
  const errors = []

  if (!restaurantName || !restaurantName.trim()) errors.push('Restaurant name is required.')

  if (!restaurantAddress || !restaurantAddress.trim()) errors.push('Restaurant address is required.')

  if (!restaurantPhone || !restaurantPhone.trim()) errors.push('Restaurant phone is required.')
  else if (!PHONE_REGEX.test(restaurantPhone)) errors.push('Enter a valid restaurant phone number.')

  if (!restaurantEmail || !restaurantEmail.trim()) errors.push('Restaurant email is required.')
  else if (!EMAIL_REGEX.test(restaurantEmail)) errors.push('Enter a valid restaurant email address.')

  if (vatPercentage === undefined || vatPercentage === null || vatPercentage === '') {
    errors.push('VAT percentage is required.')
  } else if (Number.isNaN(Number(vatPercentage)) || Number(vatPercentage) < 0 || Number(vatPercentage) > 100) {
    errors.push('VAT percentage must be between 0 and 100.')
  }

  if (!currencySymbol || !currencySymbol.trim()) errors.push('Currency symbol is required.')
  else if (currencySymbol.trim().length > 5) errors.push('Currency symbol must be 5 characters or fewer.')

  // --- Loyalty configuration (Part 18.1) ---
  // All three are non-negative numbers; 0 is legitimate (it simply turns
  // that part of the loyalty scheme off), so only negatives are rejected.
  if (loyaltyPointsPerCurrency === undefined || loyaltyPointsPerCurrency === null || loyaltyPointsPerCurrency === '') {
    errors.push('Loyalty earn rate is required.')
  } else if (Number.isNaN(Number(loyaltyPointsPerCurrency)) || Number(loyaltyPointsPerCurrency) < 0) {
    errors.push('Loyalty earn rate must be zero or a positive number.')
  }

  if (loyaltyPointValue === undefined || loyaltyPointValue === null || loyaltyPointValue === '') {
    errors.push('Loyalty point value is required.')
  } else if (Number.isNaN(Number(loyaltyPointValue)) || Number(loyaltyPointValue) < 0) {
    errors.push('Loyalty point value must be zero or a positive number.')
  }

  if (firstOrderBonusPoints === undefined || firstOrderBonusPoints === null || firstOrderBonusPoints === '') {
    errors.push('First order bonus is required.')
  } else if (!Number.isInteger(Number(firstOrderBonusPoints)) || Number(firstOrderBonusPoints) < 0) {
    errors.push('First order bonus must be zero or a positive whole number.')
  }

  return errors
}
