import { Fragment, useEffect, useRef } from 'react'
import { RM, clamp, sv } from '../lib/util'

const VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4'
// [texto, em destaque]
// duas linhas: cada frase fica inteira na mesma linha em telas largas
const HEAD: [string, boolean][][] = [[['A natureza ', false], ['renova,', true]], [['a ciência ', false], ['transforma.', true]]]

/* Hero limpo, no molde da referência: vídeo em loop com fade de 0,5 s, título em Instrument Serif e um único botão.
   Sem máscara branca em volta do vídeo, sem produto e sem textos extras: o produto aparece na vitrine logo abaixo. */
export default function Hero() {
  const vref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = vref.current!
    if (matchMedia(RM).matches) return // com movimento reduzido o vídeo não toca: fica só o fundo claro
    v.src = VIDEO
    let lo = -1, id = 0
    const loop = () => {
      // pausa quando o hero sai da tela (poupa bateria no celular)
      if (scrollY > innerHeight * 1.1 || document.hidden) { if (!v.paused) v.pause() } else if (v.paused && !v.ended) v.play().catch(() => {})
      const d = v.duration, t = v.currentTime
      let o = 1
      if (d) { if (t < .5) o = t / .5; else if (d - t < .5) o = (d - t) / .5 }
      o = clamp(+o.toFixed(3))
      if (o !== lo) { lo = o; v.style.opacity = String(o) }
      id = requestAnimationFrame(loop)
    }
    const ended = () => { v.style.opacity = '0'; lo = 0; setTimeout(() => { v.currentTime = 0; v.play().catch(() => {}) }, 100) }
    v.addEventListener('ended', ended); v.play().catch(() => {}); id = requestAnimationFrame(loop)
    return () => { v.removeEventListener('ended', ended); cancelAnimationFrame(id) }
  }, [])

  let k = 0
  return (
    <header className="hero2">
      <div className="vid" aria-hidden="true"><video ref={vref} muted playsInline preload="auto" tabIndex={-1} /></div>
      <div className="hc">
        <h1 className="hl font-display">
          {HEAD.map((ln, n) => (
            <span key={n} className="ln">{ln.map(([t, em], i) => {
              const inner = t.split(/(\s+)/).map((w, j) => w.trim() ? <span key={j} className="wd" style={sv({ '--w': k++ })}>{w}</span> : w)
              return em ? <em key={i}>{inner}</em> : <Fragment key={i}>{inner}</Fragment>
            })}</span>
          ))}
        </h1>
        <div className="hbtns animate-fade-rise" style={{ animationDelay: '.9s' }}>
          <button type="button" className="btn lg sh mag" onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: matchMedia(RM).matches ? 'auto' : 'smooth' })}>Conhecer a EcoVitalis</button>
        </div>
      </div>
    </header>
  )
}
