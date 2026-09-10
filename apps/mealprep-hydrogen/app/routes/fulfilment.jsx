import {useState} from 'react';
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import {
  DELIVERY_CONFIG,
  buildCartAttributes,
  getNextDeliveryDates,
  isPostcodeAllowed,
} from '~/lib/delivery';

const POSTCODE_ERROR_ID = 'postcode-error';
const FORM_ERROR_ID = 'fulfilment-form-error';
const METHOD_HINT =
  'Sorry — we only deliver to local Footscray-area postcodes. Pick up in-store instead?';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Vie Vegan | Delivery options'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {cart} = context;
  const cartData = await cart.get();

  if (!cartData?.totalQuantity) {
    return redirect('/collections/meal-prep');
  }

  const deliveryDates = getNextDeliveryDates(new Date());

  return {
    cart: cartData,
    deliveryDates,
    windowLabel: DELIVERY_CONFIG.windowLabel,
  };
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const form = await request.formData();
  const method = String(form.get('method') || '');
  const postcode = String(form.get('postcode') || '').trim();
  const date = String(form.get('date') || '');
  const window = DELIVERY_CONFIG.windowLabel;

  if (method !== 'delivery' && method !== 'pickup') {
    return {ok: false, error: 'Choose delivery or pickup.'};
  }

  if (method === 'delivery' && !isPostcodeAllowed(postcode)) {
    return {ok: false, error: METHOD_HINT};
  }

  const allowedDates = getNextDeliveryDates(new Date());
  if (!allowedDates.includes(date)) {
    return {
      ok: false,
      error: 'That delivery day is no longer available. Pick another day.',
    };
  }

  const attributes = buildCartAttributes({method, postcode, date, window});

  try {
    const result = await context.cart.updateAttributes(attributes);
    const checkoutUrl = result?.cart?.checkoutUrl;

    if (result?.errors?.length) {
      return {
        ok: false,
        error: result.errors[0]?.message || 'Could not save delivery details.',
      };
    }

    if (!checkoutUrl) {
      return {ok: false, error: 'Checkout is unavailable. Try again.'};
    }

    return redirect(checkoutUrl);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Could not save delivery details. Try again.',
    };
  }
}

/**
 * @param {string} isoDate
 */
const formatDeliveryDateLabel = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: DELIVERY_CONFIG.timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(probe);
};

export default function Fulfilment() {
  /** @type {LoaderReturnData} */
  const {deliveryDates, windowLabel} = useLoaderData();
  /** @type {ActionReturnData} */
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  const [method, setMethod] = useState('delivery');
  const [postcode, setPostcode] = useState('');

  const showPostcodeHint =
    method === 'delivery' &&
    postcode.trim().length > 0 &&
    !isPostcodeAllowed(postcode);
  const serverError = actionData?.ok === false ? actionData.error : null;
  const showServerPostcodeError =
    method === 'delivery' && serverError === METHOD_HINT;
  const postcodeInvalid = showPostcodeHint || showServerPostcodeError;

  const handleMethodChange = (event) => {
    setMethod(event.currentTarget.value);
  };

  const handlePostcodeChange = (event) => {
    setPostcode(event.currentTarget.value);
  };

  return (
    <div className="fulfilment">
      <h1>Delivery options</h1>
      <p className="fulfilment-lede">
        Choose how and when your meal prep arrives, then continue to secure
        checkout.
      </p>

      <Form method="post" className="fulfilment-form" noValidate>
        <fieldset className="fulfilment-fieldset">
          <legend>Fulfilment method</legend>
          <div className="fulfilment-method-options" role="presentation">
            <label className="fulfilment-choice">
              <input
                type="radio"
                name="method"
                value="delivery"
                checked={method === 'delivery'}
                onChange={handleMethodChange}
              />
              <span>Delivery</span>
            </label>
            <label className="fulfilment-choice">
              <input
                type="radio"
                name="method"
                value="pickup"
                checked={method === 'pickup'}
                onChange={handleMethodChange}
              />
              <span>Pickup</span>
            </label>
          </div>
        </fieldset>

        {method === 'delivery' ? (
          <div className="fulfilment-field">
            <label htmlFor="postcode">Delivery postcode</label>
            <input
              id="postcode"
              name="postcode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={4}
              value={postcode}
              onChange={handlePostcodeChange}
              aria-invalid={postcodeInvalid ? 'true' : undefined}
              aria-describedby={
                postcodeInvalid ? POSTCODE_ERROR_ID : 'postcode-hint'
              }
              placeholder="e.g. 3011"
            />
            <p id="postcode-hint" className="fulfilment-hint">
              Local Footscray-area delivery only.
            </p>
            {postcodeInvalid ? (
              <p
                id={POSTCODE_ERROR_ID}
                className="fulfilment-error"
                role="alert"
              >
                {METHOD_HINT}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="fulfilment-field">
          <label htmlFor="date">Delivery day</label>
          <select
            id="date"
            name="date"
            required
            defaultValue={deliveryDates[0] ?? ''}
            disabled={!deliveryDates.length}
          >
            {!deliveryDates.length ? (
              <option value="">No delivery days available</option>
            ) : (
              deliveryDates.map((isoDate) => (
                <option key={isoDate} value={isoDate}>
                  {formatDeliveryDateLabel(isoDate)}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="fulfilment-field fulfilment-window">
          <span className="fulfilment-window-label" id="window-label">
            Delivery window
          </span>
          <p
            className="fulfilment-window-value"
            aria-labelledby="window-label"
          >
            {windowLabel}
          </p>
        </div>

        {serverError && serverError !== METHOD_HINT ? (
          <p id={FORM_ERROR_ID} className="fulfilment-error" role="alert">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          className="fulfilment-submit"
          disabled={isSubmitting || !deliveryDates.length}
          aria-describedby={
            serverError && serverError !== METHOD_HINT
              ? FORM_ERROR_ID
              : undefined
          }
        >
          {isSubmitting ? 'Saving…' : 'Proceed to checkout'}
        </button>
      </Form>
    </div>
  );
}

/** @typedef {import('./+types/fulfilment').Route} Route */
/** @typedef {Route.ComponentProps['loaderData']} LoaderReturnData */
/** @typedef {Awaited<ReturnType<typeof action>>} ActionReturnData */
