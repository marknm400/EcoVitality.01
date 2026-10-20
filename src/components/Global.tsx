import { useEffect } from 'react'
import { COMPACT, GATES, RM, clamp } from '../lib/util'

/* Efeitos globais: modo estático, fundo que escurece, cartões empilhados, revelações,
   rolagem com inércia, cursor, luz/inclinação nos cartões, ondas e ímã nos botões. */
export default function Global({ route }: { route: string }) {
  useEffect(() => {
    const mqs = GATES.map(q => matchMedia(q))
    const f = () => document.documentElement.classList.toggle('st', mqs.some(m => m.matches))
    const cm = matchMedia(COMPACT), fc = () => document.documentElement.classList.toggle('cp', cm.matches)
    f(); fc(); mqs.forEach(m => m.addEventListener('change', f)); cm.addEventListener('change', fc)
    return () => { mqs.forEach(m => m.removeEventListener('change', f)); cm.removeEventListener('change', fc) }
  }, [])

  useEffect(() => {
    const r = document.documentElement
    let ticking = false, lk = -1
    const f = () => {
      ticking = false
      const kk = +(route === '/' ? clamp(scrollY / (innerHeight * .6)) : 1).toFixed(3)
      if (kk !== lk) { lk = kk; r.style.setProperty('--k', String(kk)) }
      const cs = [...document.querySelectorAll<HTMLElement>('.stk .glass')]
      cs.forEach((c, i) => {
        const nx = cs[i + 1]
        const ov = nx ? clamp((96 + i * 28 + 380 - nx.getBoundingClientRect().top) / 380) : 0
        c.style.setProperty('--sc', (1 - ov * .07).toFixed(3)); c.style.setProperty('--br', (1 - ov * .4).toFixed(3))
      })
    }
    const on = () => { if (!ticking) { ticking = true; requestAnimationFrame(f) } }
    f(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [route])

  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .15 })
    document.querySelectorAll('.rv:not(.in)').forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [route])

  // rolagem com inércia: só a roda do mouse; teclado, barra e toque seguem nativos
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia(RM).matches) return
    let target = scrollY, cur = scrollY, raf = 0
    const max = () => document.documentElement.scrollHeight - innerHeight
    const step = () => {
      cur += (target - cur) * .11
      if (Math.abs(target - cur) < .4) { cur = target; raf = 0 } else raf = requestAnimationFrame(step)
      scrollTo(0, cur)
    }
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented || document.documentElement.classList.contains('lock') || (e.target as HTMLElement).closest('textarea,.pzd,.xp,.vt-card')) return
      e.preventDefault()
      if (!raf) { cur = scrollY; target = scrollY }
      target = clamp(target + e.deltaY * (e.deltaMode === 1 ? 32 : 1), 0, max())
      if (!raf) raf = requestAnimationFrame(step)
    }
    const sync = () => { if (!raf) { cur = target = scrollY } }
    addEventListener('wheel', wheel, { passive: false }); addEventListener('scroll', sync, { passive: true })
    return () => { removeEventListener('wheel', wheel); removeEventListener('scroll', sync); cancelAnimationFrame(raf) }
  }, [])

  // cursor personalizado: ponto imediato e anel que chega depois
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    const h = document.documentElement, d = document.querySelector<HTMLElement>('.cd')!, r = document.querySelector<HTMLElement>('.cr')!
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0
    const tk = () => { rx += (x - rx) * .18; ry += (y - ry) * .18; r.style.transform = `translate(${rx}px,${ry}px)`; raf = Math.abs(x - rx) + Math.abs(y - ry) > .3 ? requestAnimationFrame(tk) : 0 }
    const mv = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY; d.style.transform = `translate(${x}px,${y}px)`
      h.classList.toggle('hv', !!(e.target as HTMLElement).closest('a,button,input,textarea,[role=button]'))
      if (!raf) raf = requestAnimationFrame(tk)
    }
    h.classList.add('cur'); addEventListener('pointermove', mv)
    return () => { h.classList.remove('cur', 'hv'); removeEventListener('pointermove', mv); cancelAnimationFrame(raf) }
  }, [])

  // luz que segue o mouse, inclinação 3D e onda no clique
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const g = (e.target as HTMLElement).closest<HTMLElement>('.glass'); if (!g) return
      const r = g.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top
      g.style.setProperty('--mx', px + 'px'); g.style.setProperty('--my', py + 'px')
      if (g.classList.contains('tilt')) { g.style.setProperty('--rx', ((.5 - py / r.height) * 8).toFixed(2) + 'deg'); g.style.setProperty('--ry', ((px / r.width - .5) * 8).toFixed(2) + 'deg') }
    }
    const out = (e: PointerEvent) => {
      const g = (e.target as HTMLElement).closest<HTMLElement>('.tilt')
      if (g && !g.contains(e.relatedTarget as Node)) { g.style.setProperty('--rx', '0deg'); g.style.setProperty('--ry', '0deg') }
    }
    const down = (e: PointerEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('.btn'); if (!b) return
      const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, i = document.createElement('i')
      i.className = 'rip'; i.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`
      b.append(i); setTimeout(() => i.remove(), 700)
    }
    document.addEventListener('pointermove', move); document.addEventListener('pointerout', out); document.addEventListener('pointerdown', down)
    return () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerout', out); document.removeEventListener('pointerdown', down) }
  }, [])

  // ímã com mola nos botões .mag
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia(RM).matches) return
    const S = new Map<HTMLElement, { x: number; y: number; vx: number; vy: number; tx: number; ty: number }>()
    let raf = 0
    const loop = () => {
      let busy = false
      S.forEach((s, el) => {
        s.vx = (s.vx + (s.tx - s.x) * .18) * .78; s.vy = (s.vy + (s.ty - s.y) * .18) * .78; s.x += s.vx; s.y += s.vy
        el.style.setProperty('--tx', s.x.toFixed(2) + 'px'); el.style.setProperty('--ty', s.y.toFixed(2) + 'px')
        if (Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > .05) busy = true
      })
      raf = busy ? requestAnimationFrame(loop) : 0
    }
    const mv = (e: PointerEvent) => {
      document.querySelectorAll<HTMLElement>('.mag').forEach(el => {
        const s = S.get(el) || { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }; S.set(el, s)
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
        const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * .8 + 50
        s.tx = near ? clamp(dx * .28, -18, 18) : 0; s.ty = near ? clamp(dy * .28, -18, 18) : 0
      })
      if (!raf) raf = requestAnimationFrame(loop)
    }
    addEventListener('pointermove', mv)
    return () => { removeEventListener('pointermove', mv); cancelAnimationFrame(raf) }
  }, [route])

  return <><div className="cd" /><div className="cr" /></>
}
