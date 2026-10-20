import { useEffect, useRef } from 'react'
import { LOGO, RAMO } from '../lib/logo'
import { SLOGAN } from '../lib/copy'
import { Shader } from './Fx'
import { sv } from '../lib/util'

/* Final de página com a nova logo: as duas metades do círculo se encaixam, a folha ganha a dobra, as letras sobem uma a uma,
   um brilho cruza a marca e o slogan se revela, com o ramo da marca abrindo a linha embaixo.
   Toca quando o bloco entra na tela e volta a tocar se a pessoa sair e voltar.
   O fundo é escuro e calmo: o shader aparece só como uma luz verde bem suave, sem clarão atrás do logo. */
export default function Finale() {
  const el = useRef<HTMLElement>(null)
  useEffect(() => {
    const e = el.current!
    const io = new IntersectionObserver(([x]) => {
      if (x.intersectionRatio >= .4) e.classList.add('go'); else if (!x.isIntersecting) e.classList.remove('go')
    }, { threshold: [0, .4] })
    io.observe(e)
    return () => io.disconnect()
  }, [])
  const E = LOGO.emblem
  // cada linha do slogan termina com a palavra destacada (renova, transforma)
  const word = (line: string, o: number) => {
    const ws = line.split(' ')
    return ws.map((w, k) => <span key={k}><span className={'fx fw' + (k === ws.length - 1 ? ' e' : '')} style={sv({ '--w': o + k })}>{w}</span>{' '}</span>)
  }
  const cx = (E.bb[0] + E.bb[2]) / 2, cy = (E.bb[1] + E.bb[3]) / 2
  return (
    <section className="fin" ref={el} aria-label="EcoVitality. A natureza renova, a ciência transforma.">
      <div className="fin-bg" aria-hidden="true"><Shader /></div>
      <div className="fin-in">
        <svg className="fin-logo" viewBox={`0 0 ${LOGO.w} ${LOGO.h}`} aria-hidden="true">
          <defs>
            <linearGradient id="fgd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#14783B" /><stop offset="1" stopColor="#0A5429" /></linearGradient>
            <clipPath id="fcl">
              <path d={E.dark} clipRule="evenodd" /><path d={E.leaf} clipRule="evenodd" />
              {LOGO.word.map((l, k) => <path key={k} d={l.d} clipRule="evenodd" />)}
            </clipPath>
            <linearGradient id="fsw" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#E8F6C9" stopOpacity="0" /><stop offset=".5" stopColor="#E8F6C9" stopOpacity=".7" /><stop offset="1" stopColor="#E8F6C9" stopOpacity="0" /></linearGradient>
          </defs>
          <g className="fglow"><circle cx={cx} cy={cy} r={230} fill="#4E9A32" /></g>
          <path className="fx fl d" d={E.dark} fillRule="evenodd" fill="url(#fgd)" />
          <path className="fx fl l" d={E.leaf} fillRule="evenodd" fill="#7CB542" />
          <path className="fx fl m" d={E.fold} fillRule="evenodd" fill="#488F31" />
          {LOGO.word.map((l, k) => <path key={k} className="fx fz" d={l.d} fillRule="evenodd" fill={l.k === 'eco' ? '#7CB542' : '#EAF5EE'} style={sv({ '--k': k })} />)}
          <g clipPath="url(#fcl)"><rect className="fsweep" x="-260" y="-20" width="260" height={LOGO.h + 40} fill="url(#fsw)" /></g>
        </svg>
        <p className="fin-s">
          <span className="ln">{word(SLOGAN[0], 0)}</span>
          <span className="ln">{word(SLOGAN[1], 3)}</span>
        </p>
        <svg className="fin-rule" viewBox={`0 0 ${RAMO.w + 520} ${RAMO.h}`} aria-hidden="true">
          <line className="rl1" x1="0" x2="240" y1={RAMO.h / 2} y2={RAMO.h / 2} /><line className="rl2" x1={RAMO.w + 280} x2={RAMO.w + 520} y1={RAMO.h / 2} y2={RAMO.h / 2} />
          <g transform="translate(260 0)"><path className="rsp" d={RAMO.d} fillRule="evenodd" fill="#7CB542" /></g>
        </svg>
        <div className="fin-b fx">
          <a className="btn w mag" href="#/contato">Pedir proposta</a>
          <button type="button" className="btn g" onClick={() => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>Voltar ao topo</button>
        </div>
      </div>
    </section>
  )
}
