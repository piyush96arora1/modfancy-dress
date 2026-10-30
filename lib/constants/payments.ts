/**
 * Online payment at checkout ("Pay now"). Off unless NEXT_PUBLIC_ONLINE_PAYMENTS=on, so the
 * site only offers "place order, pay later" while no gateway is live (Cashfree blocked the
 * account on 30 Oct 2026). Inlined at build time: changing it needs a redeploy.
 */
export const ONLINE_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ONLINE_PAYMENTS === 'on'

/** Shown wherever "Pay now" used to be, so customers know how payment works. */
export const PAY_LATER_NOTE = 'We’ll WhatsApp you to confirm your order and share payment options.'
