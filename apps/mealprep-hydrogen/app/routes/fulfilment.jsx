import {redirect} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Vie Vegan | Delivery options'}];
};

/**
 * Gate checkout: empty carts go back to meal prep.
 * Full delivery form lands in Task 7.
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {cart} = context;
  const cartData = await cart.get();

  if (!cartData?.totalQuantity) {
    return redirect('/collections/meal-prep');
  }

  return {cart: cartData};
}

export default function Fulfilment() {
  return (
    <div className="fulfilment">
      <h1>Delivery options</h1>
      <p>
        Choose how and when your meal prep arrives. Scheduling comes next —
        this step will collect your delivery details before checkout.
      </p>
    </div>
  );
}

/** @typedef {import('./+types/fulfilment').Route} Route */
