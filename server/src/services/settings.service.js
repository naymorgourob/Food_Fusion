import { prisma } from '../config/prisma.js'

// Fixed literal id — see the Settings model's `@default("singleton")`
// comment in schema.prisma. Both functions upsert on this same id, so
// there is never any ambiguity about "which row."
const SETTINGS_ID = 'singleton'

// Creates the default row on first-ever read — no separate seed script
// needed, and every other part of the app that wants Settings (e.g.
// bill.service.js's VAT default) can just call this directly.
export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  })
}

export async function updateSettings(data) {
  const {
    restaurantName,
    restaurantAddress,
    restaurantPhone,
    restaurantEmail,
    vatPercentage,
    currencySymbol,
    loyaltyPointsPerCurrency,
    loyaltyPointValue,
    firstOrderBonusPoints,
  } = data

  // Built once and spread into both branches — the two used to be
  // identical field-by-field copies, which is exactly the kind of
  // duplication that drifts the moment a field is added (as three were
  // in Part 18.1).
  const fields = {
    restaurantName: restaurantName.trim(),
    restaurantAddress: restaurantAddress.trim(),
    restaurantPhone: restaurantPhone.trim(),
    restaurantEmail: restaurantEmail.trim(),
    vatPercentage,
    currencySymbol: currencySymbol.trim(),
    loyaltyPointsPerCurrency,
    loyaltyPointValue,
    firstOrderBonusPoints: Number(firstOrderBonusPoints),
  }

  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: fields,
    create: { id: SETTINGS_ID, ...fields },
  })
}
