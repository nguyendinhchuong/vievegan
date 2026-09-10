# Meal Prep Shopify Hydrogen E-Commerce — Design Spec

**Date:** 2026-09-10  
**Status:** Approved for implementation planning  
**Brand:** Vie Vegan (Footscray, Australia)

## Goal

Turn meal-prep ordering into a real e-commerce flow: browse meals, add to cart, choose local delivery or pickup with a scheduled delivery day, and checkout to create a Shopify order — while keeping the existing cinematic marketing site and soft-launching alongside Bitely.

## Decisions locked

| Topic | Choice |
| --- | --- |
| Existing Shopify store | Yes — store exists; no custom app / headless setup yet |
| Storefront approach | Separate **Hydrogen** app for meal prep; Vite site stays marketing |
| Delivery model | Local delivery zones + optional pickup (no AU-wide shipping in v1) |
| Scheduling | Delivery day/window with cut-off rules (no capacity limits in v1) |
| Launch mode | Soft launch — Hydrogen primary, Bitely secondary fallback |
| Hosting / URL | Shopify Oxygen on a subdomain (e.g. `mealprep.vievegan.com.au`) |
| Architecture pattern | Hydrogen + Storefront API cart + cart attributes + Shopify Checkout |
| Visual design | Must match the current marketing website language |

## Non-goals (v1)

- Australia-wide shipping / cold-chain courier
- Third-party delivery marketplaces as the cart (DoorDash, Uber Eats)
- Delivery-day capacity / sold-out slots
- Checkout UI extensions or Delivery Customization Functions
- Custom order database or scheduling backend
- Customer accounts / subscriptions
- Fully removing Bitely on day one
- Rebuilding homepage/menu in Hydrogen

## Architecture

```
[Vite marketing site]                    [Hydrogen on Oxygen]
 homepage / menu / meal-prep editorial    mealprep.<domain>
        |                                          |
        | primary CTA                              |
        +------------------------------------------>|
        |                                          |
        | secondary Bitely fallback                v
        +---------> Bitely                 Storefront API
                                                   |
                                                   v
                                           Shopify Checkout
                                                   |
                                                   v
                                           Shopify Admin orders
                                           (+ cart attributes)
```

- **Marketing site (`le`):** remains Vite + React. Primary “Order meal prep” CTAs point to the Hydrogen subdomain. Bitely remains as a labelled secondary link during soft launch.
- **Hydrogen app:** customer-facing meal-prep commerce (catalog, cart, fulfilment step, checkout redirect).
- **Shopify store:** source of truth for products, inventory, payments, GST, local delivery profiles, pickup, and orders.
- **Scheduling data:** stored as cart attributes before checkout so kitchen staff can read them on the order.

## Visual consistency

Hydrogen UI must feel like the same Vie Vegan site, not default Hydrogen chrome.

Reuse from the marketing site:

- Colour tokens: `--ink`, `--paper`, `--paper-deep`, `--chilli`, `--leaf`, `--acid`, `--line`
- Typography: Fraunces (serif display) + DM Sans (body/UI)
- Motion: Framer-style easing `[0.22, 1, 0.36, 1]`, restrained reveal / hover; honour `prefers-reduced-motion`
- Layout language: full-bleed hero where appropriate, editorial product storytelling, minimal card chrome, brand-first hierarchy
- Shared assets: logo and meal photography (Shopify product images should match current meal-prep imagery)

Port tokens into Hydrogen CSS (shared package or copied design tokens file). Do not introduce a conflicting design system (e.g. default Shopify Polaris-looking storefront).

## Components & surfaces

### Hydrogen storefront

| Surface | Responsibility |
| --- | --- |
| Range / home | Meal-prep collection grid; add to cart |
| Product detail | Price, pack size, description, quantity, add to cart |
| Cart | Line items, quantities, subtotal, continue to fulfilment |
| Fulfilment step | Delivery vs Pickup; postcode zone check; day/window picker; write cart attributes; go to Checkout |
| Header / footer | Vie Vegan branding; link to marketing site; Bitely as non-competing secondary help link only |

### Shared config (Hydrogen)

Config module (not hard-coded across components):

- Allowed delivery postcodes / suburbs (Footscray local zones)
- Allowed delivery weekdays
- Cut-off rule (timezone `Australia/Melbourne`)
- Delivery window label(s)
- Cart attribute keys

### Shopify Admin (configuration)

- Products for the nine meals + `meal-prep` collection
- Local delivery profile + pickup
- Australia / AUD / GST
- Payments (test then live)
- Staff can read order attributes for packing/dispatch

### Vite marketing site (minimal)

- Point primary meal-prep order CTAs to Hydrogen subdomain
- Keep Bitely as secondary/fallback during soft launch
- Editorial `/meal-prep` page may remain; commerce happens on Hydrogen

### Repo layout

Prefer monorepo sibling folders in this repository:

- `apps/marketing` — current Vite site (or keep root as marketing until a later move)
- `apps/mealprep-hydrogen` — new Hydrogen app

If moving the Vite app is too disruptive for v1, add `apps/mealprep-hydrogen` beside the existing root app and document the layout; avoid a forced big-bang restructure.

## Data flow

1. Hydrogen loads products/collection via Storefront API.
2. Customer adds lines to cart (`cartCreate` / `cartLinesAdd`).
3. Fulfilment step:
   - Choose `delivery` or `pickup`
   - If delivery: validate postcode against allowlist
   - Choose next valid delivery date/window using cut-off rules
4. Server-side Hydrogen action re-validates rules, then `cartAttributesUpdate`:
   - `delivery_method`: `delivery` | `pickup`
   - `delivery_postcode`: string (delivery only)
   - `delivery_date`: ISO date (`YYYY-MM-DD`)
   - `delivery_window`: e.g. `16:00-20:00`
5. Redirect to `cart.checkoutUrl` (Shopify Checkout).
6. Customer pays; order appears in Admin with attributes for kitchen ops.
7. Shipping method at Checkout is the Shopify local-delivery rate or pickup option configured in Admin.

### Delivery rules

- Local postcode allowlist only.
- Configurable weekdays (example default: Wednesday and Friday — final days set during store setup).
- Cut-off in `Australia/Melbourne` (example default: 12:00, N days before delivery day — final values set during setup).
- Outside zone → error and offer Pickup.
- Past cut-off → day disabled; show next valid day.
- Missing fulfilment attributes or empty cart → block Checkout CTA.

### Error handling

- Network/API failures: user-visible retry; preserve cart session.
- Inventory / sold out: disable add to cart; show unavailable state.
- Checkout cancel/return: return to cart with attributes retained when possible.
- Hydrogen outage during soft launch: Bitely fallback remains on marketing CTAs.

## Shopify store & app setup

### Store configuration (merchant)

1. Confirm Australia market, AUD, GST settings.
2. Create/publish the nine meal-prep products and `meal-prep` collection (names, images, pack sizes, prices, inventory).
3. Configure **Pickup** and **Local delivery** profiles with postcode zones and rates that match the Hydrogen allowlist.
4. Enable payments in test mode; switch to live after a successful test order.
5. Train staff to read delivery attributes on orders.
6. Connect custom domain for Oxygen (`mealprep.<domain>`).

### Custom app / headless access (developer)

1. Create a Shopify app in the Dev Dashboard / Partner account for Vie Vegan meal prep.
2. Install the app on the existing store.
3. Generate a **Storefront API** token with scopes needed for products, collections, cart, and checkout URL.
4. Scaffold/link Hydrogen via Shopify CLI; set env: store domain, Storefront token, public storefront ID as required by current Hydrogen templates.
5. Deploy to Oxygen; attach the subdomain.
6. Admin API is **not** required for the v1 customer purchase path.

Detailed click-by-click setup belongs in the implementation plan’s setup appendix.

## Soft launch & cutover

**Phase 1 — Soft launch**

- Hydrogen live on subdomain.
- Marketing primary CTA → Hydrogen.
- Secondary “Order via Bitely” remains.
- Monitor orders, attributes, delivery-zone edge cases.

**Phase 2 — Cutover**

- Remove Bitely links from meal-prep CTAs.
- Optionally keep Bitely only as an ops emergency note offline.
- Kitchen fully on Shopify orders.

## Testing strategy

- Unit: postcode allowlist + cut-off / next-valid-day helpers.
- Integration: add to cart, attribute write, checkout URL present.
- Visual: Hydrogen pages match marketing tokens on desktop and mobile.
- Manual: place test order; confirm Admin shows method, postcode, date, window; confirm Bitely fallback still reachable during soft launch.

## Success criteria

- Customer can buy meal prep end-to-end on Hydrogen without leaving Shopify’s payment/checkout system.
- Local delivery or pickup is selectable; invalid postcodes are blocked.
- Delivery day respects cut-off rules and is visible on the Shopify order.
- Marketing site still looks and behaves as today, with soft-launch CTAs.
- UI of the Hydrogen storefront is recognisably Vie Vegan (same tokens, type, motion language).
