import { useState } from 'react'
import { confetti } from '../components/ui'

const FAQ = [
  ['Precisa de licença para aplicar?', 'Em um projeto real, cada aplicação segue a regra do órgão ambiental da sua região e o aval do seu responsável técnico. Este site é uma apresentação.'],
  ['Funciona em qualquer material?', 'O líquido foi pensado para plástico, vidro e borracha. O resultado muda com o material, o clima e o local, por isso o melhor começo é uma área de teste.'],
  ['Minha equipe ainda não tem treinamento. Posso comprar?', 'Fale com a gente antes. O produto é para quem já maneja químicos fortes com segurança.'],
]

export default function Contato() {
  const [sent, setSent] = useState(false)
  const [open, setOpen] = useState(0)
  return (
    <section className="sec" style={{ paddingTop: 0 }}><div className="wrap ct">
      <div>
        <span className="chip rv">Proposta</span>
        <h1 className="h2 rv" style={{ marginTop: 18 }}>Peça uma proposta <em>para a sua área.</em></h1>
        <p className="lead rv">Conte onde a aplicação aconteceria. Respondemos com a quantidade de cápsulas que faz sentido para o primeiro teste.</p>
        <div className="rv">{FAQ.map(([q, a], i) => (
          <div key={q} className={'fq' + (open === i ? ' o' : '')}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{q}</button>
            <div className="bd"><div><p>{a}</p></div></div>
          </div>))}</div>
      </div>
      {!sent
        ? <form className="glass frm rv" onSubmit={e => { e.preventDefault(); const r = (e.currentTarget.querySelector('button[type=submit]') as HTMLElement).getBoundingClientRect(); setSent(true); confetti(r.left + r.width / 2, r.top) }}>
            <label>Nome<input name="n" required autoComplete="name" /></label>
            <label>Empresa<input name="e" required autoComplete="organization" /></label>
            <label>E-mail<input name="m" type="email" required autoComplete="email" /></label>
            <label>Que área precisa de tratamento?<textarea name="a" /></label>
            <button className="btn w lg mag sh" type="submit">Pedir proposta</button>
            <p className="note" style={{ margin: 0 }}>Este formulário é de demonstração e não envia dados.</p>
          </form>
        : <div className="glass frm" role="status"><h2 className="h2" style={{ fontSize: '2.6rem' }}>Pedido anotado.</h2><p className="lead" style={{ marginTop: 0 }}>Como o site é uma demonstração, nada foi enviado a ninguém.</p></div>}
    </div></section>
  )
}
