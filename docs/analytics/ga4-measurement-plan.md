# GA4 measurement plan — modfancydress.com

Property: **Mod Fancy Dresses - modfancydress.com** (GA account "Personal Account", 125638606; property 558057919), IST, INR.
Web stream "modfancydress.com web" (16062859248), Measurement ID **G-WEKY2VM8CJ**.
Code: `lib/analytics/gtag.ts`, `components/analytics/`. Loaded in `app/(public)/layout.tsx` only — admin never reports.

## North star

**Qualified contacts per week** = WhatsApp chats started + calls + wholesale enquiries + orders placed,
split by intent (buy / rent / wholesale) and by festival season.

| KPI | Definition |
|---|---|
| Contact rate | sessions with any key event ÷ sessions, by landing page |
| Rent-intent contacts | `whatsapp_click` where `lead_intent=rent`, weekly, before Navratri / Halloween / Diwali |
| Wholesale lead value | `generate_lead` count and summed `value` |
| Product → contact rate | `view_item` sessions that also fire a key event |

## Events (implemented)

| Event | Fired from | Key params | Key event |
|---|---|---|---|
| `page_view` | gtag config + enhanced measurement (history changes) | — | |
| `view_item` | `components/analytics/TrackViewItem.tsx` on `/products/[slug]` | items, `has_rent` | |
| `add_to_cart` | `AddToCartButton.tsx` | items, value, `pricing_mode` | |
| `add_to_wishlist` | `AddToEnquiryButton.tsx` (wholesale enquiry basket) | items, value, `lead_intent=wholesale` | |
| `purchase` | `app/(public)/cart/page.tsx` after the order rows insert | `transaction_id` = ORD-…, items, value | **yes** |
| `generate_lead` | `WholesaleEnquiryForm.tsx`, `wholesale/enquiry/page.tsx` after a 200 | items, value, `lead_intent`, `lead_channel=form`, `cta_location` | **yes** |
| `whatsapp_click` | delegated listener, every `wa.me` link on the site | `lead_intent`, `cta_location`, `item_id`, `link_url` | **yes** |
| `phone_click` | delegated listener, every `tel:` link | `lead_intent`, `cta_location` | **yes** |
| `search` | `SearchBar.tsx` (header), `CatalogSearchBox.tsx` | `search_term`, `search_source` | |
| `pricing_mode_toggle` | `PricingModeToggle.tsx` (+ user property `pricing_mode`) | `pricing_mode` | |

`lead_intent` is inferred from the wa.me pre-filled text, then the page path (`inferLeadIntent`).
To name a CTA's placement, add `data-cta="…"` (and `data-item-id`) to the link — PDP buy/rent links already do.
**Never send name, phone, email or address.**

### Next to add (not yet wired)
`view_item_list` / `select_item` (ProductGrid, ProductCard), `view_cart` / `begin_checkout` (cart page),
`results_count` on search (zero-result searches = inventory gaps).

## GA4 Admin checklist

- [ ] Data retention → **14 months** (year-on-year Navratri comparison)
- [ ] Enhanced measurement: keep page views, scrolls, outbound clicks, file downloads; **turn off** site search and form interactions
- [ ] Key events: `purchase`, `generate_lead`, `whatsapp_click`, `phone_click`
- [ ] Custom dimensions (event): `lead_intent`, `cta_location`, `search_source`, `lead_channel`; (user) `pricing_mode`
- [ ] Internal traffic: shop IP(s) → define + activate the filter
- [ ] Link Search Console (Admin → Product links)
- [ ] UTMs: GBP website button `?utm_source=google&utm_medium=organic_local&utm_campaign=gbp_website`;
      GBP posts `utm_campaign=gbp_post_<festival>`; Instagram `utm_source=instagram&utm_medium=social&utm_campaign=<festival>_<yyyymm>`

## Reports to build ("what to improve")

1. **Funnel** view_item → add_to_cart → purchase by `pricing_mode`: where do carts die; is the 6-field cart form losing people who'd rather WhatsApp?
2. **Landing page × lead_intent × cta_location** (key events): which city / category / wholesale pages actually produce chats and calls — point SEO effort there.
3. **Search terms** (top + zero-result): costumes people want that aren't listed — upload a month before each festival.
4. **Weekly key events by lead_intent and source** (GBP / Instagram / organic): when each festival's demand starts, rent vs buy, which channel brings it.
