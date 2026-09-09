import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1]

function EmptyPhoBowl() {
  return (
    <svg className="not-found-bowl" viewBox="0 0 720 620" role="img" aria-labelledby="empty-bowl-title empty-bowl-description">
      <title id="empty-bowl-title">Empty phở bowl with noodles shaped like 404</title>
      <desc id="empty-bowl-description">A playful line drawing of chopsticks, herbs, steam, and an empty bowl beneath noodle-shaped 404 numbers.</desc>

      <g className="not-found-steam" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8">
        <path d="M255 126c-26-27 25-39 0-70" />
        <path d="M355 110c-27-28 26-39 0-72" />
        <path d="M455 126c-26-27 25-39 0-70" />
      </g>

      <g className="not-found-noodles" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <path d="M156 178 91 294h139m-36-116v160" />
        <path d="M360 177c-62 0-91 35-91 81s29 82 91 82 91-36 91-82-29-81-91-81Z" />
        <path d="m553 178-66 116h140m-36-116v160" />
      </g>

      <g className="not-found-chopsticks" stroke="currentColor" strokeLinecap="round">
        <path d="m98 375 487-205" strokeWidth="12" />
        <path d="m122 405 482-180" strokeWidth="7" />
      </g>

      <g className="not-found-herbs">
        <path d="M130 382c-30-63 34-88 72-33-18 42-44 55-72 33Z" />
        <path d="M186 378c22-56 81-44 79 18-38 22-65 16-79-18Z" />
        <path d="m163 401 39-53m-15 46 43-12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
      </g>

      <path className="not-found-rim" d="M74 384c0-33 128-60 286-60s286 27 286 60-128 61-286 61S74 418 74 384Z" />
      <path className="not-found-bowl-body" d="M88 394c18 131 111 190 272 190s254-59 272-190c-44 34-145 51-272 51S132 428 88 394Z" />
      <path className="not-found-bowl-line" d="M152 459c69 35 347 35 416 0" fill="none" strokeLinecap="round" strokeWidth="6" />
      <path className="not-found-smile" d="M323 503c22 15 52 15 74 0" fill="none" strokeLinecap="round" strokeWidth="7" />
    </svg>
  )
}

export default function NotFoundPage() {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    document.title = 'Page Not Found | Vie Vegan'
    return () => { document.title = 'Vie Vegan | Plant-based Vietnamese in Footscray' }
  }, [])

  return (
    <div className="not-found-page">
      <header className="not-found-nav">
        <a className="brand" href="/" aria-label="Vie Vegan home"><img src="/images/vievegan-logo.png" alt="Vie Vegan" /></a>
        <a className="not-found-nav-link" href="/menu">Menu <ArrowRight size={16} aria-hidden="true" /></a>
      </header>

      <main className="not-found-main">
        <motion.div className="not-found-copy" initial={reduceMotion ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .85, ease }}>
          <p className="eyebrow light">404 · Nothing in this bowl</p>
          <h1>Phở-oh!<br />This page <em>is missing.</em></h1>
          <p className="not-found-message">Looks like this bowl came back empty. Let’s get you somewhere with a little more flavour.</p>
          <div className="not-found-actions">
            <motion.a className="action-link action-link-primary" href="/" whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: .97 }}><ArrowLeft size={18} aria-hidden="true" /><span>Back home</span></motion.a>
            <motion.a className="action-link action-link-ghost" href="/menu" whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: .97 }}><span>See the menu</span><ArrowRight size={18} aria-hidden="true" /></motion.a>
          </div>
        </motion.div>

        <motion.div className="not-found-art" initial={reduceMotion ? false : { opacity: 0, scale: .9, rotate: -3 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0, y: [0, -8, 0] }} transition={reduceMotion ? { duration: 0 } : { opacity: { duration: .8, delay: .15 }, scale: { duration: 1, delay: .15, ease }, rotate: { duration: 1, delay: .15, ease }, y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 } }}>
          <EmptyPhoBowl />
        </motion.div>

        <span className="not-found-location">206 Barkly St · Footscray</span>
      </main>
    </div>
  )
}
