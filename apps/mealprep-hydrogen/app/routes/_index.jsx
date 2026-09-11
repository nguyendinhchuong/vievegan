import {redirect} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Vie Vegan Meal Prep'}];
};

/**
 * Meal Prep range is the storefront home.
 * @param {Route.LoaderArgs} _args
 */
export const loader = () => redirect('/collections/meal-prep');

/** @typedef {import('./+types/_index').Route} Route */
