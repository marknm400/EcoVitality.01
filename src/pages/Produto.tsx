import { useState } from 'react'
import { Price } from '../components/ui'
import { SavingsBars, Scramble } from '../components/Fx'
import { MARCA, MODS, brl } from '../lib/copy'
import { sv } from '../lib/util'

const Ck = ({ j }: { j: number }) => <span className="ck" style={sv({ '--j': j })}><svg viewBox="0 0 12 12"><path d="M2 6.4 4.8 9 10 3" /></svg></span>
const MAX = Math.max(...MODS.map(m => m.pct))
const BULK = MODS[MODS.length - 1]

export default function Produto() {
  const [perL, setPerL] = useState(false)
  return (
    <>
      <section style={{ paddingBottom: 0 }}><h1 className="giant" aria-label="Preços">Preços</h1></section>
      <section className="sec" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="tgw rv"><div className="tg"><span>Por embalagem</span><button className="tgl" role="switch" aria-checked={perL} aria-label="Mostrar preço por litro" onClick={() => setPerL(v => !v)}><i /></button><span>Por litro</span></div></div>

        <div className="prices p4" style={{ marginTop: 0 }}>
          {MODS.map((m, i) => {
            const best = i === MODS.length - 1
            return (
              <article key={m.nome} className={'glass tilt pcard rv' + (best ? ' hi' : '')} style={sv({ '--i': i })}>
                {best && <span className="ribbon">Maior economia</span>}
                <div className="ph"><div><p className="sub">{MARCA}</p><h3>{m.nome}</h3></div><span className={'off' + (m.pct ? '' : ' base')}>{m.pct ? '\u2212' + m.pct + '%' : 'Preço base'}</span></div>
                <div>
                  <Price text={brl(perL ? m.perL : m.cents)} />
                  <p className="sub" style={{ marginTop: 6 }}>{perL ? 'por litro' : 'por embalagem'} · {m.vl}</p>
                </div>
                <div className="meter" style={sv({ '--d': m.pct / MAX })}>
                  <p className="sub">{m.pct ? `${m.pct}% de desconto no litro` : 'Preço de referência do litro'}</p>
                  <div className="dbar"><i /></div>
                </div>
                <ul className="ckl">
                  <li><Ck j={0} />{m.vl} por embalagem</li>
                  <li><Ck j={1} />{brl(m.perL)} por litro</li>
                  <li><Ck j={2} />{m.save ? `Economia de ${brl(m.save)} frente a ${m.vol} Pro` : 'Para começar e testar uma área'}</li>
                </ul>
                <a className={'btn mag ' + (best ? 'w sh' : 'g')} href="#/contato">Pedir {m.nome}</a>
              </article>
            )
          })}
        </div>

        <div className="glass custom rv">
          <div><h3>Projeto sob medida</h3><p className="sub">Quantidade definida para a sua área. Começa por uma área de teste e conversa com a sua equipe técnica.</p></div>
          <a className="btn g mag" href="#/contato">Falar com a equipe</a>
        </div>

        <div className="glass tbl rv"><table>
          <thead><tr><th>Modalidade</th><th>Volume/quantidade</th><th className="r">Preço sugerido</th><th className="r">Preço por litro</th><th>Desconto por quantidade</th></tr></thead>
          <tbody>
            {MODS.map((m, j) => (
              <tr key={m.nome}>
                <td>{m.full}</td><td>{m.vl}</td><td className="r">{brl(m.cents)}</td><td className="r">{brl(m.perL)}</td>
                <td><div className="dc"><span className={'off' + (m.pct ? '' : ' base')}>{m.pct ? '\u2212' + m.pct + '%' : 'Base'}</span><div className="dbar" style={sv({ '--d': m.pct / MAX, '--j': j })}><i /></div></div></td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <p className="note">Desconto e economia calculados contra comprar o mesmo volume em embalagens de 1 litro ({MARCA} Pro). Preços fictícios, de apresentação.</p>

        <div style={{ marginTop: 'clamp(70px,10vw,120px)' }}>
          <span className="chip rv"><Scramble text="Desconto por quantidade" /></span>
          <h2 className="h2 rv" style={{ marginTop: 18 }}>Quanto maior a modalidade, <em>mais barato o litro.</em></h2>
        </div>
        <SavingsBars rows={MODS.map(m => ({ name: m.full, vol: m.vl, perL: brl(m.perL), pct: m.pct, v: m.perL / MODS[0].perL }))} />
        <div className="glass sav rv">
          <p className="sub">Com o {BULK.full} no lugar de {BULK.vol} embalagens Pro, você economiza</p>
          <Price text={brl(BULK.save)} cls="price big" />
        </div>
      </div></section>
    </>
  )
}
