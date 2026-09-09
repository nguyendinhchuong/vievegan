import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, Clock3, Instagram, MapPin, Menu, ShoppingBag, X } from 'lucide-react'
import MenuPage from './MenuPage'

const pickupUrl = 'https://www.meandu.app/vievegan/pickup/main-menu-new'
const deliveryUrl = 'https://www.meandu.app/vievegan/delivery'
const mealPrepUrl = 'https://app.bitely.com.au/order/vievegan/IPfk2NI9XbSgEOHmR0Gz'
const mapUrl = 'https://www.google.com/maps/search/?api=1&query=206%20Barkly%20St%20Footscray%20VIC%203011'
const ease = [0.22, 1, 0.36, 1]

const dishes = [
  { name: 'Creamy Coconut Curry Phở', note: 'Silky curry broth, rice noodles, greens, herbs and golden tofu.', price: '$22.90', image: '/images/curry-pho.jpg', className: 'dish-featured' },
  { name: 'Vegan Combination Phở', note: 'Deep house broth with a generous mix of plant-based toppings.', price: '$22.90', image: '/images/combination-pho.jpg', className: 'dish-square' },
  { name: 'Rice Paper Rolls', note: 'Fresh herbs and crisp vegetables with peanut hoisin sauce.', price: '$4.50 ea', image: '/images/rice-paper-roll.jpg', className: 'dish-wide' },
  { name: 'Vegan Fried Rice', note: 'Basmati rice tossed over high heat with vegetables and tofu.', price: 'from $17.90', image: '/images/fried-rice.jpg', className: 'dish-landscape' },
]

const navItems = [['Menu', '/menu'], ['Our story', '/#story'], ['Meal prep', '/#services'], ['Visit', '/#visit']]

function Reveal({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div className={`reveal-mask ${className}`} initial={reduceMotion ? false : 'hidden'} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <motion.div variants={{ hidden: { y: '115%', opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.85, delay, ease } } }}>
        {children}
      </motion.div>
    </motion.div>
  )
}

function ActionLink({ href, children, variant = 'primary', className = '' }) {
  return (
    <motion.a className={`action-link action-link-${variant} ${className}`} href={href} target="_blank" rel="noreferrer" whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
      <span>{children}</span><ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
    </motion.a>
  )
}

function ParallaxImage({ src, alt, loading = 'lazy', strength = 14 }) {
  const imageRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: imageRef, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`])
  const bleed = Math.ceil((strength / (100 - 2 * strength)) * 100) + 2

  return (
    <motion.div
      ref={imageRef}
      className="parallax-image dish-parallax-image"
      style={{ '--parallax-bleed': `-${bleed}%`, ...(reduceMotion ? {} : { y }) }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        whileHover={reduceMotion ? undefined : { scale: 1.035 }}
        transition={{ duration: 0.7, ease }}
      />
    </motion.div>
  )
}

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className={`site-nav ${scrolled ? 'site-nav-scrolled' : ''}`}>
        <a className="brand" href="/" aria-label="Vie Vegan home"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="nav-order" href={pickupUrl} target="_blank" rel="noreferrer">Order now <ArrowRight size={16} aria-hidden="true" /></a>
          <button className="menu-toggle" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu aria-hidden="true" /></button>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mobile-menu-top">
              <img src="/images/vievegan-logo.png" alt="Vie Vegan" />
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X aria-hidden="true" /></button>
            </div>
            <nav aria-label="Mobile navigation">
              {navItems.map(([label, href], index) => (
                <motion.a key={href} href={href} onClick={() => setMenuOpen(false)} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 + index * 0.06 }}>
                  <span>0{index + 1}</span>{label}
                </motion.a>
              ))}
            </nav>
            <ActionLink href={pickupUrl}>Order pickup</ActionLink>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function Hero() {
  const heroRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section className="hero" id="top" ref={heroRef}>
      <motion.div className="hero-media" style={reduceMotion ? undefined : { y: imageY }}><img src="/images/hero-curry-pho.jpg" alt="Creamy coconut curry phở with tofu and fresh herbs" /></motion.div>
      <div className="hero-shade" />
      <motion.div className="hero-content shell" style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}>
        <Reveal><p className="eyebrow light">Plant-based Vietnamese · Footscray</p></Reveal>
        <h1><Reveal><span>Street food,</span></Reveal><Reveal delay={0.08}><span>made <em>soulful.</em></span></Reveal></h1>
        <Reveal delay={0.18} className="hero-intro"><p>Bold Vietnamese flavour, fresh ingredients, and no compromise. Made in Melbourne’s inner west.</p></Reveal>
        <Reveal delay={0.26}><div className="hero-actions"><ActionLink href={pickupUrl}>Order pickup</ActionLink><ActionLink href={deliveryUrl} variant="ghost">Order delivery</ActionLink></div></Reveal>
      </motion.div>
      <a className="scroll-cue" href="#favourites" aria-label="Scroll to house favourites"><span>Scroll to taste</span><ArrowDown size={17} aria-hidden="true" /></a>
      <div className="hero-index" aria-hidden="true">01 / 06</div>
    </section>
  )
}

function ProofTicker() {
  const items = ['206 Barkly St', 'Open every day', '100% plant-based', 'Made fresh in Footscray']
  return (
    <section className="ticker" aria-label="Restaurant highlights">
      <motion.div className="ticker-track" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}>
        {[...items, ...items].map((item, index) => <span key={`${item}-${index}`}><i aria-hidden="true">✦</i>{item}</span>)}
      </motion.div>
    </section>
  )
}

function SectionTitle({ eyebrow, children, light = false }) {
  return <div className={`section-title ${light ? 'section-title-light' : ''}`}><Reveal><p className="eyebrow">{eyebrow}</p></Reveal><h2>{children}</h2></div>
}

function Dish({ dish, index }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.article className={`dish ${dish.className}`} initial={reduceMotion ? false : { y: 45, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.8, delay: index * 0.05, ease }}>
      <div className="dish-image-wrap">
        <ParallaxImage src={dish.image} alt={dish.name} loading={index === 0 ? 'eager' : 'lazy'} strength={index % 2 === 0 ? 16 : 13} />
        <span className="dish-number">0{index + 1}</span>
      </div>
      <div className="dish-meta"><div><h3>{dish.name}</h3><p>{dish.note}</p></div><strong>{dish.price}</strong></div>
    </motion.article>
  )
}

function Favourites() {
  return (
    <section className="favourites section" id="favourites"><div className="shell">
      <div className="section-heading-row">
        <SectionTitle eyebrow="From the kitchen">House <span className="text-accent">favourites.</span></SectionTitle>
        <Reveal delay={0.1} className="section-copy"><p>Vietnamese comfort food built from aromatic broths, fresh herbs, crisp vegetables, and ingredients that earn their place.</p></Reveal>
      </div>
      <div className="dish-grid">{dishes.map((dish, index) => <Dish dish={dish} index={index} key={dish.name} />)}</div>
      <div className="center-action"><ActionLink href={pickupUrl} variant="dark">Explore the full menu</ActionLink></div>
    </div></section>
  )
}

function Story() {
  return (
    <section className="story section" id="story">
      <div className="story-image">
        <ParallaxImage src="/images/khoa-founder.jpg" alt="Khoa Pham, founder of Vie Vegan" strength={13} /><span>Founder · Khoa Pham</span>
      </div>
      <div className="story-copy">
        <SectionTitle eyebrow="Our story" light>Not vegan food.<br />Great <em>Vietnamese</em> food.</SectionTitle>
        <Reveal delay={0.1}><blockquote>“I wanted to make great Vietnamese food that happened to be plant-based, honest, and something everyone could afford to eat every day.”</blockquote></Reveal>
        <Reveal delay={0.18}><p>We grew up with food that was bold, fresh, and impossible to forget. Vie Vegan honours those flavours with cleaner ingredients and lighter cooking, without losing what made us love them.</p></Reveal>
        <a className="text-link light-link" href="#visit">Meet us in Footscray <ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="services section" id="services"><div className="shell">
      <SectionTitle eyebrow="More Vie, more often">Good food for <span className="text-accent">every rhythm.</span></SectionTitle>
      <div className="service-split">
        <motion.article className="service-panel service-meal" initial={{ y: 36, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, ease }}>
          <ParallaxImage src="/images/meal-prep.jpg" alt="Vie Vegan meal prep bowls" strength={14} /><div className="service-overlay"><p className="eyebrow light">Meal prep</p><h3>Feast all week.</h3><a href={mealPrepUrl} target="_blank" rel="noreferrer">Stock the fridge <ArrowRight size={18} /></a></div>
        </motion.article>
        <motion.article className="service-panel service-catering" initial={{ y: 56, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.1, ease }}>
          <ParallaxImage src="/images/catering-spread.jpg" alt="Vie Vegan catering spread" strength={12} /><div className="service-overlay"><p className="eyebrow light">Catering</p><h3>Feed the whole table.</h3><a href="mailto:info@vievegan.com.au">Plan your spread <ArrowRight size={18} /></a></div>
        </motion.article>
      </div>
    </div></section>
  )
}

function Visit() {
  return (
    <section className="visit section" id="visit">
      <div className="visit-image"><ParallaxImage src="/images/visit.jpg" alt="Vie Vegan shopfront in Footscray" strength={13} /><div className="visit-image-label">Barkly Street · Footscray</div></div>
      <div className="visit-copy">
        <SectionTitle eyebrow="Come say xin chào" light>Your table’s<br /><em>waiting.</em></SectionTitle>
        <div className="visit-details"><div><MapPin aria-hidden="true" /><p><strong>Vie Vegan</strong><br />206 Barkly St<br />Footscray VIC 3011</p></div><div><Clock3 aria-hidden="true" /><p><strong>Open every day</strong><br />11am until midnight</p></div></div>
        <ActionLink href={mapUrl}>Get directions</ActionLink>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-brand"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /><p>Eat kind. Eat bold.<br />Eat Vie Vegan.</p></div>
        <div><span className="footer-label">Visit</span><p>206 Barkly St<br />Footscray VIC 3011</p></div>
        <div><span className="footer-label">Contact</span><a href="mailto:info@vievegan.com.au">info@vievegan.com.au</a></div>
        <div className="footer-social"><span className="footer-label">Follow</span><a href="https://www.instagram.com/vievegan.au/" target="_blank" rel="noreferrer" aria-label="Vie Vegan on Instagram"><Instagram /></a></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Vie Vegan</span><span>Vietnamese vegan fusion</span></div>
    </footer>
  )
}

function MobileOrderBar() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > window.innerHeight * 0.65)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return <AnimatePresence>{visible ? <motion.div className="mobile-order-bar" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }}><a href={pickupUrl} target="_blank" rel="noreferrer"><ShoppingBag size={18} />Pickup</a><a href={deliveryUrl} target="_blank" rel="noreferrer">Delivery<ArrowRight size={18} /></a></motion.div> : null}</AnimatePresence>
}

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/menu') return <MenuPage />
  return <><Navigation /><main><Hero /><ProofTicker /><Favourites /><Story /><Services /><Visit /></main><Footer /><MobileOrderBar /></>
}
