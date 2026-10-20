import Hero from '../components/Hero'
import { FillText, Price } from '../components/ui'
import { sv } from '../lib/util'
import { HGallery, MaskReveal, Scramble } from '../components/Fx'
import { ProcessCard } from '../components/Expand'
import Showcase from '../components/Showcase'
import { WHY } from '../lib/copy'

const PROC = [
  ['Coleta', 'Carrapicho e capim-caninha, roçados em vez de descartados.'],
  ['Concentrado', 'A biomassa vira um líquido, envasado em cápsulas de 1 e 5 litros.'],
  ['Encaixe', 'A cápsula se acopla a um pulverizador.'],
  ['Aplicação', 'O líquido é espalhado sobre a área poluída.'],
  ['Solo', 'Plástico, vidro e borracha com vida útil mais curta.'],
]
const WORDS = ['Plástico', 'Vidro', 'Borracha', 'Carrapicho', 'Capim-caninha', 'Solo vivo', 'Biomassa']

export default function Home() {
  return (
    <>
      <Hero />
      <section className="sec ctx"><div className="wrap"><FillText text="O mato que seria jogado fora guarda o que o solo precisa para se recuperar. A EcoVitality leva isso até a área poluída, dentro de uma cápsula." /></div></section>
      <Showcase />
      <section className="sec cen" style={{ paddingTop: 0 }}><div className="wrap"><h2 className="h2 rv">Feita para encurtar a vida útil do <span className="sw"><span><b>plástico</b><b>vidro</b><b>borracha</b><b>plástico</b></span></span></h2></div></section>
      <div className="mq" aria-hidden="true"><div>{[0, 1].map(n => <span key={n}>{WORDS.map(w => <span key={w}>{w}<i /></span>)}</span>)}</div></div>
      <section className="sec"><div className="wrap">
        <span className="chip rv"><Scramble text="O processo" /></span>
        <h2 className="h2 rv" style={{ marginTop: 18 }}>Do roçado ao pulverizador, <em>em cinco passos.</em></h2>
        <div className="g5">
          <div className="glass tilt pc5 t rv"><h3>O processo</h3><a className="btn w mag" href="#/jornada" style={{ justifySelf: 'start' }}>Ver a jornada →</a></div>
          {PROC.map(([h, p], i) => <ProcessCard key={h} i={i} h={h} p={p} />)}
        </div>
      </div></section>
      <HGallery />
      <MaskReveal />
      <section className="sec"><div className="wrap">
        <span className="chip rv"><Scramble text="Por que a EcoVitality" /></span>
        <h2 className="h2 rv" style={{ marginTop: 18 }}>Do descarte <em>à inovação ambiental.</em></h2>
        <div className="stk">
          {WHY.map(({ n, t, s: sub, p, tags }, i) => (
            <div key={n} className="glass rv" style={sv({ '--i': i })}>
              <Price text={n} cls="num" />
              <div><h3>{t}</h3><p className="sb">{sub}</p><p>{p}</p><div className="chips">{tags.map(x => <span key={x} className="tag">{x}</span>)}</div></div>
            </div>
          ))}
        </div>
      </div></section>
      <section className="dome" aria-labelledby="dm">
        <div className="orbit">{[0, 70, 150, 230, 300].map(a => <i key={a} style={sv({ '--a': a + 'deg' })} />)}</div>
        <div className="orbit b">{[30, 120, 200, 280].map(a => <i key={a} style={sv({ '--a': a + 'deg' })} />)}</div>
        <div className="dmc">
          <span className="chip rv"><Scramble text="A jornada da cápsula" /></span>
          <h2 id="dm" className="h2 rv">Veja a cápsula <em>trabalhar.</em></h2>
          <p className="lead rv" style={{ marginTop: 0 }}>Uma descida animada: da planta descartada ao solo vivo, em quatro etapas.</p>
          <a className="btn w lg sh mag rv" href="#/jornada">Abrir a jornada</a>
        </div>
      </section>
    </>
  )
}
