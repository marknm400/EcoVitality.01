import { useMemo } from 'react'
import prod from '../assets/produto.webp'
import { mkRng, sv } from '../lib/util'
import { EMB } from '../lib/logo'

type Deb = [number, string, number, number]
const DEB: Deb[] = [[110, 'bt', 34, 76], [245, 'gl', 58, 46], [375, 'tr', 60, 60], [640, 'bt', 34, 76], [760, 'gl', 58, 46], [885, 'tr', 60, 60]]

export function Defs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs>
      <symbol id="lf" viewBox={`0 0 ${EMB.w} ${EMB.h}`}><path d={EMB.dark} fill="#116A34" fillRule="evenodd" /><path d={EMB.leaf} fill="#7CB542" fillRule="evenodd" /><path d={EMB.fold} fill="#488F31" fillRule="evenodd" /></symbol>
      <symbol id="wd" viewBox="0 0 40 110"><path d="M20 110V14" stroke="#5f8f45" strokeWidth="3" fill="none" /><path d="M20 70C4 66 2 52 4 44c12 2 16 12 16 26ZM20 50C36 46 38 32 36 24c-12 2-16 12-16 26ZM20 30C10 26 10 16 12 10c8 2 8 10 8 20Z" fill="#7aa856" /><circle cx="20" cy="12" r="5" fill="#a58a4e" /></symbol>
      <symbol id="bt" viewBox="0 0 40 90"><rect x="8" y="22" width="24" height="66" rx="6" fill="#9cc7d6" stroke="#2a5566" strokeWidth="3" /><rect x="14" y="4" width="12" height="20" rx="3" fill="#9cc7d6" stroke="#2a5566" strokeWidth="3" /></symbol>
      <symbol id="gl" viewBox="0 0 60 50"><path d="M4 46 20 4 34 30 48 10 56 46Z" fill="#b9e0d0" stroke="#2f6a58" strokeWidth="3" strokeLinejoin="round" /></symbol>
      <symbol id="tr" viewBox="0 0 70 70"><circle cx="35" cy="35" r="27" fill="none" stroke="#2a312c" strokeWidth="14" /></symbol>
      <symbol id="sp" viewBox="0 0 30 44"><path d="M15 44V20" stroke="#2f8a57" strokeWidth="3" fill="none" /><path d="M15 24C4 24 3 12 3 8c10 0 12 6 12 16Z" fill="#7CB542" /><path d="M15 18C26 18 27 8 27 4c-10 0-12 5-12 14Z" fill="#116A34" /></symbol>
    </defs></svg>
  )
}

export default function Scene() {
  const g = useMemo(() => {
    const r = mkRng(7)
    const weeds = Array.from({ length: 14 }, (_, i) => ({ x: 14 + i * 72 + Math.floor(r() * 20), y: 318 + Math.floor(r() * 14), d: (.03 + r() * .09).toFixed(3), rot: (r() < .5 ? -1 : 1) * (55 + Math.floor(r() * 30)) }))
    const extra = Array.from({ length: 9 }, (_, i) => ({ x: 30 + i * 110 + Math.floor(r() * 40), y: 436 + Math.floor(r() * 20), d: (.04 + r() * .1).toFixed(2) }))
    const spray = Array.from({ length: 22 }, () => ({ r: (2 + r() * 3).toFixed(1), x: Math.floor((r() - .5) * 230), dl: (r() * 1.4).toFixed(2) }))
    const spores = Array.from({ length: 16 }, () => ({ cx: 30 + Math.floor(r() * 940), cy: 380 + Math.floor(r() * 50), r: (1.5 + r() * 1.8).toFixed(1), t: (5 + r() * 5).toFixed(1), dx: Math.floor((r() - .5) * 90), dl: (r() * 8).toFixed(1) }))
    const stars = Array.from({ length: 44 }, () => ({ cx: Math.floor(r() * 1000), cy: Math.floor(r() * 380), r: (.6 + r() * 1.4).toFixed(1), dl: (r() * 4).toFixed(1) }))
    return { weeds, extra, spray, spores, stars }
  }, [])
  return (
    <svg className="scene" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="gd2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="g0" /><stop offset="1" className="g1" /></linearGradient>
        <radialGradient id="cg"><stop offset="0" stopColor="#7CB542" stopOpacity=".55" /><stop offset="1" stopColor="#7CB542" stopOpacity="0" /></radialGradient>
      </defs>
      <g>{g.stars.map((s, i) => <circle key={i} className="tw" cx={s.cx} cy={s.cy} r={s.r} style={sv({ animationDelay: `-${s.dl}s` })} />)}</g>
      <rect x="0" y="432" width="1000" height="220" fill="url(#gd2)" />
      <g id="spores" fill="#7CB542">{g.spores.map((s, i) => <circle key={i} cx={s.cx} cy={s.cy} r={s.r} style={sv({ '--t': s.t + 's', '--dx': s.dx + 'px', animationDelay: `-${s.dl}s` })} />)}</g>
      <g>{g.weeds.map((w, i) => <g key={i} transform={`translate(${w.x} ${w.y})`}><g className="w" style={sv({ '--d': w.d, '--r': w.rot })}><use href="#wd" width={48} height={120} /></g></g>)}</g>
      <g>
        {DEB.map(([x, k, w, h], i) => { const d = (i * .02).toFixed(2); return (
          <g key={i}>
            <g transform={`translate(${x} ${432 - h + 6})`}><g className="db" style={sv({ '--d': d })}><use href={'#' + k} width={w} height={h} /></g></g>
            <g transform={`translate(${x + w / 2 - 15} ${432 - 44})`}><g className="sp" style={sv({ '--d': d })}><use href="#sp" width={30} height={44} /></g></g>
          </g>) })}
        {g.extra.map((e, i) => <g key={i} transform={`translate(${e.x} ${e.y})`}><g className="sp" style={sv({ '--d': e.d })}><use href="#sp" width={24} height={36} /></g></g>)}
      </g>
      <use className="lf" href="#lf" x={420} y={120} width={160} height={160} />
      <circle className="cglow" cx={500} cy={150} r={230} fill="url(#cg)" />
      <g className="cs"><g className="bob"><image href={prod} x={-150} y={-150} width={300} height={300} transform="rotate(135)" /></g></g>
      <g className="spray" transform="translate(500 296)" fill="#D2EBAA">
        {g.spray.map((s, i) => <circle key={i} r={s.r} style={sv({ '--x': s.x + 'px', animationDelay: `-${s.dl}s` })} />)}
      </g>
      <g className="rip2" transform="translate(500 438)">{[0, 1, 2].map(i => <ellipse key={i} className="rpl" rx={18} ry={5} style={sv({ animationDelay: `-${i * .8}s` })} />)}</g>
    </svg>
  )
}
