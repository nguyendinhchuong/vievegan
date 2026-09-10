# Meal Prep Shopify Hydrogen — Acceptance (Task 10)

**Date:** 2026-09-11  
**Branch:** `feature/meal-prep-shopify-hydrogen`  
**Worktree:** `.worktrees/meal-prep-shopify-hydrogen`  
**HEAD at check:** `faa6240` (+ this docs commit)

## Automated tests

| Suite | Result |
| --- | --- |
| `apps/mealprep-hydrogen` (`npm test`) | **Pass** — 5/5 (delivery helpers) |
| Marketing root (`npm test -- --run`) | **Pass** — 7/7 |

## Manual / evidence checklist

| # | Criterion | Status | Notes |
| --- | --- | --- | --- |
| 1 | Marketing `/meal-prep` primary CTA → Hydrogen | **Pass** | `mealPrepShopifyUrl` = `https://mealprep.vievegan.com.au`; covered by `App.test.jsx` |
| 2 | Bitely secondary still works | **Pass** | “Order via Bitely” in order band + footer → Bitely URL |
| 3 | All 9 meal-prep products visible | **Blocked** | Needs Appendix A catalog + `hydrogen link` (Mock.shop has no `meal-prep` collection; `/` 302 → 404 on Mock.shop) |
| 4 | Add to cart / update qty | **Pass** | Task 5 Mock.shop smoke: Slides + Sweatpants, cart 0→1→2 |
| 5 | Invalid postcode blocked | **Pass** | Task 7: delivery + `2000` returns Footscray/pickup error |
| 6 | Valid postcode + day → Checkout | **Pass** | Task 7: `3011` + valid date → Mock.shop checkout URL; cart attributes written |
| 7 | Test order paid | **Blocked** | Needs real payments / linked store (Appendix A6) |
| 8 | Admin shows delivery attributes | **Blocked** | Needs linked store Admin; attributes verified on cart via Storefront in Task 7 |
| 9 | Pickup path works without postcode | **Pass** (code) | Action accepts `pickup` without postcode allowlist; `buildCartAttributes` omits postcode |
| 10 | Visual parity (tokens / type / chilli) | **Pass** | `tokens.css` + SiteHeader/SiteFooter + Fraunces/DM Sans + CSP allowlist |

## Remaining merchant blockers

1. Complete **Appendix A** (9 products, `meal-prep` collection, local delivery + pickup, payments).
2. Complete **Appendix B** (`hydrogen link`, `env pull`, publish catalog to Hydrogen channel).
3. Complete **Task 9 deploy**: `hydrogen deploy` (Preview → Production) + domain `mealprep.<brand>` (Appendix A8).
4. Re-run checklist items 3, 7, 8 against the live storefront.

## Kitchen SOP

Documented in `apps/mealprep-hydrogen/README.md`: read order attributes `delivery_method`, `delivery_postcode`, `delivery_date`, `delivery_window` before packing.
