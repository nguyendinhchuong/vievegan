import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

const DEFAULT_MARKETING_ORIGIN = 'https://vievegan.com.au';

/**
 * @param {SiteHeaderProps}
 */
export function SiteHeader({cart, marketingOrigin = DEFAULT_MARKETING_ORIGIN}) {
  const origin = marketingOrigin.replace(/\/$/, '');

  return (
    <header className="site-header" data-site-chrome="header">
      <div className="site-header__inner">
        <a
          className="site-header__brand"
          href={origin}
          aria-label="Vie Vegan home"
        >
          <img
            src="/images/vievegan-logo.png"
            alt="Vie Vegan"
            className="site-header__logo"
            width={140}
            height={40}
          />
        </a>

        <nav className="site-header__nav" aria-label="Primary">
          <a className="site-header__link" href={`${origin}/menu`}>
            Menu
          </a>
          <NavLink
            className="site-header__link"
            prefetch="intent"
            to="/collections/meal-prep"
          >
            Meal prep
          </NavLink>
          <a className="site-header__link" href={`${origin}/#visit`}>
            Visit
          </a>
        </nav>

        <div className="site-header__actions">
          <SiteHeaderMobileToggle />
          <CartToggle cart={cart} />
        </div>
      </div>
    </header>
  );
}

/**
 * Mobile aside nav — same primary links as the desktop header.
 * @param {{marketingOrigin?: string}}
 */
export function SiteHeaderMobileNav({
  marketingOrigin = DEFAULT_MARKETING_ORIGIN,
}) {
  const {close} = useAside();
  const origin = marketingOrigin.replace(/\/$/, '');

  const handleClose = () => {
    close();
  };

  return (
    <nav className="site-header-mobile-nav" aria-label="Mobile menu">
      <a
        className="site-header__link"
        href={`${origin}/menu`}
        onClick={handleClose}
      >
        Menu
      </a>
      <NavLink
        className="site-header__link"
        end
        onClick={handleClose}
        prefetch="intent"
        to="/collections/meal-prep"
      >
        Meal prep
      </NavLink>
      <a
        className="site-header__link"
        href={`${origin}/#visit`}
        onClick={handleClose}
      >
        Visit
      </a>
      <a className="site-header__link" href={origin} onClick={handleClose}>
        Vie Vegan site
      </a>
    </nav>
  );
}

function SiteHeaderMobileToggle() {
  const {open} = useAside();

  const handleClick = () => {
    open('mobile');
  };

  return (
    <button
      type="button"
      className="site-header__menu-toggle reset"
      onClick={handleClick}
      aria-label="Open menu"
    >
      Menu
    </button>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  const handleClick = (event) => {
    event.preventDefault();
    open('cart');
    publish('cart_viewed', {
      cart,
      prevCart,
      shop,
      url: window.location.href || '',
    });
  };

  return (
    <a
      className="site-header__cart"
      href="/cart"
      onClick={handleClick}
      aria-label={`Cart, ${count} items`}
    >
      Cart
      <span className="site-header__cart-count" aria-hidden="true">
        {count}
      </span>
    </a>
  );
}

/**
 * @param {Pick<SiteHeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/**
 * @typedef {Object} SiteHeaderProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {string} [marketingOrigin]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
