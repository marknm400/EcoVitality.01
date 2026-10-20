import { useEffect, useRef } from 'react'
import Finale from './Finale'
import { Brand } from './Logo'

const LINKS: [string, string][] = [['/', 'Início'], ['/jornada', 'Jornada'], ['/produto', 'Produto'], ['/contato', 'Contato']]

export function Nav({ route }: { route: string }) {
  return (
    <nav className="nv">
      <a className="lg" href="#/" aria-label="EcoVitality, início"><Brand /></a>
      <div className="mn">{LINKS.map(([p, t]) => <a key={p} href={'#' + p} className={route === p ? 'on' : ''}>{t}</a>)}</div>
      <a className="btn" href="#/contato">Pedir proposta</a>
    </nav>
  )
}

/* Linha de raiz que se desenha com a rolagem */
export function Rail() {
  const path = useRef<SVGPathElement>(null)
  useEffect(() => {
    let l = -1
    const f = () => {
      const s = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight), v = +(1 - Math.min(1, s)).toFixed(3)
      if (v !== l) { l = v; path.current!.style.strokeDashoffset = String(v) }
    }
    f(); addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])
  return <svg className="rail" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true"><path ref={path} pathLength={1} strokeDasharray={1} strokeDashoffset={1} d="M20 0C4 120 36 200 20 320S4 520 20 640 36 840 20 1000" /></svg>
}

/* Chamada para proposta: vidro escuro, emblema da marca como marca d'água que gira devagar e luz suave.
   Sem shader nem manchas desfocadas, para o card ficar limpo em qualquer tela. */
function Cta() {
  return (
    <div className="glass cta2 rv">
      <svg className="cta2-m" viewBox="0 0 100 100" aria-hidden="true"><use href="#lf" /></svg>
      <div className="cta2-t">
        <h2 className="h2">Leve a EcoVitality <em>para a sua área.</em></h2>
        <p className="lead">Conte onde a aplicação aconteceria e peça uma proposta para o primeiro teste.</p>
      </div>
      <div className="cta2-a">
        <a className="btn w lg sh mag" href="#/contato">Pedir proposta</a>
        <a className="btn g" href="#/produto">Ver modalidades</a>
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <Cta />
        <div className="fcols">
          <div><a className="lg" href="#/" aria-label="EcoVitality, início"><Brand /></a><p style={{ marginTop: 12, maxWidth: '34ch' }}>Cápsulas para pulverizador feitas de biomassa que seria descartada.</p></div>
          <div><h4>Páginas</h4>{LINKS.map(([p, t]) => <a key={p} href={'#' + p}>{t}</a>)}</div>
          <div><h4>Produto</h4><a href="#/produto">Modalidades e preços</a><a href="#/jornada">A jornada da cápsula</a><a href="#/contato">Pedir proposta</a></div>
        </div>
      </div>
      <Finale />
      <div className="wrap"><div className="fbot">EcoVitality. Site de apresentação, com preços fictícios.</div></div>
    </footer>
  )
}
