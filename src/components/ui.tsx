import { useEffect, useRef } from 'react'
import { RM, clamp, isStatic, sv } from '../lib/util'

/* Preço com odômetro: cada dígito é uma fita de 0 a 9 (chaves contadas da direita) */
export function Price({ text, cls = 'price' }: { text: string; cls?: string }) {
  const n = text.length
  return (
    <p className={cls} role="img" aria-label={text}>
      {[...text].map((c, i) => /\d/.test(c)
        ? <span key={n - i} className="od" aria-hidden="true"><span className="rl" style={sv({ '--n': c, '--j': i })}>{Array.from({ length: 10 }, (_, k) => <b key={k}>{k}</b>)}</span></span>
        : <span key={n - i} aria-hidden="true">{c}</span>)}
    </p>
  )
}

/* Texto que se preenche palavra por palavra conforme a rolagem */
export function FillText({ text, className = 'mf' }: { text: string; className?: string }) {
  const box = useRef<HTMLParagraphElement>(null)
  const sp = useRef<(HTMLSpanElement | null)[]>([])
  const words = text.split(' ')
  useEffect(() => {
    const rm = matchMedia(RM), cache: number[] = []
    const f = () => {
      const r = box.current!.getBoundingClientRect(), n = words.length
      const pr = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .3))
      sp.current.forEach((s, i) => {
        if (!s) return
        const v = rm.matches ? 1 : clamp((pr * (n + 3) - i) / 3), o = +(.2 + .8 * v).toFixed(2)
        if (cache[i] !== o) { cache[i] = o; s.style.opacity = String(o) }
      })
    }
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f)
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f) }
  }, [])
  return <p className={className} ref={box}>{words.map((w, i) => <span key={i} ref={el => { sp.current[i] = el }}>{w + (i < words.length - 1 ? ' ' : '')}</span>)}</p>
}

/* Partículas conectadas que fogem do mouse (só desenha enquanto visível) */
export function Particles() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (isStatic()) return
    const c = ref.current!, g = c.getContext('2d')!
    let w = 0, h = 0, raf = 0, vis = true, m = { x: -999, y: -999 }
    const N = 70
    const P = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .0003, vy: (Math.random() - .5) * .0003, r: 1 + Math.random() * 1.8 }))
    const size = () => { const d = devicePixelRatio || 1; w = c.clientWidth; h = c.clientHeight; c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0) }
    const t = () => {
      if (!vis) { raf = 0; return }
      g.clearRect(0, 0, w, h)
      const pts = P.map(p => {
        p.x += p.vx * 16; p.y += p.vy * 16
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
        let x = p.x * w, y = p.y * h
        const dx = x - m.x, dy = y - m.y, d = Math.hypot(dx, dy)
        if (d < 140 && d > 0) { const f = (140 - d) / 140 * 38; x += dx / d * f; y += dy / d * f }
        return { x, y, r: p.r }
      })
      for (let i = 0; i < N; i++) {
        g.fillStyle = 'rgba(17,106,52,.7)'; g.beginPath(); g.arc(pts[i].x, pts[i].y, pts[i].r, 0, 7); g.fill()
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (d < 120) { g.strokeStyle = `rgba(17,106,52,${(1 - d / 120) * .3})`; g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(pts[j].x, pts[j].y); g.stroke() }
        }
      }
      raf = requestAnimationFrame(t)
    }
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(t) })
    const mm = (e: PointerEvent) => { const r = c.getBoundingClientRect(); m = { x: e.clientX - r.left, y: e.clientY - r.top } }
    size(); io.observe(c); addEventListener('resize', size); addEventListener('pointermove', mm); raf = requestAnimationFrame(t)
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', size); removeEventListener('pointermove', mm) }
  }, [])
  return <canvas ref={ref} className="pc" aria-hidden="true" />
}

/* Confete de folhas, com gravidade e giro; para sozinho quando todas saem da tela */
export function confetti(x: number, y: number) {
  if (matchMedia(RM).matches) return
  const c = document.createElement('canvas'); c.className = 'cf'; c.width = innerWidth; c.height = innerHeight; document.body.append(c)
  const g = c.getContext('2d')!, cols = ['#7CB542', '#116A34', '#EAF5EE', '#D2EBAA']
  const ps = Array.from({ length: 100 }, () => ({ x, y, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4, w: 6 + Math.random() * 7, h: 11 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.random() * 4 | 0] }))
  let f = 0
  const t = () => {
    g.clearRect(0, 0, c.width, c.height); let alive = 0
    for (const p of ps) {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr
      if (p.y < c.height + 30) alive++
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.beginPath(); g.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, 7); g.fill(); g.restore()
    }
    if (alive && f++ < 420) requestAnimationFrame(t); else c.remove()
  }
  requestAnimationFrame(t)
}
