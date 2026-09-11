import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const read = (relativePath) =>
  readFileSync(join(root, relativePath), 'utf8');

describe('cart slider UI contract', () => {
  it('CartSummary has delivery CTA and no discount/gift-card inputs', () => {
    const src = read('components/CartSummary.jsx');
    expect(src).toMatch(/Continue to delivery options/);
    expect(src).not.toMatch(/Discount code/);
    expect(src).not.toMatch(/Gift card code/);
    expect(src).not.toMatch(/CartDiscounts/);
    expect(src).not.toMatch(/CartGiftCard/);
  });

  it('CartLineItem uses a branded quantity stepper', () => {
    const src = read('components/CartLineItem.jsx');
    expect(src).toMatch(/cart-line-quantity__stepper/);
    expect(src).toMatch(/cart-line-quantity__btn/);
    expect(src).toMatch(/cart-line-quantity__value/);
    expect(src).toMatch(/cart-line-quantity__remove/);
  });

  it('cart CSS kills CTA underline on hover and pads the summary', () => {
    const css = read('styles/app.css');
    expect(css).toMatch(
      /\.cart-fulfilment-cta:hover[\s\S]*?text-decoration:\s*none/,
    );
    expect(css).toMatch(
      /\.cart-summary-aside\s*\{[\s\S]*?padding-bottom:/,
    );
    expect(css).toMatch(/cart-line-quantity__stepper/);
  });
});
