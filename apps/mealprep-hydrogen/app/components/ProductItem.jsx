import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const description =
    'description' in product && typeof product.description === 'string'
      ? product.description.trim()
      : '';
  const isUnavailable =
    ('availableForSale' in product && product.availableForSale === false) ||
    ('selectedOrFirstAvailableVariant' in product &&
      product.selectedOrFirstAvailableVariant?.availableForSale === false);

  return (
    <Link
      className={`product-item${isUnavailable ? ' product-item--unavailable' : ''}`}
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      aria-label={
        isUnavailable
          ? `${product.title} (unavailable)`
          : `View ${product.title}`
      }
    >
      <div className="product-item__media">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="4/5"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="product-item__image"
          />
        ) : (
          <div className="product-item__media-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="product-item__body">
        <h3 className="product-item__title display">{product.title}</h3>
        {description ? (
          <p className="product-item__description">{description}</p>
        ) : null}
        <div className="product-item__meta">
          <p className="product-item__price">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
          {isUnavailable ? (
            <span className="product-item__status">Unavailable</span>
          ) : (
            <span className="product-item__cta">View meal</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
