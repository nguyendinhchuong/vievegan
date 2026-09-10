# Meal Prep Shopify Hydrogen — Task 10 acceptance

**Date:** 2026-09-10  
**Branch:** `feature/meal-prep-shopify-hydrogen`  
**Worktree:** `.worktrees/meal-prep-shopify-hydrogen`  
**Scope:** As far as possible without a linked Shopify store / Oxygen deploy  
**Status:** `DONE_WITH_CONCERNS`

## Automated tests (fresh run)

| Suite | Command | Result |
| --- | --- | --- |
| Hydrogen | `cd apps/mealprep-hydrogen && npm test` | **Pass** — 1 file, 5/5 (delivery helpers) |
| Marketing (root) | `cd ../.. && npm test -- --run` | **Pass** — 2 files, 7/7 |

## Manual checklist

| # | Item | Result | Evidence / reason |
| --- | --- | --- | --- |
| 1 | Marketing `/meal-prep` primary CTA opens Hydrogen URL | **Pass** | `mealPrepShopifyUrl` = `https://mealprep.vievegan.com.au`; `App.test.jsx` asserts primary CTAs |
| 2 | Bitely secondary works | **Pass** | “Order via Bitely” → Bitely URL in order band + footer; covered by `App.test.jsx` |
| 3 | All 9 products visible (store catalog) | **Blocked** | Needs Appendix A catalog + `hydrogen link` (Mock.shop has no `meal-prep` collection). Marketing page still shows 9 teasers |
| 4 | Add to cart / qty | **Pass** | Task 5 Mock.shop smoke still valid (Slides + Sweatpants, cart 0→1→2); cart/PDP code present |
| 5 | Invalid postcode blocked | **Pass** | Task 7 + `delivery.test.js`; fulfilment action rejects outside zones (e.g. `2000`) with pickup hint |
| 6 | Valid postcode + day → Checkout | **Pass** | Task 7 Mock.shop demostore: `3011` + valid date → checkout URL; cart attributes written |
| 7 | Test order paid | **Blocked** | No real payments / linked merchant store (Appendix A6) |
| 8 | Admin attributes visible | **Blocked** | No Shopify Admin / linked store; attribute keys verified in code + cart update path |
| 9 | Pickup path | **Pass** | Fulfilment UI pickup radio; action accepts pickup without postcode allowlist; `buildCartAttributes` omits postcode (unit-tested) |
| 10 | Visual parity tokens | **Pass** | `tokens.css` (ink/paper/chilli/leaf/Fraunces/DM Sans) + SiteHeader/SiteFooter chrome |

## Kitchen SOP

Documented in `apps/mealprep-hydrogen/README.md`:

> On each Shopify order, open order attributes and read `delivery_method`, `delivery_postcode`, `delivery_date`, `delivery_window` before packing.

## Remaining merchant blockers

1. Appendix A — 9 products, `meal-prep` collection, local delivery + pickup, payments  
2. Appendix B — `shopify hydrogen link`, `env pull`, publish catalog to Hydrogen channel  
3. Oxygen deploy (Preview → Production) + DNS for `mealprep.vievegan.com.au` (Appendix A8 / Task 9)  
4. Re-run checklist items 3, 7, 8 against the live storefront (paid test order + Admin attributes)  
5. Confirm postcode allow-list with kitchen before soft launch  
