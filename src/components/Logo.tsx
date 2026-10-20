import { NOME } from '../lib/logo'

/* Marca para menu e rodapé: emblema (símbolo #lf, definido em Scene.tsx) + nome vetorizado.
   Sobre fundo escuro, "Eco" fica no verde-folha da marca e "Vitality" em branco-esverdeado. */
export function Brand() {
  return (
    <>
      <svg className="lg-m" viewBox="0 0 100 100" aria-hidden="true"><use href="#lf" /></svg>
      <svg className="lg-w" viewBox={`0 0 ${NOME.w} ${NOME.h}`} role="img" aria-label="EcoVitality">
        {NOME.l.map((l, i) => <path key={i} d={l.d} fillRule="evenodd" fill={l.k === 'eco' ? '#7CB542' : '#EAF5EE'} />)}
      </svg>
    </>
  )
}
