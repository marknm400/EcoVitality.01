import { useEffect, useRef } from 'react'
import Scene from './Scene'
import { Shader } from './Fx'
import { GATES, clamp, sv } from '../lib/util'

/* Jornada da cápsula: o progresso da rolagem (--p) conduz toda a cena */
export default function Journey() {
  const heroRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = stageRef.current!, hero = heroRef.current!, intro = introRef.current!
    const mqs = GATES.map(q => matchMedia(q))
    let tgt = 0, shown = 0, raf = 0, last = 0, lp = -1, st = false
    const setP = (v: number) => { if (v === lp) return; lp = v; stage.style.setProperty('--p', String(v)); intro.toggleAttribute('inert', v > .12) }
    const tick = (n: number) => {
      const dt = Math.min(100, n - (last || n)); last = n
      shown += (tgt - shown) * (1 - Math.pow(.84, dt / 16.667))
      if (Math.abs(tgt - shown) < .0005) { shown = tgt; raf = 0; last = 0 } else raf = requestAnimationFrame(tick)
      setP(+shown.toFixed(4))
    }
    const onScroll = () => {
      if (st) return
      const b = hero.getBoundingClientRect()
      tgt = clamp(-b.top / Math.max(1, b.height - innerHeight))
      if (!raf && b.bottom > 0) raf = requestAnimationFrame(tick)
    }
    const mode = () => {
      st = mqs.some(m => m.matches)
      if (st) { cancelAnimationFrame(raf); raf = 0; shown = tgt = 1; setP(1) } else { lp = -1; onScroll() }
    }
    mqs.forEach(m => m.addEventListener('change', mode)); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll)
    mode()
    return () => { mqs.forEach(m => m.removeEventListener('change', mode)); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <header className="jhero" ref={heroRef}>
      <div className="jstage" ref={stageRef}>
        <div className="jsh"><Shader /></div>
        <div className="smog" />
        <Scene />
        <div className="jintro" ref={introRef}>
          <span className="chip">A jornada da cápsula</span>
          <h1 className="font-display">Da planta <em>descartada</em> ao <em>solo vivo.</em></h1>
          <p>Role para descer ao solo e ver a cápsula trabalhar.</p>
        </div>
        <div className="jcap glass" style={sv({ '--a': .14, '--b': .28 })}><div className="num">01</div><h3>O descarte</h3><p>O carrapicho e o capim-caninha crescem onde o solo está cansado. Hoje são roçados e jogados fora.</p></div>
        <div className="jcap r glass" style={sv({ '--a': .3, '--b': .52 })}><div className="num">02</div><h3>A matéria-prima</h3><p>Aqui eles viram o líquido da cápsula, tirado do mesmo campo que ele ajuda a recuperar.</p></div>
        <div className="jcap glass" style={sv({ '--a': .56, '--b': .8 })}><div className="num">03</div><h3>A aplicação</h3><p>Pulverizado sobre a área poluída, ele encurta a vida útil do plástico, do vidro e da borracha.</p></div>
        <div className="jcap jfin r glass" style={sv({ '--a': .88, '--b': 9 })}>
          <div className="num">04</div><h2>O mato que o solo deixou crescer limpa o que ficou.</h2>
          <div><a className="btn w" href="#/produto">Ver preços</a><a className="btn g" href="#/contato">Pedir proposta</a></div>
        </div>
        <div className="jbar" aria-hidden="true"><i /></div>
        <ol className="jtl" aria-hidden="true">{['O descarte', 'A matéria-prima', 'A aplicação', 'O solo vivo'].map((t, i) => <li key={t} style={sv({ '--a': [.14, .3, .56, .88][i] })}><i /><span>{t}</span></li>)}</ol>
        <svg className="jring" viewBox="0 0 36 36" aria-hidden="true"><circle className="t" cx="18" cy="18" r="15.5" /><circle className="v" cx="18" cy="18" r="15.5" pathLength={1} /></svg>
      </div>
    </header>
  )
}
