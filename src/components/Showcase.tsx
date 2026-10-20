import { useCallback, useEffect, useRef, useState } from 'react'
import prod from '../assets/produto.webp'
import { createCapsule, type Ctl, type Pt } from '../lib/capsule3d'
import { PARTES } from '../lib/copy'
import { RM } from '../lib/util'
import { Scramble } from './Fx'

const WIDE = '(min-width: 861px)'
const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>

/* Vitrine do produto: cápsula em 3D que gira 360° e infográfico com pontos clicáveis.
   Mouse: arraste para girar e inclinar. Toque: arraste para o lado. Teclado: setas. */
export default function Showcase() {
  const cv = useRef<HTMLCanvasElement>(null), card = useRef<HTMLDivElement>(null), lead = useRef<SVGGElement>(null), stage = useRef<HTMLDivElement>(null)
  const hs = useRef<(HTMLButtonElement | null)[]>([]), ring = useRef<SVGCircleElement>(null), deg = useRef<HTMLSpanElement>(null)
  const ctl = useRef<Ctl | null>(null), selR = useRef<number | null>(null), showR = useRef(false), last = useRef({ pts: [] as Pt[], w: 0, h: 0, sc: 1 })
  const [sel, setSel] = useState<number | null>(null), [show, setShow] = useState(false), [gl, setGl] = useState(true), [hint, setHint] = useState(true)
  const timer = useRef(0)

  /* posiciona o cartão ao lado do ponto (tela larga) e desenha a linha de ligação */
  const place = useCallback(() => {
    const c = card.current, g = lead.current, { pts, w, h, sc } = last.current, i = selR.current
    if (!c || !g) return
    if (i === null || !showR.current || !pts[i] || !matchMedia(WIDE).matches) { g.style.opacity = '0'; return }
    const p = pts[i], cw = Math.min(340, w * .34), ch = c.offsetHeight
    const left = p.x < w / 2 - 6, gap = .52 * sc + 30
    const x = left ? Math.max(14, w / 2 - gap - cw) : Math.min(w - cw - 14, w / 2 + gap)
    const y = Math.max(14, Math.min(h - ch - 14, p.y - ch / 2))
    c.style.setProperty('--cx', x.toFixed(1) + 'px'); c.style.setProperty('--cy', y.toFixed(1) + 'px'); c.style.setProperty('--cw', cw.toFixed(0) + 'px')
    const ex = left ? x + cw : x, ey = Math.max(y + 22, Math.min(y + ch - 22, p.y))
    const ln = g.firstElementChild as SVGLineElement, ed = g.lastElementChild as SVGCircleElement
    ln.setAttribute('x1', p.x.toFixed(1)); ln.setAttribute('y1', p.y.toFixed(1)); ln.setAttribute('x2', ex.toFixed(1)); ln.setAttribute('y2', ey.toFixed(1))
    ed.setAttribute('cx', ex.toFixed(1)); ed.setAttribute('cy', ey.toFixed(1)); g.style.opacity = p.v > .15 ? '1' : '0'
  }, [])

  useEffect(() => {
    const reduced = matchMedia(RM).matches
    const c = createCapsule(cv.current!, {
      hot: PARTES.map(p => p.hot), reduced, host: stage.current!, onLost: () => setGl(false),
      onUser: k => { setHint(false); if (k === 'release') { selR.current = null; showR.current = false; clearTimeout(timer.current); setShow(false); setSel(null) } },
      onFrame: (pts, w, h, ang, sc) => {
        last.current = { pts, w, h, sc }
        pts.forEach((p, i) => {
          const b = hs.current[i]; if (!b) return
          b.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`
          b.style.opacity = p.v.toFixed(2); b.style.pointerEvents = p.v > .35 ? 'auto' : 'none'; b.tabIndex = p.v > .35 ? 0 : -1
        })
        const a = ang / (Math.PI * 2)
        if (ring.current) ring.current.style.strokeDashoffset = String(1 - a)
        if (deg.current) deg.current.textContent = String(Math.round(a * 360) % 360).padStart(3, '0') + '°'
        place()
      },
    })
    ctl.current = c
    if (!c) setGl(false)
    return () => { c?.dispose(); ctl.current = null; clearTimeout(timer.current) }
  }, [place])

  const choose = (i: number | null) => {
    clearTimeout(timer.current)
    selR.current = i; showR.current = false; setShow(false); setSel(i); setHint(false)
    ctl.current?.focus(i)
    if (i !== null) timer.current = window.setTimeout(() => {
      showR.current = true; setShow(true); place()
      // no celular o cartão fica abaixo da cena: traz para a tela
      if (!matchMedia(WIDE).matches) requestAnimationFrame(() => card.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia(RM).matches ? 'auto' : 'smooth' }))
    }, matchMedia(RM).matches || !ctl.current ? 0 : 900)
  }
  const step = (d: number) => choose(sel === null ? 0 : (sel + d + PARTES.length) % PARTES.length)
  const P = sel === null ? null : PARTES[sel]

  return (
    <section id="vitrine" className="sec vt" aria-labelledby="vt-t" onKeyDown={e => { if (e.key === 'Escape' && sel !== null) choose(null) }}>
      <div className="wrap">
        <span className="chip rv"><Scramble text="Apresentação do produto" /></span>
        <h2 id="vt-t" className="h2 rv" style={{ marginTop: 18 }}>EcoVitalis, <em>a cápsula de todos os ângulos.</em></h2>
        <p className="lead rv">Arraste para girar a cápsula em 360° e toque nos pontos para entender o que cada parte faz.</p>

        <div className="vt-wrap rv">
          <div className="glass vt-stage" ref={stage}>
            <div className="vt-floor" aria-hidden="true" />
            {gl
              ? <canvas ref={cv} className="vt-cv" tabIndex={0} role="img" aria-label="Cápsula EcoVitalis em 3D. Use as setas do teclado ou arraste para girar. Home volta à posição inicial." />
              : <img className="vt-fb" src={prod} alt="Cápsula EcoVitalis" width={420} height={420} />}
            {!gl && <canvas ref={cv} hidden />}

            <svg className="vt-lead" aria-hidden="true"><g ref={lead} style={{ opacity: 0 }}><line /><circle r="4" /></g></svg>
            {gl && <div className="vt-hs">{PARTES.map((p, i) => (
              <button key={p.t} ref={el => { hs.current[i] = el }} type="button" className={'hs' + (sel === i ? ' on' : '')} aria-pressed={sel === i} aria-label={`${i + 1}. ${p.t}. Ver detalhes`} onClick={() => choose(sel === i ? null : i)}>
                <i /><b>{i + 1}</b>
              </button>))}
            </div>}

            <div className="vt-ang" aria-hidden="true">
              <svg viewBox="0 0 40 40"><circle className="t" cx="20" cy="20" r="17" /><circle className="v" ref={ring} cx="20" cy="20" r="17" pathLength={1} style={{ strokeDashoffset: 1 }} /></svg>
              <span ref={deg}>000°</span>
            </div>

            {gl && <div className="vt-ctl" role="group" aria-label="Controles da cápsula">
              <button type="button" className="vc" onClick={() => ctl.current?.spin()} aria-label="Girar 360 graus"><Icon d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" /><span>Girar 360°</span></button>
              <button type="button" className="vc ic" onClick={() => ctl.current?.nudge(0, -.2)} aria-label="Inclinar para cima"><Icon d="M6 14l6-6 6 6" /></button>
              <button type="button" className="vc ic" onClick={() => ctl.current?.nudge(0, .2)} aria-label="Inclinar para baixo"><Icon d="M6 10l6 6 6-6" /></button>
              <button type="button" className="vc" onClick={() => choose(null)} aria-label="Voltar à posição inicial"><Icon d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" /><span>Reiniciar</span></button>
            </div>}
            {hint && gl && <p className="vt-hint" aria-hidden="true"><svg viewBox="0 0 48 24"><path d="M2 12h44M8 6 2 12l6 6M40 6l6 6-6 6" /></svg>Arraste para girar</p>}
          </div>

          <div ref={card} className={'glass vt-card' + (P && show ? ' open' : '')} role="region" aria-live="polite" aria-label="Detalhe da parte selecionada" hidden={!P}>
            {P && <div key={sel} className="vc-in">
              <header><span className="num">{String((sel ?? 0) + 1).padStart(2, '0')}</span>
                <button type="button" className="xx" onClick={() => choose(null)} aria-label="Fechar detalhe"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button></header>
              <h3>{P.t}</h3>
              <p>{P.p}</p>
              <div className="chips">{P.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              <footer>
                <button type="button" className="vc ic" onClick={() => step(-1)} aria-label="Parte anterior"><Icon d="M14 6l-6 6 6 6" /></button>
                <span>{(sel ?? 0) + 1} de {PARTES.length}</span>
                <button type="button" className="vc ic" onClick={() => step(1)} aria-label="Próxima parte"><Icon d="M10 6l6 6-6 6" /></button>
                {sel === PARTES.length - 1 && <a className="btn w" href="#/produto">Ver preços</a>}
              </footer>
            </div>}
          </div>

          <nav className="vt-rail" aria-label="Partes da cápsula">
            {PARTES.map((p, i) => (
              <button key={p.t} type="button" className={'rl2' + (sel === i ? ' on' : '')} aria-pressed={sel === i} onClick={() => choose(sel === i ? null : i)}><b>{i + 1}</b><span>{p.t}</span></button>
            ))}
          </nav>
        </div>

        <div className="vt-cta rv"><a className="btn w mag" href="#/produto">Modalidades e preços</a><a className="btn g" href="#/jornada">Ver a jornada da cápsula</a></div>
      </div>
    </section>
  )
}
