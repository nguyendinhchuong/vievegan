# Vie Vegan Meal Prep (Hydrogen)

Soft-launch storefront for meal prep ordering on Shopify Hydrogen / Oxygen.
Marketing site stays on Vite; Bitely remains a secondary fallback.

## Dev

```bash
npm install
npx shopify hydrogen link   # once — needs Shopify merchant login (Appendix B)
npx shopify hydrogen env pull
npm run dev
```

Copy `.env.example` → `.env` only if you need placeholder keys; prefer `env pull` after linking so Storefront API tokens are real. **Never commit `.env`.**

## Deploy (Oxygen)

See plan **Appendix B5** (`docs/superpowers/plans/2026-09-10-meal-prep-shopify-hydrogen.md`).

```bash
cd apps/mealprep-hydrogen
npx shopify hydrogen deploy
```

1. First deploy: choose **Preview**, open the returned URL, smoke-test collection + cart.
2. After QA: deploy **Production**.

Non-interactive CI option (token from Hydrogen storefront settings):

```bash
npx shopify hydrogen deploy --token "$SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN"
```

## Custom domain (soft-launch URL)

See plan **Appendix A8**.

In Shopify Admin → Hydrogen storefront → **Storefront settings → Domains**:

1. Add `mealprep.<brand-domain>` (e.g. `mealprep.vievegan.com.au`)
2. Create the DNS CNAME Shopify shows
3. Wait for SSL
4. Point marketing `mealPrepShopifyUrl` in `src/mealPrepData.js` at the live URL

Until the merchant completes link + deploy + DNS, there is no production Oxygen URL to commit.

## Soft launch

Primary storefront URL is set in marketing `src/mealPrepData.js` as `mealPrepShopifyUrl`.
Bitely fallback URL is `mealPrepBitelyUrl` / `PUBLIC_BITELY_URL`.

## Storefront setup checklist

Full merchant + developer steps: plan **Appendix A** (catalog, delivery, payments) and **Appendix B** (Hydrogen channel, link, env pull, publish catalog, deploy).

## Kitchen SOP

On each Shopify order, open the order attributes / additional details and read `delivery_method`, `delivery_postcode`, `delivery_date`, and `delivery_window` before packing.
