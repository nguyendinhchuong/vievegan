import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, Menu, ShoppingBag, X } from 'lucide-react'
import { menuCategories, menuLegend } from './menuData'

const pickupUrl = 'https://www.meandu.app/vievegan/pickup/main-menu-new'
const deliveryUrl = 'https://www.meandu.app/vievegan/delivery'
const ease = [0.22, 1, 0.36, 1]

function MenuHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const links = [['Menu', '/menu'], ['Our story', '/#story'], ['Meal prep', '/#services'], ['Visit', '/#visit']]

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
      <header className={`site-nav menu-site-nav ${scrolled ? 'site-nav-scrolled' : ''}`}>
        <a className="brand" href="/" aria-label="Vie Vegan home"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => <a key={href} href={href} aria-current={href === '/menu' ? 'page' : undefined}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="nav-order" href={pickupUrl} target="_blank" rel="noreferrer">Order now <ArrowRight size={16} aria-hidden="true" /></a>
          <button className="menu-toggle" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu aria-hidden="true" /></button>
        </div>
      </header>
      <AnimatePresence>
        {open ? (
          <motion.div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mobile-menu-top"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /><button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
            <nav aria-label="Mobile navigation">
              {links.map(([label, href], index) => <motion.a key={href} href={href} onClick={() => setOpen(false)} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .08 + index * .06 }}><span>0{index + 1}</span>{label}</motion.a>)}
            </nav>
            <MenuAction href={pickupUrl}>Order pickup</MenuAction>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function MenuAction({ href, children, secondary = false }) {
  return (
    <motion.a className={`action-link ${secondary ? 'action-link-ghost' : 'action-link-primary'}`} href={href} target="_blank" rel="noreferrer" whileHover={{ y: -3 }} whileTap={{ scale: .97 }}>
      <span>{children}</span><ArrowRight size={18} aria-hidden="true" />
    </motion.a>
  )
}

function MenuHero() {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  return (
    <section className="menu-hero" ref={ref}>
      <motion.img style={reduceMotion ? undefined : { y }} src="/images/hero-curry-pho.jpg" alt="Vie Vegan creamy coconut curry phở" />
      <div className="menu-hero-shade" />
      <motion.div className="menu-hero-copy shell" style={reduceMotion ? undefined : { y: copyY }}>
        <motion.p className="eyebrow light" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .7, ease }}>Our menu · Footscray</motion.p>
        <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .9, delay: .08, ease }}>Vietnamese favourites,<br />made <em>plant-based.</em></motion.h1>
        <motion.p className="menu-hero-intro" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .8, delay: .18, ease }}>Phở, bánh mì, rice bowls, salad bowls and sides, made fresh daily with bold flavour and clean ingredients.</motion.p>
        <motion.div className="hero-actions" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .8, delay: .26, ease }}><MenuAction href={pickupUrl}>Order pickup</MenuAction><MenuAction href={deliveryUrl} secondary>Order delivery</MenuAction></motion.div>
      </motion.div>
      <a className="scroll-cue" href="#menu-list"><span>Explore the menu</span><ArrowDown size={17} /></a>
    </section>
  )
}

function CategoryNav() {
  return (
    <nav className="menu-category-nav" aria-label="Menu categories">
      <div className="shell">{menuCategories.map((category) => <a key={category.id} href={`#${category.id}`}>{category.shortName}</a>)}</div>
    </nav>
  )
}

function Marker({ children }) {
  return <span className="menu-marker">{children}</span>
}

function MenuCategory({ category, index }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.article className="menu-category" id={category.id} initial={reduceMotion ? false : { y: 36, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .75, ease }}>
      <div className="menu-category-intro">
        <span className="menu-category-number">0{index + 1}</span>
        <p className="eyebrow">{category.eyebrow}</p>
        <h2>{category.title}</h2>
        <p>{category.description}</p>
      </div>
      <div className="menu-dishes">
        {category.dishes.map(([name, price, markers, signature]) => (
          <div className="menu-dish" key={name}>
            <div className="menu-dish-name">{signature ? <span className="signature-star" aria-label="Chef's signature">★</span> : null}<span>{name}</span></div>
            <div className="menu-dish-meta">{markers.map((marker) => <Marker key={marker}>{marker}</Marker>)}<strong>{price}</strong></div>
          </div>
        ))}
        {category.note ? <p className="menu-category-note">{category.note}</p> : null}
      </div>
    </motion.article>
  )
}

function MenuPhoto({ src, alt, delay }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <motion.div ref={ref} initial={reduceMotion ? false : { opacity: .55, scale: .985 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .9, delay, ease }}>
      <motion.img style={reduceMotion ? undefined : { y }} src={src} alt={alt} loading="lazy" />
    </motion.div>
  )
}

function PhotoBand({ second = false }) {
  const photos = second
    ? [['/images/pate-toast.jpg', 'Vie Vegan pâté and toast'], ['/images/curry-pho.jpg', 'Creamy coconut curry phở']]
    : [['/images/rice-paper-roll.jpg', 'Vie Vegan rice paper rolls'], ['/images/fried-rice.jpg', 'Vie Vegan fried rice']]
  return <section className={`menu-photo-band ${second ? 'menu-photo-band-reverse' : ''}`}>{photos.map(([src, alt], index) => <MenuPhoto key={src} src={src} alt={alt} delay={index * .1} />)}</section>
}

function MenuFooter() {
  return (
    <footer className="footer menu-footer">
      <div className="shell footer-grid">
        <div className="footer-brand"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /><p>Eat kind. Eat bold.<br />Eat Vie Vegan.</p></div>
        <div><span className="footer-label">Visit</span><p>206 Barkly St<br />Footscray VIC 3011</p></div>
        <div><span className="footer-label">Contact</span><a href="mailto:info@vievegan.com.au">info@vievegan.com.au</a></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Vie Vegan</span><a href="/">Back to home</a></div>
    </footer>
  )
}

function MenuMobileOrderBar() {
  return <div className="mobile-order-bar menu-mobile-order"><a href={pickupUrl} target="_blank" rel="noreferrer"><ShoppingBag size={18} />Pickup</a><a href={deliveryUrl} target="_blank" rel="noreferrer">Delivery<ArrowRight size={18} /></a></div>
}

export default function MenuPage() {
  useEffect(() => {
    document.title = 'Our Menu | Vie Vegan Footscray'
    return () => { document.title = 'Vie Vegan | Plant-based Vietnamese in Footscray' }
  }, [])

  return (
    <div className="menu-page">
      <MenuHeader />
      <main>
        <MenuHero />
        <CategoryNav />
        <section className="menu-legend" aria-label="Menu key"><div className="shell">{menuLegend.map(([marker, label]) => <span key={marker}><Marker>{marker}</Marker>{label}</span>)}</div></section>
        <section className="menu-list shell" id="menu-list" aria-label="Vie Vegan full menu">
          {menuCategories.slice(0, 3).map((category, index) => <MenuCategory category={category} index={index} key={category.id} />)}
        </section>
        <PhotoBand />
        <section className="menu-list shell">
          {menuCategories.slice(3, 6).map((category, index) => <MenuCategory category={category} index={index + 3} key={category.id} />)}
        </section>
        <PhotoBand second />
        <section className="menu-list shell">
          {menuCategories.slice(6).map((category, index) => <MenuCategory category={category} index={index + 6} key={category.id} />)}
        </section>
        <section className="menu-order-cta"><div className="shell"><div><p className="eyebrow light">Hungry yet?</p><h2>Fresh, bold,<br /><em>ready when you are.</em></h2></div><div className="menu-order-actions"><MenuAction href={pickupUrl}>Order pickup</MenuAction><MenuAction href={deliveryUrl} secondary>Order delivery</MenuAction></div></div></section>
      </main>
      <MenuFooter />
      <MenuMobileOrderBar />
    </div>
  )
}
