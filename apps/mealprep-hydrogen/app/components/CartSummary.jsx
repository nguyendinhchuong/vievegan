import {Money} from '@shopify/hydrogen';
import {useId} from 'react';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const summaryId = useId();

  return (
    <div aria-labelledby={summaryId} className={className}>
      <h4 id={summaryId}>Totals</h4>
      <dl role="group" className="cart-subtotal">
        <dt>Subtotal</dt>
        <dd>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <CartCheckoutActions />
    </div>
  );
}

/**
 * Cart summary only renders when the cart has items, so this CTA always shows.
 */
function CartCheckoutActions() {
  const {close} = useAside();

  return (
    <div className="cart-checkout-actions">
      <Link
        to="/fulfilment"
        className="cart-fulfilment-cta"
        onClick={close}
        aria-label="Continue to delivery options"
      >
        Continue to delivery options
      </Link>
    </div>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
