const ALLOWED_RENT_VALUES = [200, 250, 300, 350, 400, 450, 500, 600, 800, 1000]

/** Round a raw rent price to the nearest value in the allowed set. */
export function computeRentPrice(retailPrice: number): number {
  const raw = retailPrice * 0.7
  let best = ALLOWED_RENT_VALUES[0]
  let bestDist = Math.abs(raw - best)
  for (const v of ALLOWED_RENT_VALUES) {
    const dist = Math.abs(raw - v)
    if (dist < bestDist) {
      best = v
      bestDist = dist
    }
  }
  return best
}

/** Derive security deposit tier from rent price. */
export function computeRentDeposit(rentPrice: number): number {
  if (rentPrice <= 200) return 500
  if (rentPrice <= 500) return 1000
  return 2000
}

export function formatRentPrice(rentPrice: number): string {
  return `₹${rentPrice}/event`
}
