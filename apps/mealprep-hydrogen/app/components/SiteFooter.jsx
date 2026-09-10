const DEFAULT_MARKETING_ORIGIN = 'https://vievegan.com.au';
const DEFAULT_BITELY_URL =
  'https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz';

/**
 * @param {SiteFooterProps}
 */
export function SiteFooter({
  marketingOrigin = DEFAULT_MARKETING_ORIGIN,
  bitelyUrl = DEFAULT_BITELY_URL,
}) {
  const origin = marketingOrigin.replace(/\/$/, '');

  return (
    <footer className="site-footer" data-site-chrome="footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand display">Vie Vegan</p>
        <p className="site-footer__tagline">
          Plant-based kitchen. Meal prep for the week ahead.
        </p>
        <nav className="site-footer__links" aria-label="Footer">
          <a
            className="site-footer__link"
            href={bitelyUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Order via Bitely
          </a>
          <a className="site-footer__link" href={origin}>
            Back to Vie Vegan
          </a>
        </nav>
      </div>
    </footer>
  );
}

/**
 * @typedef {Object} SiteFooterProps
 * @property {string} [marketingOrigin]
 * @property {string} [bitelyUrl]
 */
