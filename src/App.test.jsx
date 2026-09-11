import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('Vie Vegan homepage', () => {
  beforeEach(() => window.history.pushState({}, '', '/'))

  it('makes the restaurant identity and ordering actions immediately clear', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /street food, made soulful/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /order pickup/i })).toHaveAttribute(
      'href',
      'https://www.meandu.app/vievegan/pickup/main-menu-new',
    )
    expect(screen.getByRole('link', { name: /order delivery/i })).toHaveAttribute(
      'href',
      'https://www.meandu.app/vievegan/delivery',
    )
  })

  it('shows food highlights and practical visit information', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /house favourites/i })).toBeInTheDocument()
    expect(screen.getByText(/creamy coconut curry phở/i)).toBeInTheDocument()
    expect(screen.getAllByText(/206 Barkly St/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/open every day/i).length).toBeGreaterThan(0)
  })

  it('opens and closes the mobile navigation accessibly', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggle = screen.getByRole('button', { name: /open menu/i })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: /site menu/i })).toBeInTheDocument()

    const menu = screen.getByRole('dialog', { name: /site menu/i })
    await user.click(screen.getByRole('button', { name: /close menu/i }))
    await waitForElementToBeRemoved(menu)
  })

  it('renders the complete menu route with category navigation and ordering', () => {
    window.history.pushState({}, '', '/menu')
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /vietnamese favourites, made plant-based/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /menu categories/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /vegan rice bowls/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /vegan phở series/i })).toBeInTheDocument()
    expect(screen.getByText(/roasted pulled pork & cracklings rice bowl/i)).toBeInTheDocument()
    expect(screen.getAllByText('$15.90').length).toBeGreaterThan(0)
    const pickupLinks = screen.getAllByRole('link', { name: /order pickup/i })
    expect(pickupLinks.length).toBeGreaterThan(0)
    pickupLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', 'https://www.meandu.app/vievegan/pickup/main-menu-new')
    })
  })

  it('renders the complete meal prep route with products and soft-launch ordering', () => {
    window.history.pushState({}, '', '/meal-prep')
    render(<App />)

    expect(screen.getByRole('heading', {
      level: 1,
      name: /your week of bold vietnamese, sorted/i,
    })).toBeInTheDocument()

    const range = screen.getByRole('region', { name: /meal prep range/i })
    expect(within(range).getAllByRole('article')).toHaveLength(9)

    const primary = screen.getAllByRole('link', { name: /order meal prep|order now/i })
    expect(primary.length).toBeGreaterThan(0)
    primary.forEach((link) => {
      expect(link).toHaveAttribute('href', 'http://localhost:3000')
    })

    const fallback = screen.getAllByRole('link', { name: /order via bitely/i })
    expect(fallback.length).toBeGreaterThan(0)
    fallback.forEach((link) => {
      expect(link).toHaveAttribute(
        'href',
        'https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz',
      )
    })
  })

  it('renders a playful recovery page for unknown routes', () => {
    window.history.pushState({}, '', '/this-bowl-is-empty')
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /phở-oh! this page is missing/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /empty phở bowl with noodles shaped like 404/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /see the menu/i })).toHaveAttribute('href', '/menu')
  })
})
