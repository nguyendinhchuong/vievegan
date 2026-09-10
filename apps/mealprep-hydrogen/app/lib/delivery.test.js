import {describe, expect, it} from 'vitest'
import {
  CART_ATTRIBUTE_KEYS,
  isPostcodeAllowed,
  getNextDeliveryDates,
  buildCartAttributes,
} from './delivery'

describe('isPostcodeAllowed', () => {
  it('allows configured Footscray-area postcodes', () => {
    expect(isPostcodeAllowed('3011')).toBe(true)
    expect(isPostcodeAllowed('3012')).toBe(true)
  })

  it('rejects outside zones and junk input', () => {
    expect(isPostcodeAllowed('2000')).toBe(false)
    expect(isPostcodeAllowed('')).toBe(false)
    expect(isPostcodeAllowed('abc')).toBe(false)
  })
})

describe('getNextDeliveryDates', () => {
  it('skips a Wednesday that is past the Melbourne cut-off', () => {
    // Tuesday 12:30 Australia/Melbourne → Wednesday already cut off if cutOffHour=12 and minLeadDays=1
    // 2026-09-08T02:30:00.000Z == Tue 12:30 AEST (UTC+10 in September)
    const now = new Date('2026-09-08T02:30:00.000Z')
    const dates = getNextDeliveryDates(now, {count: 4})
    expect(dates[0]).toBe('2026-09-11') // Friday
    expect(dates).toContain('2026-09-16') // next Wednesday
  })
})

describe('buildCartAttributes', () => {
  it('builds delivery attributes', () => {
    const attrs = buildCartAttributes({
      method: 'delivery',
      postcode: '3011',
      date: '2026-09-11',
      window: '16:00-20:00',
    })
    expect(attrs).toEqual([
      {key: CART_ATTRIBUTE_KEYS.method, value: 'delivery'},
      {key: CART_ATTRIBUTE_KEYS.postcode, value: '3011'},
      {key: CART_ATTRIBUTE_KEYS.date, value: '2026-09-11'},
      {key: CART_ATTRIBUTE_KEYS.window, value: '16:00-20:00'},
    ])
  })

  it('omits postcode for pickup', () => {
    const attrs = buildCartAttributes({
      method: 'pickup',
      date: '2026-09-11',
      window: '16:00-20:00',
    })
    expect(attrs.find((a) => a.key === CART_ATTRIBUTE_KEYS.postcode)).toBeUndefined()
    expect(attrs.find((a) => a.key === CART_ATTRIBUTE_KEYS.method)?.value).toBe('pickup')
  })
})
