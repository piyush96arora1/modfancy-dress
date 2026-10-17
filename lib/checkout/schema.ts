/**
 * Checkout request validation for POST /api/checkout. Server-side only: the checkout page
 * validates with the dependency-free helpers in ./phone to keep zod out of its bundle.
 * Relative-import friendly for `tsx --test`.
 */
import { z } from 'zod'
import { MOBILE_RE, PINCODE_RE, normaliseIndianMobile } from './phone'

export { normaliseIndianMobile }

const trimmed = (max: number) => z.string().trim().max(max)

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          variantId: z.string().uuid().nullish(),
          size: trimmed(60).nullish(),
          color: trimmed(60).nullish(),
          quantity: z.number().int().min(1).max(500),
          shownPrice: z.number().nonnegative().optional(),
        }),
      )
      .min(1)
      .max(20),
    customer: z.object({
      name: trimmed(100).min(2, 'Please enter your name'),
      phone: z
        .string()
        .transform(normaliseIndianMobile)
        .refine((p) => MOBILE_RE.test(p), 'Enter a 10-digit mobile number'),
      email: z
        .string()
        .trim()
        .max(100)
        .refine((e) => e === '' || z.string().email().safeParse(e).success, 'Check the email address')
        .optional(),
    }),
    delivery: z.object({
      pincode: z.string().trim().regex(PINCODE_RE, 'Enter a 6-digit pincode'),
      method: z.enum(['courier', 'porter', 'pickup']),
      address1: trimmed(200).optional(),
      address2: trimmed(200).optional(),
      city: trimmed(80).optional(),
      state: trimmed(80).optional(),
    }),
    eventDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal('')),
    pay: z.enum(['online', 'later']),
    /** The total the customer saw. If the server's total differs, nothing is created and the
     *  customer is shown the new prices first. */
    expectedTotal: z.number().nonnegative().optional(),
    pricingMode: z.enum(['retail', 'wholesale']).default('retail'),
    /** Honeypot: real users never fill it. */
    website: z.string().max(0).optional().or(z.literal('')),
  })
  .superRefine((v, ctx) => {
    if (v.delivery.method !== 'pickup') {
      if (!v.delivery.address1 || v.delivery.address1.length < 5)
        ctx.addIssue({ code: 'custom', path: ['delivery', 'address1'], message: 'Enter house / flat and street' })
      if (!v.delivery.city || v.delivery.city.length < 2)
        ctx.addIssue({ code: 'custom', path: ['delivery', 'city'], message: 'Enter your city' })
    }
  })

export type CheckoutRequest = z.infer<typeof checkoutSchema>
