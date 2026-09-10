# Meal Prep Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive `/meal-prep` page using Vie Vegan's current meal-prep content and the cinematic editorial system already used by the homepage and menu.

**Architecture:** Add a dedicated `MealPrepPage` route component and a small data module for the nine meals. Keep the page self-contained, reuse the established CSS tokens and interaction patterns, download official photography into `public/images`, and route every existing Meal Prep navigation link to the new page.

**Tech Stack:** React 19, Vite 7, Framer Motion, Lucide React, Vitest, Testing Library, Playwright.

---

## File Map

- Create `src/mealPrepData.js`: canonical product, proof-point, and process-step content.
- Create `src/MealPrepPage.jsx`: meal-prep header, hero, range, process, CTA, footer, and mobile order bar.
- Modify `src/App.jsx`: register `/meal-prep` and update homepage Meal Prep links.
- Modify `src/MenuPage.jsx`: point its Meal Prep navigation item to `/meal-prep`.
- Modify `src/styles.css`: responsive meal-prep layout, image parallax, and motion styling.
- Modify `src/App.test.jsx`: route, content, product count, and order-link coverage.
- Modify `tests/visual.spec.js`: desktop/mobile layout, image visibility, and overflow coverage.
- Add ten JPG files under `public/images`: one hero and nine official meal-prep product images.

### Task 1: Lock The Route Contract

**Files:**
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Add a failing route test**

```jsx
import { within } from '@testing-library/react'

it('renders the complete meal prep route with products and ordering', () => {
  window.history.pushState({}, '', '/meal-prep')
  render(<App />)

  expect(screen.getByRole('heading', {
    level: 1,
    name: /your week of bold vietnamese, sorted/i,
  })).toBeInTheDocument()

  const range = screen.getByRole('region', { name: /meal prep range/i })
  expect(within(range).getAllByRole('article')).toHaveLength(9)
  expect(within(range).getByRole('heading', { name: /creamy coconut curry phở/i })).toBeInTheDocument()
  expect(within(range).getByRole('heading', { name: /golden soup \(curry\)/i })).toBeInTheDocument()

  const orderLinks = screen.getAllByRole('link', { name: /order (meal prep|now)/i })
  expect(orderLinks.length).toBeGreaterThan(0)
  orderLinks.forEach((link) => {
    expect(link).toHaveAttribute(
      'href',
      'https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz',
    )
  })
})
```

- [ ] **Step 2: Run the test and verify the red state**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because `/meal-prep` currently renders `NotFoundPage`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add src/App.test.jsx
git commit -m "test: define meal prep page contract"
```

### Task 2: Add Official Meal-Prep Assets

**Files:**
- Create: `public/images/mealprep-hero-trays.jpg`
- Create: `public/images/mealprep-curry-pho.jpg`
- Create: `public/images/mealprep-combination-pho.jpg`
- Create: `public/images/mealprep-lemongrass-tofu.jpg`
- Create: `public/images/mealprep-lemongrass-beef.jpg`
- Create: `public/images/mealprep-pepper-mushroom-chicken.jpg`
- Create: `public/images/mealprep-pulled-pork.jpg`
- Create: `public/images/mealprep-fried-rice.jpg`
- Create: `public/images/mealprep-saigon-soup.jpg`
- Create: `public/images/mealprep-golden-soup.jpg`

- [ ] **Step 1: Download each source image into the local asset directory**

Run these commands from the repository root:

```bash
curl -L https://www.vievegan.com.au/assets/site/mealprep-hero-trays.jpg -o public/images/mealprep-hero-trays.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-curry-pho.jpg -o public/images/mealprep-curry-pho.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-combination-pho.jpg -o public/images/mealprep-combination-pho.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-lemongrass-tofu.jpg -o public/images/mealprep-lemongrass-tofu.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-lemongrass-beef.jpg -o public/images/mealprep-lemongrass-beef.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-pepper-mushroom-chicken.jpg -o public/images/mealprep-pepper-mushroom-chicken.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-pulled-pork.jpg -o public/images/mealprep-pulled-pork.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-fried-rice.jpg -o public/images/mealprep-fried-rice.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-saigon-soup.jpg -o public/images/mealprep-saigon-soup.jpg
curl -L https://www.vievegan.com.au/assets/site/mealprep-golden-soup.jpg -o public/images/mealprep-golden-soup.jpg
```

- [ ] **Step 2: Verify every file is a non-empty JPEG**

Run: `file public/images/mealprep-*.jpg`

Expected: ten JPEG image results and no HTML/error documents.

- [ ] **Step 3: Commit the images**

```bash
git add public/images/mealprep-*.jpg
git commit -m "assets: add meal prep photography"
```

### Task 3: Model The Source Content

**Files:**
- Create: `src/mealPrepData.js`

- [ ] **Step 1: Add the complete product and process data**

```js
export const mealPrepOrderUrl = 'https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz'

export const mealPrepProofs = [
  ['Made fresh', 'Cooked in our Footscray kitchen'],
  ['Generous packs', 'Single meals from 400g to 630g'],
  ['Heat & eat', 'Ready in minutes, no prep needed'],
  ['Plant-based, always', 'Clean ingredients, less mock meat'],
]

export const mealPrepProducts = [
  { tag: 'Signature', name: 'Creamy Coconut Curry Phở', description: 'Our signature rich curry broth with noodles, herbs, and greens. 630g pack.', image: '/images/mealprep-curry-pho.jpg' },
  { tag: 'Phở', name: 'Combination Phở', description: 'Deep house broth with a generous combination of plant-based toppings. 630g pack.', image: '/images/mealprep-combination-pho.jpg' },
  { tag: 'Rice bowl', name: 'Lemongrass Tofu with Rice', description: 'Signature lemongrass tofu over rice, clean and full of flavour. 450g pack.', image: '/images/mealprep-lemongrass-tofu.jpg' },
  { tag: 'Rice bowl', name: 'Lemongrass Beef with Rice', description: 'Bold lemongrass plant-based beef with rice, ready when you are. 450g pack.', image: '/images/mealprep-lemongrass-beef.jpg' },
  { tag: 'Rice bowl', name: 'Pepper Mushroom Chicken with Rice', description: 'Peppery mushroom and plant-based chicken over rice. 450g pack.', image: '/images/mealprep-pepper-mushroom-chicken.jpg' },
  { tag: 'Rice bowl', name: 'Vegan Pulled Pork with Rice', description: 'Roasted pulled pork-style jackfruit with cracklings and rice. 450g pack.', image: '/images/mealprep-pulled-pork.jpg' },
  { tag: 'Wok', name: 'Vegan Fried Rice (Cơm Chiên)', description: 'Basmati rice wok-fried with vegetables and plant-based toppings. 500g pack.', image: '/images/mealprep-fried-rice.jpg' },
  { tag: 'Soup', name: 'Saigon-Inspired Soup', description: 'A comforting broth with tofu and vegetables, Saigon style. 500g pack.', image: '/images/mealprep-saigon-soup.jpg' },
  { tag: 'Soup', name: 'Golden Soup (Curry)', description: 'A golden curry broth with tofu and vegetables. 500g pack.', image: '/images/mealprep-golden-soup.jpg' },
]

export const mealPrepSteps = [
  ['Pick your meals', 'Order online in a couple of minutes. Mix and match phở, rice bowls, and soups.'],
  ['We cook fresh', 'Every pack is made in our Footscray kitchen with real broths, herbs, and clean ingredients.'],
  ['Heat & eat', 'Delivered ready for the fridge or freezer. Dinner is minutes away all week.'],
]
```

- [ ] **Step 2: Commit the data module**

```bash
git add src/mealPrepData.js
git commit -m "feat: add meal prep content model"
```

### Task 4: Build The Page And Register The Route

**Files:**
- Create: `src/MealPrepPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/MenuPage.jsx`

- [ ] **Step 1: Create `MealPrepPage.jsx` with these component boundaries**

```jsx
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, Menu, ShoppingBag, X } from 'lucide-react'
import { mealPrepOrderUrl, mealPrepProducts, mealPrepProofs, mealPrepSteps } from './mealPrepData'

const ease = [0.22, 1, 0.36, 1]
const navLinks = [['Menu', '/menu'], ['Our story', '/#story'], ['Meal prep', '/meal-prep'], ['Visit', '/#visit']]

function MealPrepHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return <>
    <header className={`site-nav meal-prep-site-nav ${scrolled ? 'site-nav-scrolled' : ''}`}>
      <a className="brand" href="/" aria-label="Vie Vegan home"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /></a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navLinks.map(([label, href]) => <a key={href} href={href} aria-current={href === '/meal-prep' ? 'page' : undefined}>{label}</a>)}
      </nav>
      <div className="nav-actions">
        <a className="nav-order" href={mealPrepOrderUrl} target="_blank" rel="noreferrer">Order meal prep <ArrowRight size={16} aria-hidden="true" /></a>
        <button className="menu-toggle" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu aria-hidden="true" /></button>
      </div>
    </header>
    <AnimatePresence>{open ? <motion.div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mobile-menu-top"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /><button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X aria-hidden="true" /></button></div>
      <nav aria-label="Mobile navigation">{navLinks.map(([label, href], index) => <motion.a key={href} href={href} onClick={() => setOpen(false)} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .08 + index * .06 }}><span>0{index + 1}</span>{label}</motion.a>)}</nav>
      <MealPrepAction href={mealPrepOrderUrl}>Order meal prep</MealPrepAction>
    </motion.div> : null}</AnimatePresence>
  </>
}

function MealPrepAction({ href, children, secondary = false }) {
  const reduceMotion = useReducedMotion()
  return <motion.a className={`action-link ${secondary ? 'action-link-ghost' : 'action-link-primary'}`} href={href} target="_blank" rel="noreferrer" whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: .97 }}><span>{children}</span><ArrowRight size={18} aria-hidden="true" /></motion.a>
}

function MealPrepHero() {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])

  return <section className="meal-prep-hero" ref={ref}>
    <motion.div className="meal-prep-hero-media" style={reduceMotion ? undefined : { y: imageY }}><img src="/images/mealprep-hero-trays.jpg" alt="Vie Vegan meal prep trays packed and ready for the week" /></motion.div>
    <div className="meal-prep-hero-shade" />
    <motion.div className="meal-prep-hero-copy shell" style={reduceMotion ? undefined : { y: copyY }}>
      <motion.p className="eyebrow light" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease }}>Meal prep · Made in Footscray</motion.p>
      <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .08, ease }}>Your week of bold Vietnamese, <em>sorted.</em></motion.h1>
      <motion.p initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .18, ease }}>Ready-to-heat vegan meals cooked fresh in Footscray: phở, rice bowls, and soups with the same clean ingredients we serve on Barkly Street. Stock the fridge once, eat well all week.</motion.p>
      <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .26, ease }}><MealPrepAction href={mealPrepOrderUrl}>Order meal prep</MealPrepAction></motion.div>
    </motion.div>
    <a className="scroll-cue" href="#range"><span>Explore the range</span><ArrowDown size={17} aria-hidden="true" /></a>
  </section>
}

function MealPrepProofStrip() {
  return <section className="meal-prep-proof" aria-label="Meal prep highlights">{mealPrepProofs.map(([title, detail]) => <div key={title}><strong>{title}</strong><span>{detail}</span></div>)}</section>
}

function MealPrepProduct({ product, index }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return <motion.article className="meal-prep-product" ref={ref} initial={reduceMotion ? false : { opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .14 }} transition={{ duration: .75, delay: index % 3 * .05, ease }}>
    <div className="meal-prep-product-media"><motion.img src={product.image} alt={`Vie Vegan ${product.name} meal prep pack`} loading={index < 3 ? 'eager' : 'lazy'} style={reduceMotion ? undefined : { y }} /><span className="meal-prep-product-index">0{index + 1}</span></div>
    <div className="meal-prep-product-copy"><span className="meal-prep-tag">{product.tag}</span><h3>{product.name}</h3><p>{product.description}</p></div>
  </motion.article>
}

function MealPrepRange() {
  return <section className="meal-prep-range section" id="range" aria-label="Meal prep range"><div className="shell">
    <div className="meal-prep-range-heading"><div><p className="eyebrow">The range</p><h2>Restaurant favourites, <em>packed for your fridge.</em></h2></div><p>The same dishes people line up for on Barkly Street, portioned as ready meals. Order online and mix and match your week.</p></div>
    <div className="meal-prep-grid">{mealPrepProducts.map((product, index) => <MealPrepProduct product={product} index={index} key={product.name} />)}</div>
    <p className="meal-prep-range-note">See the full range and current prices when you order online.</p>
  </div></section>
}

function MealPrepProcess() {
  const reduceMotion = useReducedMotion()
  return <section className="meal-prep-process section" aria-labelledby="meal-prep-process-title"><div className="shell"><p className="eyebrow light">How it works</p><h2 id="meal-prep-process-title">Three steps to a <em>stocked fridge.</em></h2><div className="meal-prep-steps">{mealPrepSteps.map(([title, detail], index) => <motion.article className="meal-prep-step" key={title} initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .7, delay: index * .08, ease }}><span>0{index + 1}</span><h3>{title}</h3><p>{detail}</p></motion.article>)}</div></div></section>
}

function MealPrepOrderBand() {
  return <section className="meal-prep-order-band" aria-label="Order meal prep"><div className="shell"><div><p className="eyebrow light">Ready to stock the fridge?</p><h2>Fresh meals.<br /><em>Week sorted.</em></h2><p>Order Vie Vegan meal prep online, cooked fresh in Footscray.</p></div><MealPrepAction href={mealPrepOrderUrl}>Order now</MealPrepAction></div></section>
}

function MealPrepFooter() {
  return <footer className="footer menu-footer"><div className="shell footer-grid"><div className="footer-brand"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /><p>Eat kind. Eat bold.<br />Eat Vie Vegan.</p></div><div><span className="footer-label">Visit</span><p>206 Barkly St<br />Footscray VIC 3011</p></div><div><span className="footer-label">Contact</span><a href="mailto:info@vievegan.com.au">info@vievegan.com.au</a></div></div><div className="shell footer-bottom"><span>© 2026 Vie Vegan</span><a href="/">Back to home</a></div></footer>
}

export default function MealPrepPage() {
  useEffect(() => {
    document.title = 'Vegan Meal Prep Melbourne | Vie Vegan'
    return () => { document.title = 'Vie Vegan | Plant-based Vietnamese in Footscray' }
  }, [])

  return <div className="meal-prep-page"><MealPrepHeader /><main><MealPrepHero /><MealPrepProofStrip /><MealPrepRange /><MealPrepProcess /><MealPrepOrderBand /></main><MealPrepFooter /><div className="mobile-order-bar meal-prep-mobile-order"><a href={mealPrepOrderUrl} target="_blank" rel="noreferrer"><ShoppingBag size={18} aria-hidden="true" />Order meal prep</a></div></div>
}
```

Do not export internal page components and do not add a routing dependency.

- [ ] **Step 2: Register the pathname before the 404 fallback**

```jsx
import MealPrepPage from './MealPrepPage'

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  if (pathname === '/menu') return <MenuPage />
  if (pathname === '/meal-prep') return <MealPrepPage />
  if (pathname !== '/') return <NotFoundPage />
  return <><Navigation /><main><Hero /><ProofTicker /><Favourites /><Story /><Services /><Visit /></main><Footer /><MobileOrderBar /></>
}
```

- [ ] **Step 3: Update internal Meal Prep links**

In both `src/App.jsx` and `src/MenuPage.jsx`, replace the navigation tuple `['Meal prep', '/#services']` with `['Meal prep', '/meal-prep']`. In the homepage service panel, change the internal “Feast all week” destination from the external order URL to `/meal-prep`; keep the final order action external.

- [ ] **Step 4: Run the route test and verify green**

Run: `npm test -- --run src/App.test.jsx`

Expected: all route and homepage tests pass.

- [ ] **Step 5: Commit the route and page component**

```bash
git add src/MealPrepPage.jsx src/App.jsx src/MenuPage.jsx src/App.test.jsx
git commit -m "feat: add meal prep page"
```

### Task 5: Apply The Editorial Visual System

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Add the desktop layout**

Append a `/* Meal prep page */` section using the existing tokens. Implement these concrete rules:

```css
.meal-prep-page { background: var(--paper); }
.meal-prep-hero { position: relative; min-height: 88svh; height: 820px; max-height: 940px; display: flex; align-items: flex-end; overflow: hidden; color: #fff; background: var(--ink); }
.meal-prep-hero-media { position: absolute; inset: -8% 0; }
.meal-prep-hero-media img { width: 100%; height: 116%; object-fit: cover; object-position: center; }
.meal-prep-hero-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(12,13,10,.86), rgba(12,13,10,.34) 62%, rgba(12,13,10,.12)); }
.meal-prep-hero-copy { position: relative; z-index: 2; padding-bottom: clamp(80px, 10vh, 112px); }
.meal-prep-hero h1 { max-width: 990px; margin: 0; font-family: var(--serif); font-size: clamp(64px, 8vw, 120px); font-weight: 500; line-height: .86; letter-spacing: 0; }
.meal-prep-hero h1 em { color: var(--acid); font-weight: inherit; }
.meal-prep-hero-copy > p:last-of-type { max-width: 600px; margin: 28px 0 0; color: rgba(255,255,255,.78); font-size: 18px; line-height: 1.6; }
.meal-prep-proof { min-height: 112px; padding: 24px 32px; display: grid; grid-template-columns: repeat(4, 1fr); color: var(--ink); background: var(--acid); border-block: 1px solid var(--ink); }
.meal-prep-proof > div { padding: 8px 28px; display: grid; gap: 7px; border-left: 1px solid rgba(23,25,20,.35); }
.meal-prep-proof > div:first-child { border-left: 0; }
.meal-prep-proof strong { font-family: var(--serif); font-size: 24px; font-weight: 500; }
.meal-prep-proof span { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
.meal-prep-range-heading { display: grid; grid-template-columns: 1.2fr .8fr; gap: 70px; align-items: end; margin-bottom: 78px; }
.meal-prep-range-heading h2, .meal-prep-process h2 { max-width: 900px; margin: 0; font-family: var(--serif); font-size: clamp(54px, 7vw, 102px); font-weight: 500; line-height: .91; letter-spacing: 0; }
.meal-prep-range-heading > p { max-width: 450px; margin: 0; color: #5d6057; font-size: 17px; line-height: 1.65; }
.meal-prep-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 76px 28px; }
.meal-prep-product { min-width: 0; grid-column: span 4; }
.meal-prep-product:nth-child(1), .meal-prep-product:nth-child(7) { grid-column: span 7; }
.meal-prep-product:nth-child(2), .meal-prep-product:nth-child(6) { grid-column: span 5; }
.meal-prep-product:nth-child(8), .meal-prep-product:nth-child(9) { grid-column: span 6; }
.meal-prep-product-media { position: relative; aspect-ratio: 4 / 4.5; overflow: hidden; background: var(--paper-deep); }
.meal-prep-product-media img { position: absolute; inset: -10% 0; width: 100%; height: 120%; object-fit: cover; }
.meal-prep-product-index { position: absolute; right: 0; top: 0; width: 48px; height: 48px; display: grid; place-items: center; color: var(--paper); background: var(--ink); font-size: 10px; }
.meal-prep-product-copy { padding-top: 20px; border-top: 1px solid var(--ink); }
.meal-prep-product-copy h3 { margin: 10px 0; font-family: var(--serif); font-size: clamp(27px, 2.6vw, 40px); font-weight: 500; line-height: 1; }
.meal-prep-product-copy p { margin: 0; color: #62645c; line-height: 1.6; }
.meal-prep-tag { color: var(--leaf); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .13em; }
.meal-prep-range-note { margin: 82px 0 0; padding-top: 22px; border-top: 1px solid var(--line); color: #62645c; font-size: 13px; }
.meal-prep-process { color: var(--paper); background: var(--ink); }
.meal-prep-steps { margin-top: 74px; display: grid; grid-template-columns: repeat(3, 1fr); border-block: 1px solid rgba(255,255,255,.2); }
.meal-prep-step { min-height: 290px; padding: 34px; border-left: 1px solid rgba(255,255,255,.2); }
.meal-prep-step:first-child { border-left: 0; }
.meal-prep-step > span { color: var(--acid); font-size: 11px; }
.meal-prep-step h3 { margin: 72px 0 16px; font-family: var(--serif); font-size: 38px; font-weight: 500; }
.meal-prep-step p { max-width: 340px; margin: 0; color: rgba(255,255,255,.66); line-height: 1.65; }
.meal-prep-order-band { padding: clamp(100px, 11vw, 160px) 0; color: #fff; background: var(--leaf); }
.meal-prep-order-band > .shell { display: grid; grid-template-columns: 1fr auto; gap: 50px; align-items: end; }
.meal-prep-order-band h2 { margin: 0; font-family: var(--serif); font-size: clamp(56px, 7vw, 100px); font-weight: 500; line-height: .9; letter-spacing: 0; }
```

- [ ] **Step 2: Add tablet and mobile rules**

```css
.meal-prep-mobile-order { display: none; }

@media (max-width: 980px) {
  .meal-prep-proof { grid-template-columns: 1fr 1fr; }
  .meal-prep-proof > div:nth-child(odd) { border-left: 0; }
  .meal-prep-grid .meal-prep-product { grid-column: span 6; }
  .meal-prep-order-band > .shell { grid-template-columns: 1fr; align-items: start; }
}

@media (max-width: 720px) {
  .meal-prep-hero { min-height: 86svh; height: 720px; }
  .meal-prep-hero-media { inset: 0; }
  .meal-prep-hero-media img { height: 100%; object-position: 58% center; }
  .meal-prep-hero-copy { padding-bottom: 70px; }
  .meal-prep-hero h1 { font-size: clamp(49px, 14vw, 66px); }
  .meal-prep-hero-copy > p:last-of-type { max-width: 94%; font-size: 15px; }
  .meal-prep-proof { padding: 14px 16px; grid-template-columns: 1fr; }
  .meal-prep-proof > div { padding: 18px 0; border-left: 0; border-top: 1px solid rgba(23,25,20,.28); }
  .meal-prep-proof > div:first-child { border-top: 0; }
  .meal-prep-range-heading { display: block; margin-bottom: 54px; }
  .meal-prep-range-heading h2, .meal-prep-process h2 { font-size: clamp(48px, 14vw, 64px); }
  .meal-prep-range-heading > p { margin-top: 28px; font-size: 15px; }
  .meal-prep-grid { display: block; }
  .meal-prep-product { margin-bottom: 62px; }
  .meal-prep-product-media { aspect-ratio: 4 / 4.45; }
  .meal-prep-product-copy h3 { font-size: 30px; }
  .meal-prep-steps { display: block; margin-top: 48px; }
  .meal-prep-step { min-height: 0; padding: 28px 0 36px; border-left: 0; border-top: 1px solid rgba(255,255,255,.2); }
  .meal-prep-step:first-child { border-top: 0; }
  .meal-prep-step h3 { margin: 36px 0 14px; font-size: 34px; }
  .meal-prep-order-band { padding-block: 92px 112px; }
  .meal-prep-order-band h2 { font-size: clamp(49px, 14vw, 66px); }
  .meal-prep-mobile-order { display: grid; grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Add reduced-motion behavior**

Inside the existing reduced-motion media query, ensure parallax images use `inset: 0` and `height: 100%`. Every Framer component must receive static transforms when `useReducedMotion()` is true.

- [ ] **Step 4: Run lint and unit tests**

Run: `npm run lint`

Expected: zero ESLint errors.

Run: `npm test -- --run`

Expected: all tests pass.

- [ ] **Step 5: Commit the visual implementation**

```bash
git add src/styles.css
git commit -m "style: add editorial meal prep layout"
```

### Task 6: Add Responsive Browser Coverage

**Files:**
- Modify: `tests/visual.spec.js`

- [ ] **Step 1: Add desktop and mobile meal-prep checks**

```js
for (const viewport of viewports) {
  test(`meal prep page is complete and responsive on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/meal-prep')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your week')
    await expect(page.getByRole('region', { name: 'Meal prep range' })).toBeVisible()
    await expect(page.locator('.meal-prep-product')).toHaveCount(9)

    const reveals = page.locator('.meal-prep-product, .meal-prep-process, .meal-prep-order-band')
    for (let index = 0; index < await reveals.count(); index += 1) {
      await reveals.nth(index).scrollIntoViewIfNeeded()
      await page.waitForTimeout(350)
    }

    const photos = page.locator('.meal-prep-product img')
    await expect(photos).toHaveCount(9)
    for (let index = 0; index < await photos.count(); index += 1) {
      await expect(photos.nth(index)).toBeVisible()
    }

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)

    await page.screenshot({ path: `/tmp/vie-vegan-meal-prep-${viewport.name}.png`, fullPage: true })
  })
}
```

- [ ] **Step 2: Run only the new browser checks**

Run: `npx playwright test tests/visual.spec.js --grep "meal prep page"`

Expected: two passing tests with nonblank desktop and mobile screenshots.

- [ ] **Step 3: Inspect both screenshots**

Open `/tmp/vie-vegan-meal-prep-desktop.png` and `/tmp/vie-vegan-meal-prep-mobile.png`. Confirm there is no text overlap, every image is populated, the product rhythm is balanced, the mobile order controls remain reachable, and the next section remains discoverable below the hero.

- [ ] **Step 4: Commit browser coverage**

```bash
git add tests/visual.spec.js
git commit -m "test: cover meal prep responsive layout"
```

### Task 7: Final Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run the complete unit suite**

Run: `npm test -- --run`

Expected: all Vitest files and tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: no errors or warnings.

- [ ] **Step 3: Build the production bundle**

Run: `npm run build`

Expected: Vite exits successfully and emits `dist/index.html`, hashed JS/CSS, and all ten meal-prep JPGs.

- [ ] **Step 4: Run the complete browser suite**

Run: `npx playwright test`

Expected: homepage, menu, 404, and meal-prep tests all pass.

- [ ] **Step 5: Start the local preview**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints an available local URL. Open `/meal-prep` at that origin for client review.

- [ ] **Step 6: Review scope before handoff**

Run: `git status --short`

Expected: only the planned page, data, assets, route, styles, and tests are changed.
