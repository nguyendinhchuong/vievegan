export const CART_ATTRIBUTE_KEYS = {
  method: 'delivery_method',
  postcode: 'delivery_postcode',
  date: 'delivery_date',
  window: 'delivery_window',
}

/** @type {ReadonlySet<string>} */
export const ALLOWED_POSTCODES = new Set([
  // Seed list — replace with merchant-confirmed Footscray local zones during Appendix A
  '3011', // Footscray
  '3012', // West Footscray / Kingsville area (confirm)
  '3013', // Yarraville (confirm)
  '3015', // Seddon / Newport fringe (confirm)
  '3016', // Williamstown fringe (confirm)
  '3019', // Braybrook (confirm)
  '3020', // Sunshine fringe (confirm)
  '3031', // Kensington / Flemington fringe (confirm)
  '3032', // Ascot Vale fringe (confirm)
])

export const DELIVERY_CONFIG = {
  timeZone: 'Australia/Melbourne',
  /** 0=Sun … 6=Sat — default Wed + Fri */
  weekdays: [3, 5],
  cutOffHour: 12,
  cutOffMinute: 0,
  /** Minimum whole calendar days ahead after cut-off logic */
  minLeadDays: 1,
  windowLabel: '16:00-20:00',
  maxOptions: 6,
}

export const isPostcodeAllowed = (postcode) => {
  const normalized = String(postcode ?? '').trim()
  return ALLOWED_POSTCODES.has(normalized)
}

const melbourneParts = (date) => {
  const fmt = new Intl.DateTimeFormat('en-AU', {
    timeZone: DELIVERY_CONFIG.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  })
  return Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]))
}

const toIsoDateInMelbourne = (date) => {
  const p = melbourneParts(date)
  return `${p.year}-${p.month}-${p.day}`
}

const weekdayNumberMelbourne = (date) => {
  const map = {Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6}
  return map[melbourneParts(date).weekday]
}

const isBeforeCutOffMelbourne = (date) => {
  const p = melbourneParts(date)
  const minutes = Number(p.hour) * 60 + Number(p.minute)
  const cut = DELIVERY_CONFIG.cutOffHour * 60 + DELIVERY_CONFIG.cutOffMinute
  return minutes < cut
}

/** Parse YYYY-MM-DD as a Melbourne calendar day index (UTC noon anchor). */
const isoToDayIndex = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86400000
}

const addCalendarDaysToIso = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + days))
  const yyyy = next.getUTCFullYear()
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(next.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * @param {Date} now
 * @param {{count?: number}} [opts]
 * @returns {string[]} ISO dates YYYY-MM-DD in Melbourne
 */
export const getNextDeliveryDates = (now = new Date(), opts = {}) => {
  const count = opts.count ?? DELIVERY_CONFIG.maxOptions
  const results = []
  const todayIso = toIsoDateInMelbourne(now)
  const beforeCutOff = isBeforeCutOffMelbourne(now)

  for (let offset = 0; offset < 60 && results.length < count; offset += 1) {
    const iso = addCalendarDaysToIso(todayIso, offset)
    // Noon UTC on that calendar date is safely inside the Melbourne civil day
    const probe = new Date(`${iso}T12:00:00.000Z`)
    const weekday = weekdayNumberMelbourne(probe)
    if (!DELIVERY_CONFIG.weekdays.includes(weekday)) continue

    const leadDays = isoToDayIndex(iso) - isoToDayIndex(todayIso)
    if (leadDays <= 0) continue // same-day never allowed in v1

    let ok = false
    if (leadDays > DELIVERY_CONFIG.minLeadDays) {
      ok = true
    } else if (leadDays === DELIVERY_CONFIG.minLeadDays) {
      ok = beforeCutOff
    }

    if (ok) results.push(iso)
  }

  return results
}

export const buildCartAttributes = ({method, postcode, date, window}) => {
  const attrs = [
    {key: CART_ATTRIBUTE_KEYS.method, value: method},
    {key: CART_ATTRIBUTE_KEYS.date, value: date},
    {key: CART_ATTRIBUTE_KEYS.window, value: window ?? DELIVERY_CONFIG.windowLabel},
  ]
  if (method === 'delivery' && postcode) {
    attrs.splice(1, 0, {
      key: CART_ATTRIBUTE_KEYS.postcode,
      value: String(postcode).trim(),
    })
  }
  return attrs
}
