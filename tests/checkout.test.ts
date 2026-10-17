import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { deliveryFee, deliveryOptions, isDeliveryAllowed, COURIER_FEE } from '../lib/delivery/config'
import { priceLines, type ProductRow } from '../lib/checkout/pricing'
import {
  newOrderNumber, istDateStamp, ORDER_NUMBER_RE, retryCashfreeOrderId, cashfreeAttempt, orderNumberFromCashfreeId,
} from '../lib/checkout/order-number'
import { orderToken, verifyOrderToken } from '../lib/checkout/return-token'
import { verifyCashfreeSignature, paymentStatusFromCashfree } from '../lib/payments/cashfree'
import { checkoutSchema, normaliseIndianMobile } from '../lib/checkout/schema'

// Delivery -----------------------------------------------------------------------------
test('NCR pincodes get Porter or pickup; elsewhere courier', () => {
  assert.deepEqual(deliveryOptions('110051'), ['porter', 'pickup'])
  assert.deepEqual(deliveryOptions('110099'), ['porter', 'pickup'])
  assert.deepEqual(deliveryOptions('201301'), ['porter', 'pickup'])
  assert.deepEqual(deliveryOptions('122019'), ['courier']) // Manesar side, left out on purpose
  assert.deepEqual(deliveryOptions('302001'), ['courier'])
  assert.deepEqual(deliveryOptions('11005'), [])
  assert.deepEqual(deliveryOptions('011005'), [])
})
test('courier fee is charged online; Porter and pickup add nothing', () => {
  assert.equal(deliveryFee('courier', 700), COURIER_FEE)
  assert.equal(deliveryFee('porter', 700), 0)
  assert.equal(deliveryFee('pickup', 700), 0)
})
test('server rejects a delivery method the pincode does not offer', () => {
  assert.equal(isDeliveryAllowed('porter', '302001'), false)
  assert.equal(isDeliveryAllowed('courier', '110051'), false)
  assert.equal(isDeliveryAllowed('pickup', '110051'), true)
})

// Pricing ------------------------------------------------------------------------------
const P = (o: Partial<ProductRow> = {}): ProductRow => ({
  id: '11111111-1111-4111-8111-111111111111', name: 'Krishna Costume', price: 650, is_active: true, deleted_at: null,
  variants: [{ id: '22222222-2222-4222-8222-222222222222', size: 'L', color: null, price_override: 750 }], ...o,
})
test('prices from the database, not the browser', () => {
  const r = priceLines([{ productId: P().id, quantity: 2, shownPrice: 1 }], [P()])
  assert.ok(r.ok)
  if (r.ok) { assert.equal(r.subtotal, 1300); assert.equal(r.priceChanged, true) }
})
test('variant override wins; zero override falls back to product price', () => {
  const r = priceLines([{ productId: P().id, variantId: P().variants[0].id, quantity: 1, shownPrice: 750 }], [P()])
  assert.ok(r.ok && r.subtotal === 750 && !r.priceChanged && r.lines[0].size === 'L')
  const z = priceLines([{ productId: P().id, variantId: P().variants[0].id, quantity: 1 }],
    [P({ variants: [{ ...P().variants[0], price_override: 0 }] })])
  assert.ok(z.ok && z.subtotal === 650)
})
test('inactive, deleted, unknown or unpriced products are refused', () => {
  assert.equal(priceLines([{ productId: P().id, quantity: 1 }], [P({ is_active: false })]).ok, false)
  assert.equal(priceLines([{ productId: P().id, quantity: 1 }], [P({ deleted_at: '2026-01-01' })]).ok, false)
  assert.equal(priceLines([{ productId: P().id, quantity: 1 }], []).ok, false)
  assert.equal(priceLines([{ productId: P().id, quantity: 1 }], [P({ price: null })]).ok, false)
  assert.equal(priceLines([{ productId: P().id, variantId: '33333333-3333-4333-8333-333333333333', quantity: 1 }], [P()]).ok, false)
})
test('quantity bounds', () => {
  assert.equal(priceLines([{ productId: P().id, quantity: 0 }], [P()]).ok, false)
  assert.equal(priceLines([{ productId: P().id, quantity: 21 }], [P()]).ok, false)
  assert.equal(priceLines([{ productId: P().id, quantity: 1.5 }], [P()]).ok, false)
  assert.equal(priceLines([], [P()]).ok, false)
})

// Order numbers --------------------------------------------------------------------------
test('order number is IST-dated and matches the Cashfree id rules', () => {
  // 20:00 UTC on 17 Oct is 01:30 IST on 18 Oct.
  assert.equal(istDateStamp(new Date('2026-10-17T20:00:00Z')), '261018')
  for (let i = 0; i < 200; i++) {
    const n = newOrderNumber()
    assert.match(n, ORDER_NUMBER_RE)
    assert.match(n, /^[A-Za-z0-9_-]{3,45}$/)
  }
})
test('retry ids round-trip to the order number', () => {
  assert.equal(retryCashfreeOrderId('MFD-261018-ABCDE', 1), 'MFD-261018-ABCDE')
  assert.equal(retryCashfreeOrderId('MFD-261018-ABCDE', 3), 'MFD-261018-ABCDE-R3')
  assert.equal(cashfreeAttempt('MFD-261018-ABCDE-R3'), 3)
  assert.equal(cashfreeAttempt('MFD-261018-ABCDE'), 1)
  assert.equal(orderNumberFromCashfreeId('MFD-261018-ABCDE-R12'), 'MFD-261018-ABCDE')
  assert.match('MFD-261018-ABCDE-R2', ORDER_NUMBER_RE)
})

// Tokens + signatures --------------------------------------------------------------------
test('order token verifies only for its own order', () => {
  const key = 'k'.repeat(32)
  const t = orderToken('MFD-261018-ABCDE', key)
  assert.equal(verifyOrderToken('MFD-261018-ABCDE', t, key), true)
  assert.equal(verifyOrderToken('MFD-261018-ABCDF', t, key), false)
  assert.equal(verifyOrderToken('MFD-261018-ABCDE', null, key), false)
  assert.equal(verifyOrderToken('MFD-261018-ABCDE', t.slice(1), key), false)
})
test('webhook signature: valid, tampered body, stale timestamp', () => {
  const secret = 'cfsk_test_secret'
  const body = '{"type":"PAYMENT_SUCCESS_WEBHOOK"}'
  const now = 1_792_000_000_000
  const ts = String(now - 1000)
  const sig = createHmac('sha256', secret).update(ts + body).digest('base64')
  assert.equal(verifyCashfreeSignature(body, ts, sig, secret, now), true)
  assert.equal(verifyCashfreeSignature(body + ' ', ts, sig, secret, now), false)
  assert.equal(verifyCashfreeSignature(body, ts, sig, 'other', now), false)
  assert.equal(verifyCashfreeSignature(body, String(now - 10 * 60_000), createHmac('sha256', secret).update(String(now - 10 * 60_000) + body).digest('base64'), secret, now), false)
  assert.equal(verifyCashfreeSignature(body, null, sig, secret, now), false)
})
test('payment state mapping never fails a pending UPI payment', () => {
  assert.equal(paymentStatusFromCashfree({ order_status: 'PAID' }, []), 'paid')
  assert.equal(paymentStatusFromCashfree({ order_status: 'ACTIVE' }, [{ payment_status: 'PENDING' }]), 'awaiting_payment')
  assert.equal(paymentStatusFromCashfree({ order_status: 'ACTIVE' }, [{ payment_status: 'FAILED' }, { payment_status: 'PENDING' }]), 'awaiting_payment')
  assert.equal(paymentStatusFromCashfree({ order_status: 'ACTIVE' }, [{ payment_status: 'FAILED' }]), 'failed')
  assert.equal(paymentStatusFromCashfree({ order_status: 'ACTIVE' }, [{ payment_status: 'USER_DROPPED' }]), 'failed')
  assert.equal(paymentStatusFromCashfree({ order_status: 'ACTIVE' }, []), 'awaiting_payment')
  assert.equal(paymentStatusFromCashfree({ order_status: 'EXPIRED' }, []), 'failed')
})

// Validation -----------------------------------------------------------------------------
test('mobile numbers normalise from common formats', () => {
  for (const raw of ['98765 43210', '+91 98765-43210', '09876543210', '919876543210']) assert.equal(normaliseIndianMobile(raw), '9876543210')
})
const valid = {
  items: [{ productId: P().id, quantity: 1 }],
  customer: { name: 'Asha', phone: '+91 98765 43210' },
  delivery: { pincode: '302001', method: 'courier', address1: '12 MG Road', city: 'Jaipur' },
  pay: 'online',
}
test('checkout schema: valid courier order; pickup needs no address', () => {
  assert.equal(checkoutSchema.safeParse(valid).success, true)
  assert.equal(checkoutSchema.safeParse({ ...valid, delivery: { pincode: '110051', method: 'pickup' } }).success, true)
})
test('checkout schema: rejects bad phone, missing address, honeypot', () => {
  assert.equal(checkoutSchema.safeParse({ ...valid, customer: { name: 'Asha', phone: '12345' } }).success, false)
  assert.equal(checkoutSchema.safeParse({ ...valid, delivery: { pincode: '302001', method: 'courier' } }).success, false)
  assert.equal(checkoutSchema.safeParse({ ...valid, website: 'spam' }).success, false)
})

test('wholesale mode prices like the product page; retail never uses wholesale prices', () => {
  const row = P({ wholesale_price: 400 })
  const w = priceLines([{ productId: row.id, quantity: 10 }], [row], { mode: 'wholesale' })
  assert.ok(w.ok && w.subtotal === 4000)
  const auto = priceLines([{ productId: row.id, quantity: 1 }], [P()], { mode: 'wholesale', wholesaleDiscountPct: 30 })
  assert.ok(auto.ok && auto.subtotal === 455) // 650 × 0.7
  const r = priceLines([{ productId: row.id, quantity: 1 }], [row])
  assert.ok(r.ok && r.subtotal === 650)
  assert.equal(priceLines([{ productId: row.id, quantity: 21 }], [row]).ok, false)
  assert.equal(priceLines([{ productId: row.id, quantity: 21 }], [row], { mode: 'wholesale' }).ok, true)
})
