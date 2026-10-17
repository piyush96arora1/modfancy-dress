# Cashfree Online Payment & Mobile Checkout Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan phase by phase. Steps use checkbox (`- [ ]`) syntax for tracking. Phases 0–2 must land before any payment code ships.

**Goal:** Let a customer pay online (UPI first) from the cart in under a minute on a phone, while keeping "Place order, pay later" as the default fallback. The owner is told about every order instantly. Customers can see their order status without an account. Core Web Vitals must not get worse on any page.

**Audience:** about 90% mobile (Android Chrome is the main target, then iOS Safari, then Instagram/Facebook in-app browsers) and 10% desktop. Buyers are mostly parents who need a costume for a school event, often by tomorrow.

**Spec:** owner conversation, 15–17 Oct 2026.
- Cashfree account: PG, Payment Links and Forms are activated. `modfancydress.com` is whitelisted (prod, approved 17 Oct). Sandbox keys are in `.env.local` (`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV=sandbox`).
- Guest checkout, with no customer accounts.
- Delivery rules: courier outside Delhi NCR is **₹189**, prepaid with the order. Delhi NCR is **same-day by Porter, where the customer pays the rider the Porter fare** (the owner WhatsApps the exact fare), or **free pickup** from the Krishna Nagar shop.
- Rent and wholesale stay on WhatsApp. Pay online is hidden in wholesale pricing mode.
- Owner alerts go to a Telegram bot, plus the Cashfree Business app for payments.

**Research inputs (17 Oct):**
- Cashfree docs, saved in the session scratchpad.
- Codebase survey.
- Mobile UX and Web Vitals design.
- Measured data: 125 orders since Jan, median ₹700, about 70% outside NCR. The catalogue median price is ₹750.

---

## Owner decisions still open (do not block Phases 0–3)

| # | Decision | Default the plan uses |
|---|---|---|
| D1 | Free courier above some order value? | `FREE_COURIER_ABOVE = null` (always ₹189). It is one constant in `lib/delivery/config.ts`. |
| D2 | Refund policy for **prepaid** orders. The Returns page today says "no cash refunds, store credit only". | Full refund if cancelled **before dispatch** or the item is unavailable. After delivery, the existing exchange/store-credit policy applies. |
| D3 | Offer free pickup from the shop at checkout? | Yes, for NCR pincodes only. |
| D4 | Email optional at checkout? | Yes. Phone is required (WhatsApp + Cashfree need it). Cashfree also gets a placeholder email if none is given. |
| D5 | Telegram bot (owner creates it with @BotFather, ~5 min) | `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in env. Alerts are skipped quietly if unset. |
| D6 | Supabase: turn **off public sign-ups** (Dashboard → Auth → Providers → Email → disable "Allow new users to sign up"). | Required, see Phase 0. |

---

## Global constraints

- **The server owns the money.** No price, total, fee or status from the browser is trusted. The server reprices from the database every time.
- **Two checkout paths, one API.** "Pay now" and "Pay later" both go through `POST /api/checkout`. The anonymous client-side insert into `orders` and `order_items` is removed.
- **Web Vitals budget:**
  - Product pages: **zero** new JavaScript and no Cashfree code.
  - `/cart`: no more than about 12 KB gzipped of extra first-load JS. The Cashfree SDK (about 17.7 KB gzipped) is loaded **only when Pay is tapped**, with a preconnect on the first form focus.
  - CLS on `/cart` = 0. Every dynamic row (delivery result, delivery options, totals, pay bar) has a fixed height.
  - INP on the Pay tap: paint the "Opening payment…" state in the same frame and do the work after a yield.
  - Status and track pages: `force-dynamic` with **no `loading.tsx`** (it breaks 404 status, see memory). Use in-page `<Suspense>` with fixed-size fallbacks.
- **Mobile first:**
  - 44px tap targets.
  - Correct `inputMode` and `autoComplete` on every field.
  - Pincode first, so delivery and total resolve early.
  - A sticky pay bar that replaces the bottom nav on `/cart` and respects the safe area.
  - A form draft saved in localStorage so a failed payment never loses the customer's details.
- **Cashfree:**
  - Call the REST API with plain `fetch` (no `cashfree-pg` SDK, which pulls in axios and Sentry).
  - Pin `x-api-version: 2025-01-01`. It adds the webhook `x-idempotency-key`, and the docs' samples use it.
  - Use `redirectTarget: '_self'` on all devices: UPI intent works best from a full page, and Android may kill a backgrounded modal tab.
  - Treat `return_url` + webhook + `GET /pg/orders/{id}` as the source of truth, never the browser.
- **PII:** order status pages show the address and phone only to someone holding the signed return token or who passes the phone check. Telegram alerts carry the name, items and amount, but **not** the address or phone.
- **One batched production deploy** at go-live (deploy days cause crawl response spikes, see memory).
- Dev server uses `--webpack`. Verify with `npm run build && npm start`.

---

## Phase 0 — Security fixes found during the survey (ship first, independent)

The admin check reads `user_metadata.role`. Any signed-in user can edit their own `user_metadata` through `supabase.auth.updateUser()`. Public sign-up is **enabled** (verified 17 Oct via `/auth/v1/settings`: `disable_signup: false`). So anyone can create an account, set `role: 'admin'`, and read every order's name, phone and address, or get into `/admin`.

- [ ] **0.1** Owner disables public sign-ups in the Supabase dashboard (D6).
- [ ] **0.2** Script `scripts/set-admin-app-metadata.ts`: copy `role: 'admin'` into **`app_metadata`** for the existing admin user(s), using the service role. Log the user emails it touched.
- [ ] **0.3** Migration `supabase/migrations/20261018120000_admin_role_app_metadata.sql`: recreate every policy that reads `auth.jwt()->'user_metadata'->>'role'` so it reads `auth.jwt()->'app_metadata'->>'role'` instead. Cover orders, order_items, products, categories, banners and anything else `grep user_metadata supabase/migrations` finds.
- [ ] **0.4** Switch `proxy.ts:44`, `app/(admin)/admin/layout.tsx`, `app/api/revalidate/route.ts` and any other `user_metadata?.role` check to `app_metadata.role`. The admin must log out and back in so the JWT carries the claim.
- [ ] **0.5** Migration: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz`. The column exists live but no migration creates it.
- [ ] **0.6** `app/api/wholesale/enquiry/route.ts`: stop returning `error.message` to the client.
- **Verify:** a fresh test user (created with the service role, then deleted) who sets `user_metadata.role='admin'` gets **no** rows from `orders` and is redirected away from `/admin`. The real admin still sees everything.

## Phase 1 — Policy pages (needed for payment compliance and customer trust)

- [ ] **1.1** New `app/(public)/terms/page.tsx` ("Terms & Conditions"): seller identity and address, pricing in INR, order acceptance, payment via Cashfree, cancellations, liability, governing law (Delhi).
- [ ] **1.2** New `app/(public)/shipping-policy/page.tsx` ("Shipping & Delivery"):
  - Courier outside NCR: ₹189, 3–5 business days.
  - NCR: same-day Porter, with the customer paying the fare; noon cutoff, otherwise next morning.
  - Free pickup from the shop.
  - Worldwide by quote on WhatsApp.
  - Copy stays consistent with `lib/delivery/pincode.ts`, `DeliveryPromise` and `shippingDetails()` schema.
- [ ] **1.3** Update `returns/page.tsx` with the prepaid refund rule (D2): refund to the original payment method, UPI up to 5 working days, cards up to 7.
- [ ] **1.4** Update `privacy-policy/page.tsx:20`: payments are processed by Cashfree, we never see or store card or UPI PINs, and phone and address are used for delivery.
- [ ] **1.5** Footer: link Terms and Shipping next to Privacy and Returns. Add both to `app/sitemap.ts`.

## Phase 2 — Data model (one additive migration; nothing existing breaks)

`supabase/migrations/20261018130000_orders_payments.sql`:
- [ ] **2.1** Add `orders` columns:
  - `payment_method text check in ('online','pay_later') default 'pay_later'`
  - `payment_status text check in ('unpaid','awaiting_payment','paid','failed','refunded','partially_refunded') default 'unpaid'`
  - `items_subtotal numeric(10,2)`, `delivery_fee numeric(10,2) default 0`
  - `delivery_method text check in ('courier','porter','pickup')`
  - `cf_order_id text`, `cf_payment_id text`, `paid_at timestamptz`, `paid_amount numeric(10,2)`, `payment_group text` (upi/card/…)
  - `owner_alerted_at timestamptz`
  - Widen the `status` check to add `'delivered'`.
  - Existing rows keep their defaults: `pay_later` / `unpaid`.
- [ ] **2.2** New table `payment_events`:
  - Columns: `id`, `order_id`, `event_type`, `cf_payment_id`, `idempotency_key unique`, `payload jsonb`, `received_at`.
  - RLS on, with **no** anon or authenticated policies (service role only).
  - Used for webhook de-duplication and audit.
- [ ] **2.3** Postgres function `create_order(p jsonb) returns uuid` (`security definer`, executable by `service_role` only). It inserts the order and its items in **one transaction**, which fixes the orphan-order risk.
- [ ] **2.4** Drop the anon `INSERT` policies on `orders` and `order_items` (migrations 004–010). From here on only the server (service role) writes orders. Deploy this **in the same release as Phase 3**, or the current cart breaks.
- [ ] **2.5** Index `orders(order_number)` (already unique) and `orders(payment_status, created_at desc)` for the admin filter.

## Phase 3 — Server: pricing, Cashfree client, checkout API, webhook

New files, server-only (`import 'server-only'`):
- [ ] **3.1** `lib/supabase/admin.ts`: the service-role client. Never imported from client code. Add a lint rule or a comment guard.
- [ ] **3.2** `lib/delivery/config.ts`: `COURIER_FEE = 189` and `FREE_COURIER_ABOVE = null`. Add `deliveryOptions(pincode)`, which returns the NCR options `['porter','pickup']` or `['courier']`, and `deliveryFee(method, subtotal)` (Porter and pickup are ₹0 online; Porter shows "pay rider").
- [ ] **3.3** `lib/checkout/pricing.ts`, `priceCart(items)`:
  - Load products and variants by id with `is_active = true AND deleted_at IS NULL`.
  - Use **retail** price only (`variant.price_override ?? product.price`).
  - Reject unknown or inactive items and quantities outside 1–20.
  - Return `{lines, subtotal, changed: boolean}`, so the UI can show "price updated" when the stored cart price differs.
- [ ] **3.4** `lib/checkout/order-number.ts`: `MFD-YYMMDD-XXXXX` with the **IST** date and a `crypto.randomInt` base-32 suffix (no 0/O/1/I). It doubles as the Cashfree `order_id` (it fits `[A-Za-z0-9_-]{3,45}`).
- [ ] **3.5** `lib/payments/cashfree.ts`, plain `fetch` with a base URL by `CASHFREE_ENV`:
  - `createOrder({orderId, amount, customer, returnUrl, notifyUrl, tags})`: `customer_id = 'c' + phone`, `customer_phone` as 10 digits, `payment_methods` left default so UPI, cards and netbanking all show. Sends the `x-idempotency-key` header (the order UUID).
  - `getOrder(id)`, `getPayments(id)`, `createRefund(id, amount, refundId)`.
  - `verifyWebhook(rawBody, ts, sig)`: `base64(hmacSHA256(ts + rawBody, secret))` compared with `timingSafeEqual`; reject if the timestamp is more than 5 minutes old.
  - 8-second timeouts, and Cashfree error messages are never passed through to the client.
- [ ] **3.6** `lib/checkout/return-token.ts`: an HMAC of `orderNumber` (keyed by `ORDER_TOKEN_SECRET`) used in `return_url`. It proves the visitor is the buyer without needing a login.
- [ ] **3.7** `POST /api/checkout` (zod-validated):
  - **Input:** `{items[{productId, variantId?, size?, color?, quantity}], customer{name, phone, email?}, delivery{pincode, method, address1?, address2?, city?, state?}, eventDate?, pay: 'online'|'later', pricingMode}`.
  - Reject `pay: 'online'` when `pricingMode === 'wholesale'`.
  - Run `priceCart`, then `deliveryFee`, then the total.
  - Call the `create_order` RPC (`payment_method`, and `payment_status = online ? 'awaiting_payment' : 'unpaid'`).
  - **Pay later:** send the Telegram alert and return `{orderNumber, token}`.
  - **Pay online:** call `createOrder` with `return_url=https://www.modfancydress.com/order/{orderNumber}?t={token}` and `notify_url=https://www.modfancydress.com/api/payments/cashfree/webhook`. Return `{orderNumber, token, paymentSessionId, total}`.
  - Basic abuse limits: at most 20 lines, a body-size cap, and a honeypot field. Add a Vercel Firewall rate-limit rule on `/api/checkout` and `/api/track` if the plan allows it; otherwise log it as a follow-up.
- [ ] **3.8** `POST /api/checkout/retry` `{orderNumber, token}`:
  - Only for `awaiting_payment` or `failed` orders.
  - Cashfree order ids cannot be reused (409), so create a **new** Cashfree order `MFD-…-R2`, store it in `cf_order_id`, and return a fresh `paymentSessionId`.
  - Alternatively `{switchToPayLater: true}` flips the order to pay_later and alerts the owner.
- [ ] **3.9** `POST /api/payments/cashfree/webhook` (Node runtime):
  - Read `await req.text()`, verify the signature, insert into `payment_events` (a unique `idempotency_key` drops duplicates), then map the `type`:
    - `PAYMENT_SUCCESS_WEBHOOK`: **re-check with `getOrder`**. If `PAID`, set `payment_status='paid'`, `paid_at`, `paid_amount` and `cf_payment_id`. Send one Telegram alert, guarded by `owner_alerted_at`.
    - `PAYMENT_FAILED_WEBHOOK` / `USER_DROPPED`: set `failed`, but only if not already paid.
  - Always return 200 quickly; anything that can't be handled is logged.
  - Check that the amount paid equals `orders.total_amount`; if not, flag it in the Telegram alert.
- [ ] **3.10** `lib/notify/telegram.ts`: `sendOwnerAlert(text)` via `fetch('https://api.telegram.org/bot…/sendMessage')`, with a 3-second timeout. It never throws into the checkout path.
  - Example message: `🛍️ MFD-261018-K3X9P · PAID ₹1,237 (UPI)` · items · `Courier → 302001` / `Porter → Noida, send fare` · admin link.
- [ ] **3.11** `GET /api/orders/[orderNumber]/status?t=`: returns `{paymentStatus, status}` only, for polling.
  - If it is still `awaiting_payment`, ask Cashfree with `getOrder` and reconcile (this covers a webhook that is late or lost).
  - `Cache-Control: no-store`.

## Phase 4 — Mobile checkout UI (`/cart`)

The flow stays on one page with stacked steps; the design is in the mobile UX report.

```
[Cart items + −/+ steppers]      ← skeleton until cart hydrates (no "empty" flash)
[Need it by? date]               ← cue: "Tomorrow? Courier takes 3–5 days — WhatsApp us"
[Pincode] ✓ Delhi                ← first field; resolves delivery options + total
(•) Same-day Porter — pay rider fare   ( ) Pick up, Krishna Nagar — FREE   | or: Courier ₹189
[Mobile +91] [Name] [House/Street] [Area/Landmark] [City] [State] [Email (optional)]
──────── sticky bar (replaces bottom nav on /cart) ────────
Items ₹1,048 · Delivery ₹189 · Total ₹1,237     UPI · GPay · PhonePe · Paytm
[ 🔒 Pay ₹1,237 now ]   [ Place order, pay later ]   Questions? WhatsApp us
```

- [ ] **4.1** Fix the hydration flash: gate on `useCart.persist.hasHydrated()` and show a fixed-height skeleton.
- [ ] **4.2** Reorder and upgrade the fields:
  - Inputs at `h-11`.
  - Pincode: `inputMode=numeric autoComplete=postal-code`.
  - Phone: `type=tel autoComplete=tel-national pattern=[6-9][0-9]{9}` with a fixed `+91` prefix.
  - `autoComplete` set on name, address-line1/2, address-level2/1 and email.
  - `enterKeyHint` set on each field.
  - City is prefilled from `sameDayCity()`.
  - Pickup hides the address block.
- [ ] **4.3** Delivery choice as a `<fieldset>` radio group with a fixed height. The totals rows also have a fixed height and `aria-live="polite"`.
- [ ] **4.4** Sticky pay bar:
  - `MobileBottomNav` and `FloatingEnquiryBadge` return null on `/cart`.
  - The bar is `fixed bottom-0 z-50 pb-[env(safe-area-inset-bottom)]` with a fixed height, and the page gets matching bottom padding.
  - While the keyboard is open (`visualViewport`), the bar collapses to Total + Pay.
  - On desktop, the bar becomes the existing sticky summary card.
- [ ] **4.5** Pay online is hidden in wholesale mode. Render its slot with `visibility:hidden` until the pricing mode is known, so there's no layout shift.
- [ ] **4.6** Validation:
  - Validate on blur and on submit.
  - On submit, show an error summary with `role=alert` and move focus to the first invalid field.
  - Remove `alert()`. Errors sit inline with `aria-describedby`.
- [ ] **4.7** Pay tap:
  - Set the button to "Opening payment…" / `aria-busy` and yield.
  - Run `fetch('/api/checkout')` and `import('@cashfreepayments/cashfree-js')` (or inject the v3 script) **in parallel**.
  - Then call `cashfree.checkout({paymentSessionId, redirectTarget:'_self'})`.
  - Disable the button until the result returns, so a double tap can't pay twice.
  - Inject `<link rel=preconnect href=https://sdk.cashfree.com>` on the first form focus (next to the existing `begin_checkout`).
- [ ] **4.8** Draft and pending state:
  - Save the form to `localStorage['mfd-checkout-draft']`, debounced at 300 ms and wrapped in try/catch.
  - Store `pendingOrder {orderNumber, token}`.
  - When `/cart` is reopened with a pending order, show a banner: "Payment not finished — Retry ₹X / Pay later instead", which uses `/api/checkout/retry`.
  - Clear the cart and draft only once the order is Paid or placed as pay-later.
- [ ] **4.9** If `priceCart` says prices changed, show "Prices updated" with the new total **before** payment opens.
- [ ] **4.10** Pay later goes to `/order/{n}?t=` too, so every order has a URL that survives a refresh.
- [ ] **4.11** Remove the artificial `setTimeout` waits in the cart quantity/remove handlers and in `AddToCartButton.tsx`, to protect INP.

## Phase 5 — Order status and tracking (no accounts)

- [ ] **5.1** `app/(public)/order/[orderNumber]/page.tsx`: `force-dynamic`, `robots: noindex`, no `loading.tsx`.
  - With a valid `t`: read the order through the admin client, reconcile with `getOrder` while it's `awaiting_payment`, and render:
    - **Paid ✓**: order number with a copy button, items, delivery summary (Porter: "we'll WhatsApp the rider fare"), "Share on WhatsApp", "Track this order" link.
    - **Payment failed**: "Retry payment" or "Pay later instead".
    - **Confirming…**: a client island polls `/api/orders/[n]/status` every 3 s for 60 s, then shows "We'll WhatsApp you once the bank confirms".
    - **Pay later placed**: "We'll WhatsApp you to confirm".
  - With no or an invalid token: show "Track your order" with the phone check (5.2). Missing order → `notFound()`.
- [ ] **5.2** `app/(public)/track/page.tsx` + `POST /api/track`:
  - Takes order number + phone (full 10 digits).
  - Returns only status, payment status, items, delivery method and the city. Never the full address.
  - Gives a generic "not found" for any mismatch.
- [ ] **5.3** Status timeline: `Paid / Order placed → Confirmed → Shipped → Delivered`, with courier tracking added later when Shiprocket comes in.
- [ ] **5.4** Header and footer: add a "Track order" link. Keep `/order/*` and `/track` disallowed in `robots.ts` and out of the sitemap.

## Phase 6 — Owner tools

- [ ] **6.1** Admin order list:
  - Payment badge (Paid / Awaiting / Failed / Pay later) and a delivery-method badge (Courier / Porter / Pickup).
  - Filters: "Paid – to ship", "Pay later – to confirm".
  - Explicit status buttons (Confirm, Shipped, Delivered, Cancel) instead of the cycle.
- [ ] **6.2** Order detail:
  - Payment block (Cashfree ids, method, paid at, amount).
  - A "WhatsApp Porter fare" button that prefills *"Hi {name}, your order {n} is packed. Porter fare is ₹___, please pay the rider."*
  - A "WhatsApp: shipped" template.
- [ ] **6.3** Refunds stay in the Cashfree dashboard for v1. An admin "Refund" button (via `createRefund`, writing `payment_status='refunded'`) is v1.1.
- [ ] **6.4** Telegram setup, done by the owner (D5): create the bot and send it "hi". Then get the chat id with `getUpdates` and set both env vars in Vercel (owner) and `.env.local`.

## Phase 7 — Analytics (coordinate with the Meta/GA4 agents before shipping)

- [ ] **7.1** `purchase` (GA4 + Meta `Purchase`) fires **only** on the `/order` page when the server says `paid`, once per order (a localStorage guard). `value` = paid amount, plus `shipping` = delivery fee.
- [ ] **7.2** Pay-later orders fire `generate_lead` (GA4) / `Lead` (Meta) instead of `purchase`.
  - This changes what counts as a conversion. **Tell the GA4/Meta setup sessions**, and mark `purchase` and `generate_lead` as key events.
- [ ] **7.3** New events:
  - `add_shipping_info` when the delivery method is chosen.
  - `add_payment_info` with `payment_type: online|pay_later` on submit.
  - `payment_failed` (custom) on the failed status.

## Phase 8 — CSP & service worker

- [ ] **8.1** `next.config.ts` CSP:
  - `script-src`: + `https://sdk.cashfree.com`
  - `connect-src`: + `https://api.cashfree.com https://sandbox.cashfree.com`
  - `frame-src`: + `https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://payments-test.cashfree.com`
  - Add a `form-action 'self' https://api.cashfree.com https://sandbox.cashfree.com`, because the redirect is a form POST.
- [ ] **8.2** next-pwa: make `/cart`, `/order/*`, `/track` and `/api/*` NetworkOnly, so the service worker never serves a stale payment or status page.

## Phase 9 — Tests

- [ ] **9.1** Unit tests (`tests/*.test.ts`, node:test):
  - `deliveryOptions` / `deliveryFee`: NCR edges such as 110099 and 122019 (Manesar is out), and the threshold null vs set.
  - `priceCart`: retail only, inactive rejected, quantity bounds, price changed.
  - Order number format and IST date.
  - `verifyWebhook` with a known vector, a stale timestamp and a tampered body.
  - Return token sign/verify.
- [ ] **9.2** Sandbox end-to-end on a Vercel **preview** (https) using `testsuccess@gocash`, `testfailure@gocash`, `testuserdropped@gocash` and card `4706131211212123` / OTP `111000`:
  - Success: return page shows Paid, the webhook arrives, Telegram fires **once**, and the admin badge shows Paid.
  - Failure: Retry works (new Cashfree order) and so does switching to Pay later.
  - Closing the tab on the payment page: the webhook still marks it Paid, and `/track` shows it.
  - Replay the same webhook: no duplicate alert.
  - Tampered cart price in localStorage: the server total wins.
  - Wholesale mode: no Pay button, and the API rejects online payment.
- [ ] **9.3** Mobile checks:
  - Android Chrome (real device): UPI intent hands off to GPay/PhonePe and returns.
  - iOS Safari.
  - Instagram in-app browser: if the UPI intent fails, the customer still has the UPI QR/ID option on Cashfree's page and the Pay-later fallback.
- [ ] **9.4** Vitals: Lighthouse mobile on `/`, one product page and `/cart`, before and after. Product pages must be unchanged, and the extra first-load JS on `/cart` is checked against the budget in the build output.

## Phase 10 — Go-live checklist

- [ ] Phase 0 is live and sign-ups are disabled.
- [ ] Policy pages are live and linked in the footer.
- [ ] The owner generates **production** keys and puts them **directly in Vercel env**: `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV=production`, `ORDER_TOKEN_SECRET`, `TELEGRAM_*`. Keys never go in chat or in the repo.
- [ ] One batched production deploy. Then one real **₹1–₹10 UPI payment** on a phone, check the webhook, Telegram and admin, then **refund it** from the dashboard.
- [ ] Watch the first 48 hours: Cashfree dashboard vs the `orders` table (paid count and sum match), and Telegram alerts.
- [ ] After 2 weeks, review GA4:
  - cart → order rate (baseline: 47 carts → 9 orders, 8–14 Oct)
  - online vs pay-later split
  - share of failed payments
  - any drop-off at the delivery line
  - Decide D1 (free-delivery threshold) and whether COD via Shiprocket is next.

---

## Order of work & rough effort

| Phase | Effort | Can ship alone? |
|---|---|---|
| 0 Security | 0.5 day | **Yes, ship now** |
| 1 Policies | 0.5 day | Yes |
| 2 + 3 Data + server | 2 days | With 4 (2.4 removes the anon insert) |
| 4 Checkout UI | 1.5 days | With 2 + 3 |
| 5 Status/track | 1 day | With 2–4 |
| 6 Owner tools | 0.5 day | With 2–4 |
| 7 Analytics, 8 CSP/SW | 0.5 day | With 2–4 |
| 9 Tests + sandbox E2E | 1 day | — |

**About 7 working days.** Target: **live before 1 Nov**, ahead of Children's Day (14 Nov) school events.

## Out of scope (next)

- **COD + courier automation:** Shiprocket (rates, AWB, tracking link on `/track`, COD fee about ₹49).
- **Admin refund button**, and Cashfree Payment Links created from the admin for rent deposits.
- **WhatsApp Business API** for customer confirmations (overlaps with the Meta setup session).
- **Google Merchant Center** shipping settings + `shippingRate` in Product schema once delivery prices settle.
