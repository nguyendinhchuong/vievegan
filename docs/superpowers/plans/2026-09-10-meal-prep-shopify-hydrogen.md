# Meal Prep Shopify Hydrogen E-Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Soft-launch a Vie Vegan meal-prep Hydrogen storefront on Oxygen (subdomain) with cart, local delivery/pickup scheduling via cart attributes, and Shopify Checkout — while keeping the Vite marketing site and Bitely as a fallback.

**Architecture:** Keep the existing Vite app at repo root. Add `apps/mealprep-hydrogen` (Hydrogen + Oxygen). Shopify remains source of truth for catalog, shipping profiles, payments, and orders. Delivery day/window are validated in Hydrogen and written as cart attributes before redirecting to `checkoutUrl`. Marketing CTAs point primary traffic to Hydrogen and keep Bitely secondary.

**Tech Stack:** Shopify Hydrogen (React Router), Storefront API, Oxygen, Vite/React 19 marketing site, Vitest, Playwright, Framer Motion + existing Vie Vegan design tokens.

**Spec:** `docs/superpowers/specs/2026-09-10-meal-prep-shopify-hydrogen-design.md`

---

## File Map

| Path | Responsibility |
| --- | --- |
| `apps/mealprep-hydrogen/` | New Hydrogen storefront (Oxygen deployable) |
| `apps/mealprep-hydrogen/app/lib/delivery.ts` | Postcode allowlist, cut-off, next valid days, attribute keys |
| `apps/mealprep-hydrogen/app/lib/delivery.test.ts` | Unit tests for delivery rules |
| `apps/mealprep-hydrogen/app/styles/tokens.css` | Vie Vegan design tokens ported from marketing site |
| `apps/mealprep-hydrogen/app/components/SiteHeader.tsx` | Brand header + cart link + marketing-site link |
| `apps/mealprep-hydrogen/app/components/SiteFooter.tsx` | Footer + secondary Bitely fallback |
| `apps/mealprep-hydrogen/app/routes/collections.meal-prep.tsx` | Meal-prep range (or remap `/` to this collection) |
| `apps/mealprep-hydrogen/app/routes/products.$handle.tsx` | Product detail + add to cart |
| `apps/mealprep-hydrogen/app/routes/cart.tsx` | Cart lines / quantities |
| `apps/mealprep-hydrogen/app/routes/fulfilment.tsx` | Delivery/pickup + schedule + attributes + checkout |
| `src/mealPrepData.js` | Soft-launch URLs (Hydrogen primary, Bitely fallback) |
| `src/MealPrepPage.jsx` | Dual CTAs for soft launch |
| `src/App.test.jsx` | Updated CTA contract tests |
| `.env.example` (Hydrogen) | Documented Storefront / session env vars |
| `docs/superpowers/specs/2026-09-10-meal-prep-shopify-hydrogen-design.md` | Approved design (read-only reference) |

**Do not** move the Vite app into `apps/marketing` in v1 (avoid big-bang restructure).

---

## Prerequisite Gate (complete before coding Tasks 3+)

Complete **Appendix A** (store products, delivery, payments) and **Appendix B** (Hydrogen channel + link) far enough that:

- Nine meal-prep products exist in the Shopify store
- Collection handle `meal-prep` exists and is published to the Hydrogen storefront channel
- Local delivery + pickup are configured
- `npx shopify hydrogen link` + `env pull` succeed against the real store

Until then, Hydrogen can run against Mock.shop only for scaffolding/UI work (Tasks 1–2, partial Task 3).

---

### Task 1: Scaffold Hydrogen app beside the marketing site

**Files:**
- Create: `apps/mealprep-hydrogen/**` (CLI-generated)
- Create: `apps/mealprep-hydrogen/README.md` (short runbook)

- [ ] **Step 1: Install Shopify CLI if missing**

```bash
npm install -g @shopify/cli@latest
shopify version
```

Expected: prints a CLI version (Node 18+ / 20+ recommended; Shopify docs require Node ≥ 16.20).

- [ ] **Step 2: Scaffold into `apps/mealprep-hydrogen`**

From repo root:

```bash
mkdir -p apps
cd apps
npm create @shopify/hydrogen@latest mealprep-hydrogen
```

When prompted (if not using `--quickstart`):

- Language: **JavaScript** (match marketing site; TypeScript is fine if team prefers — then adapt file extensions in later tasks)
- Prefer the standard template with Cart / Products / Collections routes

If the CLI only supports creating in cwd with a generated folder name, create then rename/move to `apps/mealprep-hydrogen`.

- [ ] **Step 3: Verify local Mock.shop boot**

```bash
cd apps/mealprep-hydrogen
npm run dev
```

Expected: http://localhost:3000 loads Hydrogen demo storefront.

- [ ] **Step 4: Add a short README runbook**

Create `apps/mealprep-hydrogen/README.md`:

```markdown
# Vie Vegan Meal Prep (Hydrogen)

## Dev
npm install
npx shopify hydrogen link   # once
npx shopify hydrogen env pull
npm run dev

## Deploy
npx shopify hydrogen deploy

## Soft launch
Primary storefront URL is set in marketing `src/mealPrepData.js` as `mealPrepShopifyUrl`.
```

- [ ] **Step 5: Commit**

```bash
git add apps/mealprep-hydrogen
git commit -m "chore: scaffold Hydrogen meal-prep storefront"
```

---

### Task 2: Delivery rules module (TDD)

**Files:**
- Create: `apps/mealprep-hydrogen/app/lib/delivery.ts` (or `.js`)
- Create: `apps/mealprep-hydrogen/app/lib/delivery.test.ts` (or `.js`)
- Modify: `apps/mealprep-hydrogen/package.json` (ensure Vitest available — Hydrogen templates often include it; add if missing)

- [ ] **Step 1: Add Vitest script if missing**

In `apps/mealprep-hydrogen/package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Install if needed:

```bash
cd apps/mealprep-hydrogen && npm install -D vitest
```

- [ ] **Step 2: Write failing delivery tests**

Create `apps/mealprep-hydrogen/app/lib/delivery.test.js`:

```js
import {describe, expect, it} from 'vitest'
import {
  CART_ATTRIBUTE_KEYS,
  isPostcodeAllowed,
  getNextDeliveryDates,
  buildCartAttributes,
} from './delivery'

describe('isPostcodeAllowed', () => {
  it('allows configured Footscray-area postcodes', () => {
    expect(isPostcodeAllowed('3011')).toBe(true)
    expect(isPostcodeAllowed('3012')).toBe(true)
  })

  it('rejects outside zones and junk input', () => {
    expect(isPostcodeAllowed('2000')).toBe(false)
    expect(isPostcodeAllowed('')).toBe(false)
    expect(isPostcodeAllowed('abc')).toBe(false)
  })
})

describe('getNextDeliveryDates', () => {
  it('skips a Wednesday that is past the Melbourne cut-off', () => {
    // Tuesday 12:30 Australia/Melbourne → Wednesday already cut off if cutOffHours=12 and minDays=1
    const now = new Date('2026-09-08T02:30:00.000Z') // Tue 12:30 AEST (UTC+10 in Sep)
    const dates = getNextDeliveryDates(now, {count: 4})
    expect(dates[0]).toBe('2026-09-11') // Friday
    expect(dates).toContain('2026-09-16') // next Wednesday
  })
})

describe('buildCartAttributes', () => {
  it('builds delivery attributes', () => {
    const attrs = buildCartAttributes({
      method: 'delivery',
      postcode: '3011',
      date: '2026-09-11',
      window: '16:00-20:00',
    })
    expect(attrs).toEqual([
      {key: CART_ATTRIBUTE_KEYS.method, value: 'delivery'},
      {key: CART_ATTRIBUTE_KEYS.postcode, value: '3011'},
      {key: CART_ATTRIBUTE_KEYS.date, value: '2026-09-11'},
      {key: CART_ATTRIBUTE_KEYS.window, value: '16:00-20:00'},
    ])
  })

  it('omits postcode for pickup', () => {
    const attrs = buildCartAttributes({
      method: 'pickup',
      date: '2026-09-11',
      window: '16:00-20:00',
    })
    expect(attrs.find((a) => a.key === CART_ATTRIBUTE_KEYS.postcode)).toBeUndefined()
    expect(attrs.find((a) => a.key === CART_ATTRIBUTE_KEYS.method)?.value).toBe('pickup')
  })
})
```

Adjust the fixed `now` instant if the engineer’s timezone math differs — lock tests to explicit UTC instants and document the offset assumption in comments.

- [ ] **Step 3: Run tests — expect FAIL**

```bash
cd apps/mealprep-hydrogen && npm test -- app/lib/delivery.test.js
```

Expected: FAIL (module missing).

- [ ] **Step 4: Implement delivery module**

Create `apps/mealprep-hydrogen/app/lib/delivery.js`:

```js
export const CART_ATTRIBUTE_KEYS = {
  method: 'delivery_method',
  postcode: 'delivery_postcode',
  date: 'delivery_date',
  window: 'delivery_window',
}

/** @type {ReadonlySet<string>} */
export const ALLOWED_POSTCODES = new Set([
  // Seed list — replace with merchant-confirmed Footscray local zones during Appendix A
  '3011', // Footscray
  '3012', // West Footscray / Kingsville area (confirm)
  '3013', // Yarraville (confirm)
  '3015', // Seddon / Newport fringe (confirm)
  '3016', // Williamstown fringe (confirm)
  '3019', // Braybrook (confirm)
  '3020', // Sunshine fringe (confirm)
  '3031', // Kensington / Flemington fringe (confirm)
  '3032', // Ascot Vale fringe (confirm)
])

export const DELIVERY_CONFIG = {
  timeZone: 'Australia/Melbourne',
  /** 0=Sun … 6=Sat — default Wed + Fri */
  weekdays: [3, 5],
  cutOffHour: 12,
  cutOffMinute: 0,
  /** Minimum whole calendar days ahead after cut-off logic */
  minLeadDays: 1,
  windowLabel: '16:00-20:00',
  maxOptions: 6,
}

export const isPostcodeAllowed = (postcode) => {
  const normalized = String(postcode ?? '').trim()
  return ALLOWED_POSTCODES.has(normalized)
}

const melbourneParts = (date) => {
  const fmt = new Intl.DateTimeFormat('en-AU', {
    timeZone: DELIVERY_CONFIG.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  })
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]))
  return parts
}

const toIsoDateInMelbourne = (date) => {
  const p = melbourneParts(date)
  return `${p.year}-${p.month}-${p.day}`
}

const weekdayNumberMelbourne = (date) => {
  // Map en-AU weekday short to 0-6
  const map = {Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6}
  return map[melbourneParts(date).weekday]
}

const isBeforeCutOffMelbourne = (date) => {
  const p = melbourneParts(date)
  const minutes = Number(p.hour) * 60 + Number(p.minute)
  const cut = DELIVERY_CONFIG.cutOffHour * 60 + DELIVERY_CONFIG.cutOffMinute
  return minutes < cut
}

/**
 * @param {Date} now
 * @param {{count?: number}} [opts]
 * @returns {string[]} ISO dates YYYY-MM-DD in Melbourne
 */
export const getNextDeliveryDates = (now = new Date(), opts = {}) => {
  const count = opts.count ?? DELIVERY_CONFIG.maxOptions
  const results = []
  // Start scanning from today (Melbourne)
  let cursor = new Date(now.getTime())

  for (let i = 0; i < 60 && results.length < count; i += 1) {
    const iso = toIsoDateInMelbourne(cursor)
    const weekday = weekdayNumberMelbourne(cursor)
    const isAllowedWeekday = DELIVERY_CONFIG.weekdays.includes(weekday)

    if (isAllowedWeekday) {
      const todayIso = toIsoDateInMelbourne(now)
      const leadMs = new Date(`${iso}T00:00:00+10:00`).getTime() - new Date(`${todayIso}T00:00:00+10:00`).getTime()
      const leadDays = Math.round(leadMs / 86400000)

      let ok = leadDays >= DELIVERY_CONFIG.minLeadDays
      if (leadDays === DELIVERY_CONFIG.minLeadDays && iso !== todayIso) {
        // If delivering on the minimum lead day, require that we are still before cut-off *today*
        ok = isBeforeCutOffMelbourne(now)
      }
      if (leadDays > DELIVERY_CONFIG.minLeadDays) ok = true
      // Same-day never allowed for meal prep v1
      if (iso === todayIso) ok = false

      // Special case: if minLeadDays=1 and today is Tue after cut-off, Wednesday must be excluded
      if (ok) results.push(iso)
    }

    cursor = new Date(cursor.getTime() + 86400000)
  }

  return results
}

export const buildCartAttributes = ({method, postcode, date, window}) => {
  const attrs = [
    {key: CART_ATTRIBUTE_KEYS.method, value: method},
    {key: CART_ATTRIBUTE_KEYS.date, value: date},
    {key: CART_ATTRIBUTE_KEYS.window, value: window ?? DELIVERY_CONFIG.windowLabel},
  ]
  if (method === 'delivery' && postcode) {
    attrs.splice(1, 0, {key: CART_ATTRIBUTE_KEYS.postcode, value: String(postcode).trim()})
  }
  return attrs
}
```

Tune `getNextDeliveryDates` until the Task 2 tests pass; prefer clarity over clever DST math. If DST edges are painful, compute lead days using Melbourne calendar dates only (string compare on `YYYY-MM-DD`) instead of `+10:00` fixed offsets.

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd apps/mealprep-hydrogen && npm test -- app/lib/delivery.test.js
```

- [ ] **Step 6: Commit**

```bash
git add apps/mealprep-hydrogen/app/lib/delivery.js apps/mealprep-hydrogen/app/lib/delivery.test.js apps/mealprep-hydrogen/package.json package-lock.json
git commit -m "feat: add meal-prep delivery zone and cut-off helpers"
```

---

### Task 3: Port Vie Vegan design tokens + chrome

**Files:**
- Create: `apps/mealprep-hydrogen/app/styles/tokens.css`
- Modify: Hydrogen root CSS import (e.g. `app/styles/app.css`)
- Create: `apps/mealprep-hydrogen/app/components/SiteHeader.jsx`
- Create: `apps/mealprep-hydrogen/app/components/SiteFooter.jsx`
- Modify: root layout route (e.g. `app/root.jsx` or `app/routes/$.jsx` layout) to render header/footer

- [ ] **Step 1: Add tokens**

Create `apps/mealprep-hydrogen/app/styles/tokens.css`:

```css
:root {
  --ink: #171914;
  --paper: #f4f0e7;
  --paper-deep: #e8e1d4;
  --chilli: #d63c22;
  --leaf: #1f6a46;
  --acid: #d5e449;
  --line: rgba(23, 25, 20, 0.18);
  --serif: 'Fraunces', Georgia, serif;
  --sans: 'DM Sans', Arial, sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

html, body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
}

h1, h2, h3, .display {
  font-family: var(--serif);
  font-weight: 500;
}
```

Load Google fonts Fraunces + DM Sans in `root.jsx` `<head>` (same as marketing site).

- [ ] **Step 2: Replace default Hydrogen chrome with SiteHeader/SiteFooter**

`SiteHeader.jsx` requirements:

- Vie Vegan logo linking to marketing origin (`PUBLIC_MARKETING_ORIGIN` env, default `https://vievegan.com.au` or whatever production domain is)
- Nav: Menu → marketing `/menu`, Meal prep → `/collections/meal-prep`, Visit → marketing `/#visit`
- Cart link with item count
- No Bitely in header primary CTA

`SiteFooter.jsx` requirements:

- Short brand line
- Secondary text link: `Order via Bitely` → Bitely URL (soft launch only)
- Link back to marketing site

- [ ] **Step 3: Visually verify**

```bash
cd apps/mealprep-hydrogen && npm run dev
```

Expected: paper background, serif headings, chilli accents; does **not** look like default Shopify demo chrome.

- [ ] **Step 4: Commit**

```bash
git add apps/mealprep-hydrogen/app/styles apps/mealprep-hydrogen/app/components apps/mealprep-hydrogen/app/root.jsx
git commit -m "feat: apply Vie Vegan brand tokens to Hydrogen shell"
```

---

### Task 4: Meal-prep collection as storefront home

**Files:**
- Modify: `apps/mealprep-hydrogen/app/routes/_index.jsx` (redirect or render meal-prep collection)
- Modify/create: `apps/mealprep-hydrogen/app/routes/collections.$handle.jsx`
- Optional: GraphQL fragment for product card fields

- [ ] **Step 1: Make `/` show the meal-prep range**

In `_index.jsx`, either:

- `redirect('/collections/meal-prep')`, or
- query `collection(handle: "meal-prep")` and render the grid inline

Prefer **redirect** for a single canonical range URL.

```js
import {redirect} from 'react-router' // or @shopify/remix-oxygen redirect helper used by the template

export const loader = () => redirect('/collections/meal-prep')
```

(Use the redirect import already used by the generated Hydrogen template.)

- [ ] **Step 2: Style collection grid editorially**

Product cards:

- Full-bleed image (not heavy card chrome)
- Name (serif), short description, price
- `Add to cart` button (chilli primary) OR link to product detail
- Unavailable state when `!variant.availableForSale`

- [ ] **Step 3: Manual check against Shopify collection**

After Appendix A + `hydrogen link`:

```bash
npx shopify hydrogen env pull
npm run dev
```

Expected: nine Vie Vegan meals, not Mock.shop placeholders.

- [ ] **Step 4: Commit**

```bash
git add apps/mealprep-hydrogen/app/routes
git commit -m "feat: make meal-prep collection the Hydrogen home range"
```

---

### Task 5: Product detail + add to cart

**Files:**
- Modify: `apps/mealprep-hydrogen/app/routes/products.$handle.jsx`
- Modify: existing cart action route used by the template (often `cart.jsx` or `cart.$lines.jsx`)

- [ ] **Step 1: Ensure product page uses brand layout**

Show: title, description, pack size (from description or Shopify metafield later), price, quantity input, Add to cart.

- [ ] **Step 2: Wire Add to cart to Storefront cart lines add**

Use the template’s existing cart handler. After success, either open cart drawer or navigate to `/cart`.

- [ ] **Step 3: Sold-out handling**

If selected variant `availableForSale === false`, disable submit and show “Unavailable”.

- [ ] **Step 4: Smoke test**

Add two different meals; confirm cart count increments.

- [ ] **Step 5: Commit**

```bash
git add apps/mealprep-hydrogen/app/routes
git commit -m "feat: brand product detail and add-to-cart for meal prep"
```

---

### Task 6: Cart page → fulfilment gate

**Files:**
- Modify: `apps/mealprep-hydrogen/app/routes/cart.jsx`
- Create: `apps/mealprep-hydrogen/app/routes/fulfilment.jsx`

- [ ] **Step 1: Change primary cart CTA**

Replace direct `checkoutUrl` button with:

```jsx
<a href="/fulfilment">Continue to delivery options</a>
```

Keep line item quantity updates / removes working.

- [ ] **Step 2: Empty cart guard on fulfilment**

In `fulfilment.jsx` loader: if cart is empty or missing, redirect to `/collections/meal-prep`.

- [ ] **Step 3: Commit**

```bash
git add apps/mealprep-hydrogen/app/routes/cart.jsx apps/mealprep-hydrogen/app/routes/fulfilment.jsx
git commit -m "feat: gate checkout behind fulfilment step"
```

---

### Task 7: Fulfilment step (delivery/pickup + attributes + checkout)

**Files:**
- Modify: `apps/mealprep-hydrogen/app/routes/fulfilment.jsx`
- Use: `app/lib/delivery.js`

- [ ] **Step 1: Build fulfilment UI**

Form fields:

1. Method radio: Delivery | Pickup
2. If Delivery: postcode text input + validate with `isPostcodeAllowed`
3. Date `<select>` options from `getNextDeliveryDates(new Date())`
4. Window display (read-only label from `DELIVERY_CONFIG.windowLabel`)
5. Submit: “Proceed to checkout”

Accessibility:

- `fieldset` + `legend` for method
- `aria-invalid` / `aria-describedby` on postcode errors
- Keyboard-focusable controls

- [ ] **Step 2: Server action validates + writes cart attributes**

Pseudo-implementation (adapt to template’s Storefront cart API helpers):

```js
import {isPostcodeAllowed, getNextDeliveryDates, buildCartAttributes, DELIVERY_CONFIG} from '~/lib/delivery'

export const action = async ({request, context}) => {
  const form = await request.formData()
  const method = String(form.get('method') || '')
  const postcode = String(form.get('postcode') || '').trim()
  const date = String(form.get('date') || '')
  const window = DELIVERY_CONFIG.windowLabel

  if (method !== 'delivery' && method !== 'pickup') {
    return {ok: false, error: 'Choose delivery or pickup.'}
  }
  if (method === 'delivery' && !isPostcodeAllowed(postcode)) {
    return {ok: false, error: 'Sorry — we only deliver to local Footscray-area postcodes. Pick up in-store instead?'}
  }
  const allowedDates = getNextDeliveryDates(new Date())
  if (!allowedDates.includes(date)) {
    return {ok: false, error: 'That delivery day is no longer available. Pick another day.'}
  }

  const attributes = buildCartAttributes({method, postcode, date, window})
  const cart = await context.cart.updateAttributes(attributes) // use template helper name
  const checkoutUrl = cart.checkoutUrl
  if (!checkoutUrl) return {ok: false, error: 'Checkout is unavailable. Try again.'}
  return redirect(checkoutUrl)
}
```

If the template exposes GraphQL directly, use `cartAttributesUpdate` mutation with the cart id from session.

- [ ] **Step 3: Manual test**

1. Add meals → fulfilment
2. Postcode `2000` → error + pickup suggestion
3. Postcode `3011` + valid Friday → lands on Shopify Checkout
4. Complete test payment
5. In Admin → Order → note attributes `delivery_method`, `delivery_postcode`, `delivery_date`, `delivery_window`

- [ ] **Step 4: Commit**

```bash
git add apps/mealprep-hydrogen/app/routes/fulfilment.jsx
git commit -m "feat: save delivery schedule on cart and send to Shopify Checkout"
```

---

### Task 8: Soft-launch marketing site CTAs

**Files:**
- Modify: `src/mealPrepData.js`
- Modify: `src/MealPrepPage.jsx`
- Modify: `src/App.test.jsx`
- Modify: `tests/visual.spec.js` only if selectors break

- [ ] **Step 1: Write failing marketing CTA test**

Replace the Bitely-only assertion in `src/App.test.jsx` with:

```jsx
it('renders the complete meal prep route with products and soft-launch ordering', () => {
  window.history.pushState({}, '', '/meal-prep')
  render(<App />)

  expect(screen.getByRole('heading', {
    level: 1,
    name: /your week of bold vietnamese, sorted/i,
  })).toBeInTheDocument()

  const range = screen.getByRole('region', { name: /meal prep range/i })
  expect(within(range).getAllByRole('article')).toHaveLength(9)

  const primary = screen.getAllByRole('link', { name: /order meal prep|order now/i })
  expect(primary.length).toBeGreaterThan(0)
  primary.forEach((link) => {
    expect(link).toHaveAttribute('href', 'https://mealprep.vievegan.com.au')
  })

  const fallback = screen.getAllByRole('link', { name: /order via bitely/i })
  expect(fallback.length).toBeGreaterThan(0)
  fallback.forEach((link) => {
    expect(link).toHaveAttribute(
      'href',
      'https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz',
    )
  })
})
```

Use the real Oxygen custom domain once known; until DNS exists, use an env-driven constant and test against that constant.

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --run src/App.test.jsx
```

- [ ] **Step 3: Update data + page CTAs**

`src/mealPrepData.js`:

```js
export const mealPrepShopifyUrl = 'https://mealprep.vievegan.com.au'
export const mealPrepBitelyUrl = 'https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz'
/** @deprecated use mealPrepShopifyUrl — kept during soft launch naming transition */
export const mealPrepOrderUrl = mealPrepShopifyUrl
```

Update `MealPrepPage.jsx`:

- Primary CTAs (nav, hero, order band, mobile bar) → `mealPrepShopifyUrl` (same tab or new tab — prefer same-tab for storefront)
- Add at least one visible secondary link “Order via Bitely” in the order band and footer area

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --run src/App.test.jsx
```

- [ ] **Step 5: Commit**

```bash
git add src/mealPrepData.js src/MealPrepPage.jsx src/App.test.jsx
git commit -m "feat: soft-launch meal prep CTAs to Hydrogen with Bitely fallback"
```

---

### Task 9: Deploy Oxygen + attach subdomain

**Files:**
- None required in git beyond env docs
- Modify: `apps/mealprep-hydrogen/.env.example` (no secrets)

- [ ] **Step 1: Document env example**

```bash
# apps/mealprep-hydrogen/.env.example
SESSION_SECRET=
PUBLIC_STORE_DOMAIN=
PUBLIC_STOREFRONT_ID=
PUBLIC_STOREFRONT_API_TOKEN=
PRIVATE_STOREFRONT_API_TOKEN=
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=
PUBLIC_CUSTOMER_ACCOUNT_API_URL=
PUBLIC_MARKETING_ORIGIN=https://vievegan.com.au
PUBLIC_BITELY_URL=https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz
```

- [ ] **Step 2: Deploy preview**

```bash
cd apps/mealprep-hydrogen
npx shopify hydrogen deploy
```

Select **Preview**. Open the returned URL; smoke-test collection + cart.

- [ ] **Step 3: Deploy production + custom domain**

In Shopify Admin → Hydrogen storefront → Storefront settings / Domains:

- Add `mealprep.<brand-domain>`
- Point DNS CNAME as Shopify instructs
- Deploy to **Production**

```bash
npx shopify hydrogen deploy
```

- [ ] **Step 4: Point marketing constant at production URL**

Confirm Task 8 URL matches the live domain; commit if changed.

- [ ] **Step 5: Commit env example / docs only**

```bash
git add apps/mealprep-hydrogen/.env.example apps/mealprep-hydrogen/README.md
git commit -m "docs: document Hydrogen env and soft-launch deploy URL"
```

---

### Task 10: End-to-end acceptance checklist

- [ ] **Step 1: Run automated tests**

```bash
cd apps/mealprep-hydrogen && npm test
cd ../.. && npm test -- --run
```

Expected: all pass.

- [ ] **Step 2: Manual acceptance (staging/production)**

Checklist:

1. Marketing `/meal-prep` primary CTA opens Hydrogen
2. Bitely secondary link still works
3. All 9 products visible with correct images/prices
4. Add to cart / update qty works
5. Invalid postcode blocked
6. Valid postcode + day reaches Checkout
7. Test order paid
8. Admin order shows four attributes
9. Pickup path works without postcode
10. Visual parity: tokens, typography, chilli CTA, no default purple/Shopify-demo look

- [ ] **Step 3: Kitchen SOP note (share with merchant)**

Document for staff:

> On each Shopify order, open the order attributes / additional details and read `delivery_method`, `delivery_postcode`, `delivery_date`, `delivery_window` before packing.

- [ ] **Step 4: Final commit only if SOP/docs added**

```bash
git add docs/superpowers/plans/2026-09-10-meal-prep-shopify-hydrogen.md
git commit -m "docs: add meal-prep Shopify Hydrogen implementation plan"
```

---

## Appendix A — Shopify store setup (merchant / Admin)

Complete on the **existing** Vie Vegan Shopify store.

### A1. Markets, currency, tax

1. Admin → **Settings → Markets**
2. Ensure **Australia** is active; currency **AUD**
3. Settings → **Taxes** — configure GST for AU as required for your entity
4. Settings → **Shipping and delivery** — keep AU addresses enabled

### A2. Create the nine meal-prep products

Create one product per meal (Active, published to **Hydrogen** storefront channel + Online Store if desired):

| Product title | Notes for description |
| --- | --- |
| Creamy Coconut Curry Phở | 630g pack |
| Combination Phở | 630g pack |
| Lemongrass Tofu with Rice | 450g pack |
| Lemongrass Beef with Rice | 450g pack |
| Pepper Mushroom Chicken with Rice | 450g pack |
| Vegan Pulled Pork with Rice | 450g pack |
| Vegan Fried Rice (Cơm Chiên) | 500g pack |
| Saigon-Inspired Soup | 500g pack |
| Golden Soup (Curry) | 500g pack |

For each:

1. Upload the matching image from `public/images/mealprep-*.jpg`
2. Set price (AUD) and inventory tracking
3. Set SKU if the kitchen uses SKUs
4. Product type / tags: e.g. `meal-prep`, plus category tags (`pho`, `rice-bowl`, `soup`, `wok`)

### A3. Collection

1. Admin → **Products → Collections → Create collection**
2. Title: `Meal Prep`
3. Handle must be `meal-prep`
4. Condition: product tag `meal-prep` **or** manual add all nine
5. Publish collection to the **Hydrogen** sales channel

### A4. Local delivery zones

1. Settings → **Shipping and delivery**
2. Under **Local delivery**, enable for the Footscray location
3. Add postcode ranges / lists matching `ALLOWED_POSTCODES` in `app/lib/delivery.js`
4. Set delivery rate (flat fee recommended for v1) and any minimum order amount
5. Delivery instructions: mention refrigerated meal packs if needed

**Important:** Hydrogen allowlist and Shopify local-delivery postcodes must match. When the merchant finalises suburbs, update both places in the same change.

### A5. Pickup

1. Settings → **Shipping and delivery → Pickup**
2. Enable pickup at **206 Barkly St, Footscray VIC 3011** (confirm exact address in Admin)
3. Set pickup lead time to align with cut-off rules where possible

### A6. Payments

1. Settings → **Payments**
2. Enable Shopify Payments (or AU-supported provider)
3. Use **Bogus Gateway** / test mode for first E2E order if available on the plan; otherwise place a real low-value test and refund

### A7. Order attribute visibility

1. Place a test order through Hydrogen fulfilment
2. Confirm attributes appear on the order (Additional details / Notes attributes)
3. If staff can’t see them, pin an Admin checklist or use an order printer template that includes note attributes

### A8. Custom domain (after first Oxygen deploy)

1. Hydrogen storefront → **Storefront settings → Domains**
2. Add `mealprep.<your-domain>`
3. Create the DNS record Shopify shows
4. Wait for SSL; then update marketing `mealPrepShopifyUrl`

---

## Appendix B — Hydrogen storefront / “app” setup (developer)

Modern Hydrogen does **not** require a classic custom Public App for the customer purchase path. Linking creates a **Hydrogen storefront** (Storefront API tokens) via the Hydrogen channel.

### B1. Install Hydrogen channel

1. In Shopify Admin, open the **Hydrogen** channel (install from Shopify’s sales channels if missing)
2. Confirm plan supports Oxygen hosting for your store

Docs: [Getting started with Hydrogen and Oxygen](https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started)

### B2. Link local project

```bash
cd apps/mealprep-hydrogen
npx shopify hydrogen link
```

Prompts:

- Log in to Shopify
- Select the Vie Vegan shop
- **Create a new storefront** named e.g. `Vie Vegan Meal Prep`

Then:

```bash
npx shopify hydrogen env pull
```

Expected `.env` keys include:

- `PUBLIC_STOREFRONT_ID`
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PRIVATE_STOREFRONT_API_TOKEN`
- Customer Account API vars (unused in v1 UI, safe to leave)

**Never commit `.env`.**

### B3. Publish catalog to the Hydrogen storefront

1. Admin → Hydrogen storefront → ensure products/collection are available to that storefront channel
2. Run `npm run dev` and confirm real products load

### B4. Optional: Headless channel / custom app

Only needed if you later want Admin API automation (bulk sync, ops tools). **Skip for v1.**

If required later:

1. [dev.shopify.com/dashboard](https://dev.shopify.com/dashboard) → Create app
2. Install on the store
3. Request Admin API scopes deliberately; keep Storefront purchases on the Hydrogen storefront tokens

### B5. Deploy

```bash
npx shopify hydrogen deploy
```

- First: **Preview**
- After QA: **Production** + custom domain (Appendix A8)

### B6. GitHub continuous deployment (optional)

In Hydrogen storefront settings, connect GitHub so production deploys on merge. Alternatively use `SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN` in CI:

```bash
npx shopify hydrogen deploy --token "$SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN"
```

---

## Appendix C — Cutover (after soft launch stabilises)

1. Remove Bitely links from `MealPrepPage` / footer
2. Delete `mealPrepBitelyUrl` usage from tests
3. Keep Bitely URL in an internal ops doc only
4. Announce kitchen-only Shopify flow

---

## Self-review (plan author)

| Spec requirement | Task coverage |
| --- | --- |
| Hydrogen on Oxygen subdomain | Tasks 1, 9, Appendix B |
| Local delivery + pickup | Task 7, Appendix A4–A5 |
| Scheduled day + cut-off | Tasks 2, 7 |
| Cart attributes → Admin order | Task 7 |
| Soft launch Bitely fallback | Tasks 3, 8, Appendix C |
| UI matches marketing site | Task 3 (+ visual checks in 10) |
| Store + storefront setup instructions | Appendices A–B |
| No AU-wide shipping / capacity / extensions | Honoured (non-goals) |

No TBD placeholders remain for engineer action; postcode list and exact cut-off defaults are seeded and must be confirmed with the merchant during Appendix A (explicit step, not an open design hole).
