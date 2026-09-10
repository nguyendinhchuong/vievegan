import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, Menu, ShoppingBag, X } from 'lucide-react'
import { mealPrepBitelyUrl, mealPrepProducts, mealPrepProofs, mealPrepShopifyUrl, mealPrepSteps } from './mealPrepData'

const ease = [0.22, 1, 0.36, 1]
const navLinks = [['Menu', '/menu'], ['Our story', '/#story'], ['Meal prep', '/meal-prep'], ['Visit', '/#visit']]

function MealPrepAction({ href, children, secondary = false, target, rel }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.a className={`action-link ${secondary ? 'action-link-ghost' : 'action-link-primary'}`} href={href} target={target} rel={rel} whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: .97 }}>
      <span>{children}</span><ArrowRight size={18} aria-hidden="true" />
    </motion.a>
  )
}

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

  return (
    <>
      <header className={`site-nav meal-prep-site-nav ${scrolled ? 'site-nav-scrolled' : ''}`}>
        <a className="brand" href="/" aria-label="Vie Vegan home"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map(([label, href]) => <a key={href} href={href} aria-current={href === '/meal-prep' ? 'page' : undefined}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="nav-order" href={mealPrepShopifyUrl}>Order meal prep <ArrowRight size={16} aria-hidden="true" /></a>
          <button className="menu-toggle" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu aria-hidden="true" /></button>
        </div>
      </header>
      <AnimatePresence>
        {open ? (
          <motion.div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mobile-menu-top"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /><button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X aria-hidden="true" /></button></div>
            <nav aria-label="Mobile navigation">
              {navLinks.map(([label, href], index) => <motion.a key={href} href={href} onClick={() => setOpen(false)} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .08 + index * .06 }}><span>0{index + 1}</span>{label}</motion.a>)}
            </nav>
            <MealPrepAction href={mealPrepShopifyUrl}>Order meal prep</MealPrepAction>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function MealPrepHero() {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])

  return (
    <section className="meal-prep-hero" ref={ref}>
      <motion.div className="meal-prep-hero-media" style={reduceMotion ? undefined : { y: imageY }}><img src="/images/mealprep-hero-trays.jpg" alt="Vie Vegan meal prep trays packed and ready for the week" /></motion.div>
      <div className="meal-prep-hero-shade" />
      <motion.div className="meal-prep-hero-copy shell" style={reduceMotion ? undefined : { y: copyY }}>
        <motion.p className="eyebrow light" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease }}>Meal prep · Made in Footscray</motion.p>
        <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .08, ease }}>Your week of bold Vietnamese, <em>sorted.</em></motion.h1>
        <motion.p className="meal-prep-hero-intro" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .18, ease }}>Ready-to-heat vegan meals cooked fresh in Footscray: phở, rice bowls, and soups with the same clean ingredients we serve on Barkly Street. Stock the fridge once, eat well all week.</motion.p>
        <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .26, ease }}><MealPrepAction href={mealPrepShopifyUrl}>Order meal prep</MealPrepAction></motion.div>
      </motion.div>
      <a className="scroll-cue" href="#range"><span>Explore the range</span><ArrowDown size={17} aria-hidden="true" /></a>
    </section>
  )
}

function MealPrepProofStrip() {
  return <section className="meal-prep-proof" aria-label="Meal prep highlights">{mealPrepProofs.map(([title, detail]) => <div key={title}><strong>{title}</strong><span>{detail}</span></div>)}</section>
}

function MealPrepProduct({ product, index }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <motion.article className="meal-prep-product" ref={ref} initial={reduceMotion ? false : { opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .14 }} transition={{ duration: .75, delay: index % 3 * .05, ease }}>
      <div className="meal-prep-product-media"><motion.img src={product.image} alt={`Vie Vegan ${product.name} meal prep pack`} loading={index < 3 ? 'eager' : 'lazy'} style={reduceMotion ? undefined : { y }} /><span className="meal-prep-product-index">0{index + 1}</span></div>
      <div className="meal-prep-product-copy"><span className="meal-prep-tag">{product.tag}</span><h3>{product.name}</h3><p>{product.description}</p></div>
    </motion.article>
  )
}

function MealPrepRange() {
  return (
    <section className="meal-prep-range section" id="range" aria-label="Meal prep range"><div className="shell">
      <div className="meal-prep-range-heading"><div><p className="eyebrow">The range</p><h2>Restaurant favourites, <em>packed for your fridge.</em></h2></div><p>The same dishes people line up for on Barkly Street, portioned as ready meals. Order online and mix and match your week.</p></div>
      <div className="meal-prep-grid">{mealPrepProducts.map((product, index) => <MealPrepProduct product={product} index={index} key={product.name} />)}</div>
      <p className="meal-prep-range-note">See the full range and current prices when you order online.</p>
    </div></section>
  )
}

function MealPrepProcess() {
  const reduceMotion = useReducedMotion()
  return (
    <section className="meal-prep-process section" aria-labelledby="meal-prep-process-title"><div className="shell">
      <p className="eyebrow light">How it works</p><h2 id="meal-prep-process-title">Three steps to a <em>stocked fridge.</em></h2>
      <div className="meal-prep-steps">{mealPrepSteps.map(([title, detail], index) => <motion.article className="meal-prep-step" key={title} initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .7, delay: index * .08, ease }}><span>0{index + 1}</span><h3>{title}</h3><p>{detail}</p></motion.article>)}</div>
    </div></section>
  )
}

function MealPrepOrderBand() {
  return (
    <section className="meal-prep-order-band" aria-label="Order meal prep">
      <div className="shell">
        <div>
          <p className="eyebrow light">Ready to stock the fridge?</p>
          <h2>Fresh meals.<br /><em>Week sorted.</em></h2>
          <p>Order Vie Vegan meal prep online, cooked fresh in Footscray.</p>
        </div>
        <div className="hero-actions">
          <MealPrepAction href={mealPrepShopifyUrl}>Order now</MealPrepAction>
          <MealPrepAction href={mealPrepBitelyUrl} secondary target="_blank" rel="noreferrer">Order via Bitely</MealPrepAction>
        </div>
      </div>
    </section>
  )
}

function MealPrepFooter() {
  return (
    <footer className="footer menu-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <img src="/images/vievegan-logo.png" alt="Vie Vegan" />
          <p>Eat kind. Eat bold.<br />Eat Vie Vegan.</p>
        </div>
        <div>
          <span className="footer-label">Visit</span>
          <p>206 Barkly St<br />Footscray VIC 3011</p>
        </div>
        <div>
          <span className="footer-label">Contact</span>
          <a href="mailto:info@vievegan.com.au">info@vievegan.com.au</a>
        </div>
        <div>
          <span className="footer-label">Order</span>
          <a href={mealPrepShopifyUrl}>Order meal prep</a>
          <a href={mealPrepBitelyUrl} target="_blank" rel="noreferrer">Order via Bitely</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Vie Vegan</span>
        <a href="/">Back to home</a>
      </div>
    </footer>
  )
}

export default function MealPrepPage() {
  useEffect(() => {
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.getAttribute('content')
    document.title = 'Vegan Meal Prep Melbourne | Vie Vegan'
    description?.setAttribute('content', 'Ready-to-heat vegan Vietnamese meal prep, cooked fresh in Footscray and delivered across Melbourne.')
    return () => {
      document.title = 'Vie Vegan | Plant-based Vietnamese in Footscray'
      if (previousDescription) description?.setAttribute('content', previousDescription)
    }
  }, [])

  return <div className="meal-prep-page"><MealPrepHeader /><main><MealPrepHero /><MealPrepProofStrip /><MealPrepRange /><MealPrepProcess /><MealPrepOrderBand /></main><MealPrepFooter /><div className="mobile-order-bar meal-prep-mobile-order"><a href={mealPrepShopifyUrl}><ShoppingBag size={18} aria-hidden="true" />Order meal prep</a></div></div>
}
