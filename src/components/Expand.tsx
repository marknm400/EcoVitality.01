import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as RPE } from 'react'
import { createPortal } from 'react-dom'
import { MARCA, PESQUISA } from '../lib/copy'
import { RM, sv } from '../lib/util'
import { Price } from './ui'
import { Scramble } from './Fx'

const DWELL = 2000 // tempo com o cursor em cima antes de expandir
type Rect = { left: number; top: number; width: number; height: number }
const box = (r: DOMRect | Rect): Rect => ({ left: r.left, top: r.top, width: r.width, height: r.height })
const px = (r: Rect) => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' })
const EASE = 'cubic-bezier(.2,.8,.2,1)'

/* Janela que nasce do card (naocodei 22): o card vira um painel grande com a pesquisa */
function Panel({ i, from, mode, onDone }: { i: number; from: () => Rect; mode: 'hover' | 'click'; onDone: () => void }) {
  const bx = useRef<HTMLDivElement>(null), closeBtn = useRef<HTMLButtonElement>(null)
  const [on, setOn] = useState(false), [out, setOut] = useState(false)
  const closing = useRef(false), inside = useRef(false), leaveT = useRef(0), t0 = useRef(0)
  const R = PESQUISA[i], words = R.p.split(' ')
  const dur = (n: number) => matchMedia(RM).matches ? 0 : n

  useLayoutEffect(() => {
    const b = bx.current!, h = document.documentElement
    // cancela qualquer animação anterior antes de medir (o React em modo de desenvolvimento roda este efeito duas vezes,
    // e a animação da primeira vez fazia a medição da altura real do conteúdo sair errada)
    b.getAnimations().forEach(x => x.cancel()); b.classList.remove('rdy')
    const sb = innerWidth - h.clientWidth
    h.style.setProperty('--sbw', sb + 'px'); h.classList.add('lock')
    const W = Math.min(940, innerWidth - 24)
    b.style.cssText = `left:0;top:0;width:${W}px;height:auto`
    const H = Math.min(b.getBoundingClientRect().height, innerHeight * .9)
    const to: Rect = { left: (innerWidth - W) / 2, top: (innerHeight - H) / 2, width: W, height: H }
    Object.assign(b.style, px(to))
    const a = b.animate([px(from()), px(to)], { duration: dur(720), easing: EASE })
    a.onfinish = () => b.classList.add('rdy')
    t0.current = performance.now()
    const t = setTimeout(() => setOn(true), dur(380))
    closeBtn.current?.focus({ preventScroll: true })
    return () => { clearTimeout(t); a.cancel(); h.classList.remove('lock'); h.style.removeProperty('--sbw') }
  }, [])

  const close = () => {
    if (closing.current) return
    closing.current = true; setOn(false); setOut(true)
    const b = bx.current!; b.classList.remove('rdy')
    const a = b.animate([px(box(b.getBoundingClientRect())), px(from())], { duration: dur(520), easing: EASE, fill: 'forwards' })
    a.onfinish = onDone
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') { e.preventDefault(); closeBtn.current?.focus() } }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [])

  // aberto pelo mouse: fecha quando o cursor sai do painel (depois que ele já esteve dentro)
  const move = () => { if (performance.now() - t0.current > 800) inside.current = true; clearTimeout(leaveT.current) }
  const leave = () => { if (mode === 'hover' && inside.current) leaveT.current = window.setTimeout(close, 450) }

  return createPortal(
    <div className={'xo' + (out ? ' out' : '')} onClick={e => { if (e.target === e.currentTarget) close() }}>
      <div className="glass xp" ref={bx} role="dialog" aria-modal="true" aria-label={R.t} onPointerMove={move} onPointerLeave={leave} onPointerEnter={move}>
        <div className={'xc' + (on ? ' on in' : '')} style={sv({ '--nw': words.length })}>
          <header className="xh">
            <span className="chip"><Scramble text={`Pesquisa 0${i + 1}`} /></span>
            <button ref={closeBtn} type="button" className="xx" onClick={close} aria-label="Fechar pesquisa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
          </header>
          <div className="xt"><Price text={'0' + (i + 1)} cls="num xn" /><h3>{R.t}</h3></div>
          <p className="xb">{words.map((w, k) => <span key={k}><span className="xw" style={sv({ '--k': k })}>{w}</span>{' '}</span>)}</p>
          <div className="xcx">
            <div className="xlab"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#lf" /></svg>A conexão com a {MARCA}</div>
            <p>{R.c.charAt(0).toUpperCase() + R.c.slice(1)}</p>
          </div>
          <p className="xk">Esc ou clique fora para fechar</p>
        </div>
      </div>
    </div>, document.body)
}

/* Card do processo: 2 s com o mouse em cima (com anel mostrando o tempo), clique, toque ou Enter expandem */
export function ProcessCard({ i, h, p }: { i: number; h: string; p: string }) {
  const card = useRef<HTMLElement>(null)
  const [mode, setMode] = useState<null | 'hover' | 'click'>(null), [dwell, setDwell] = useState(false)
  const timer = useRef(0), cool = useRef(false)
  // cool: depois de fechar, o cursor precisa sair do card antes de contar os 2 s de novo
  const stop = () => { clearTimeout(timer.current); setDwell(false); cool.current = false }
  const enter = (e: RPE) => {
    if (e.pointerType !== 'mouse' || mode || cool.current) return
    setDwell(true); timer.current = window.setTimeout(() => { setDwell(false); setMode('hover') }, DWELL)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  const open = () => { stop(); setMode(m => m || 'click') }
  return (
    <>
      {/* O estado (contagem e card aberto) vai em atributos data-*, nunca na className: o React reescreve a className inteira
          e apagaria a classe "in" que a animação de revelar coloca no card, fazendo o card sumir. */}
      <article ref={card} className="glass tilt pc5 rv" data-dw={dwell ? '' : undefined} data-lifted={mode ? '' : undefined} style={sv({ '--i': i + 1 })}
        tabIndex={0} role="button" aria-haspopup="dialog" aria-expanded={!!mode} aria-label={`${h}. Abrir a pesquisa ${i + 1}`}
        onPointerEnter={enter} onPointerLeave={stop} onClick={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}>
        <div><h3>{h}</h3><p>{p}</p></div>
        <div className="pcf"><Price text={'0' + (i + 1)} cls="num" /><span className="hint">Ler a pesquisa</span></div>
        <svg className="dring" aria-hidden="true"><rect pathLength={1} /></svg>
      </article>
      {mode && <Panel i={i} mode={mode} from={() => box(card.current!.getBoundingClientRect())} onDone={() => {
          // o painel pousa exatamente sobre o card: devolve o card sem fade, para não haver "piscada" entre os dois
          cool.current = true
          const c = card.current
          if (c) c.style.transition = 'none'
          setMode(null)
          requestAnimationFrame(() => requestAnimationFrame(() => { if (c) { c.style.transition = ''; c.focus({ preventScroll: true }) } }))
        }} />}
    </>
  )
}
