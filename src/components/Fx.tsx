import { useEffect, useRef } from 'react'
import prod from '../assets/produto.webp'
import { COMPACT, clamp, isStatic, mkRng, sv } from '../lib/util'
import { Price } from './ui'

/* ---------- 15. Embaralhar letras: trava da esquerda para a direita ao entrar na tela ---------- */
const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
export function Scramble({ text }: { text: string }) {
  const el = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (isStatic()) return
    const e = el.current!, cs = [...text]
    let raf = 0
    const run = () => {
      const t0 = performance.now()
      const f = (n: number) => {
        const t = n - t0; let done = true
        e.textContent = cs.map((c, i) => { if (!/[\p{L}\p{N}]/u.test(c) || t > 350 + i * 45) return c; done = false; return GL[Math.random() * GL.length | 0] }).join('')
        if (!done) raf = requestAnimationFrame(f)
      }
      raf = requestAnimationFrame(f)
    }
    const io = new IntersectionObserver(([x]) => { if (x.isIntersecting) { io.disconnect(); run() } }, { threshold: .6 })
    io.observe(e)
    return () => { io.disconnect(); cancelAnimationFrame(raf); e.textContent = text }
  }, [text])
  return <span ref={el}>{text}</span>
}

/* ---------- 31. Fundo com shader (WebGL puro): fluido verde que reage ao mouse ---------- */
const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'
const FS = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/r.y, mo=(m-.5*r)/r.y, p=uv*2.1;
  for(float i=1.;i<5.;i++){p+=vec2(sin(p.y*1.3+t*.35*i+i*1.7),cos(p.x*1.1-t*.3*i))*.55/i;}
  p+=(uv-mo)*-.4*exp(-3.*length(uv-mo));
  float f=.5+.5*sin(p.x*2.+p.y*1.5+t*.25), g=smoothstep(.2,.95,f);
  vec3 col=mix(vec3(.01,.05,.03),vec3(.07,.42,.2),g);
  col=mix(col,vec3(.49,.71,.26),pow(g,5.)*.9);
  col+=vec3(.6,.85,.4)*.1*pow(1.-abs(f-.5)*2.,10.);
  col*=1.-.3*length(uv);
  gl_FragColor=vec4(col,1.);
}`
export function Shader() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (isStatic()) return
    const c = ref.current!, gl = c.getContext('webgl', { antialias: false, powerPreference: 'low-power' })
    if (!gl) return
    const mk = (ty: number, s: string) => { const o = gl.createShader(ty)!; gl.shaderSource(o, s); gl.compileShader(o); return o }
    const pr = gl.createProgram()!
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return
    gl.useProgram(pr)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
    const ur = gl.getUniformLocation(pr, 'r'), ut = gl.getUniformLocation(pr, 't'), um = gl.getUniformLocation(pr, 'm')
    let raf = 0, vis = false, m = [.5, .5]; const t0 = performance.now()
    const q = matchMedia('(pointer: coarse)').matches ? .4 : .6
    const size = () => { c.width = Math.max(2, c.clientWidth * q | 0); c.height = Math.max(2, c.clientHeight * q | 0); gl.viewport(0, 0, c.width, c.height) }
    const draw = (n: number) => {
      if (!vis) { raf = 0; return }
      gl.uniform2f(ur, c.width, c.height); gl.uniform1f(ut, (n - t0) / 1000); gl.uniform2f(um, m[0] * c.width, (1 - m[1]) * c.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3); raf = requestAnimationFrame(draw)
    }
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(draw) })
    const mv = (e: PointerEvent) => { const r = c.getBoundingClientRect(); m = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height] }
    size(); io.observe(c); addEventListener('resize', size); addEventListener('pointermove', mv)
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', size); removeEventListener('pointermove', mv); gl.deleteProgram(pr) }
  }, [])
  return <canvas ref={ref} className="shd" aria-hidden="true" />
}

/* ---------- ajuda: progresso de rolagem de uma seção "pinada" (0 a 1) ---------- */
function useProgress(ref: React.RefObject<HTMLElement>, set: (p: number, el: HTMLElement) => void, lead = 0) {
  useEffect(() => {
    const el = ref.current!; let tk = false, last = -1
    const f = () => { tk = false; const r = el.getBoundingClientRect(), ld = lead * innerHeight, v = +clamp((-r.top + ld) / Math.max(1, r.height - innerHeight + ld)).toFixed(4); if (v !== last) { last = v; set(v, el) } }
    const on = () => { if (!tk) { tk = true; requestAnimationFrame(f) } }
    f(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
}

/* ---------- 02. Galeria horizontal: rola para baixo, a fita anda para o lado ---------- */
const ITEMS: [string, string, string, string[]][] = [
  ['bt', 'Plástico', 'Garrafas e embalagens deixadas na área. O líquido foi pensado para encurtar a vida útil do plástico.', ['Vida útil mais curta']],
  ['gl', 'Vidro', 'Cacos e frascos que ficam no solo por muito tempo. Aqui, o alvo é o vidro abandonado.', ['Área poluída']],
  ['tr', 'Borracha', 'Pneus e pedaços de borracha. A aplicação espalha o produto direto sobre eles.', ['Pneus', 'Borracha']],
  ['wd', 'Carrapicho', 'Xanthium cavanillesii. Indica solo degradado, costuma ser roçado e descartado, e vira insumo.', ['Matéria-prima']],
  ['wd', 'Capim-caninha', 'Andropogon lateralis. Sai do mesmo campo que o produto ajuda a recuperar.', ['Mesmo campo']],
  ['cap', 'Pulverizador', 'A cápsula de 1 ou 5 litros encaixa no pulverizador e espalha o produto sobre a área.', ['1 litro', '5 litros']],
]
export function HGallery() {
  const box = useRef<HTMLElement>(null), tr = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current!, t = tr.current!
    const fit = () => { if (isStatic() || matchMedia(COMPACT).matches) { el.style.removeProperty('--hh'); return } el.style.setProperty('--hh', (t.scrollWidth - innerWidth + innerHeight * 1.1) + 'px') }
    fit(); addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  useProgress(box, (p, el) => {
    const t = tr.current!; el.style.setProperty('--hp', String(p))
    t.style.setProperty('--tx', (-p * Math.max(0, t.scrollWidth - innerWidth)).toFixed(1) + 'px')
  })
  return (
    <section className="hg" ref={box}><div className="hgs">
      <div className="wrap"><span className="chip rv"><Scramble text="Onde a cápsula trabalha" /></span><h2 className="h2 rv" style={{ marginTop: 18 }}>Plástico, vidro e borracha, <em>do campo ao pulverizador.</em></h2></div>
      <div className="hgt" ref={tr}>
        {ITEMS.map(([k, h, p, tags], i) => (
          <article key={h} className="glass hgc" style={sv({ '--i': i })}>
            <div className="art">{k === 'cap' ? <img src={prod} alt="Cápsula EcoVitality" width={260} height={260} /> : <svg viewBox={k === 'bt' ? '0 0 40 90' : k === 'gl' ? '0 0 60 50' : k === 'tr' ? '0 0 70 70' : '0 0 40 110'} aria-hidden="true"><use href={'#' + k} /></svg>}</div>
            <div><h3>{h}</h3><p>{p}</p><div className="chips">{tags.map(x => <span key={x} className="chip">{x}</span>)}</div></div>
          </article>
        ))}
      </div>
      <div className="hgp" aria-hidden="true"><i /></div>
    </div></section>
  )
}

/* ---------- 05. Máscara que revela: um círculo abre a área tratada sobre a poluída ---------- */
function Ground({ clean }: { clean: boolean }) {
  const g = useRef((() => {
    const r = mkRng(clean ? 11 : 5)
    return {
      deb: Array.from({ length: 11 }, (_, i) => ({ k: ['bt', 'gl', 'tr'][i % 3], x: 30 + i * 88 + r() * 30 | 0, y: 424 + r() * 90 | 0, s: .8 + r() * .5 })),
      pl: Array.from({ length: 22 }, (_, i) => ({ x: 10 + i * 45 + r() * 24 | 0, y: 420 + r() * 120 | 0, s: .8 + r() * .9 })),
      st: Array.from({ length: 30 }, () => ({ x: r() * 1000 | 0, y: 60 + r() * 330 | 0, r: (.7 + r() * 1.6).toFixed(1), d: (r() * 4).toFixed(1) })),
    }
  })()).current
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={clean ? 'ms2' : 'ms1'} x1="0" y1="0" x2="0" y2="1">{clean ? <><stop offset="0" stopColor="#06150e" /><stop offset="1" stopColor="#164a31" /></> : <><stop offset="0" stopColor="#0d0c09" /><stop offset="1" stopColor="#33302a" /></>}</linearGradient>
        <radialGradient id="msg"><stop offset="0" stopColor="#7CB542" stopOpacity=".6" /><stop offset="1" stopColor="#7CB542" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1000" height="600" fill={`url(#${clean ? 'ms2' : 'ms1'})`} />
      {clean && <ellipse cx="500" cy="470" rx="620" ry="200" fill="url(#msg)" />}
      {!clean && <ellipse cx="500" cy="440" rx="560" ry="90" fill="#a09478" opacity=".22" />}
      <rect y="470" width="1000" height="140" fill={clean ? '#0f3322' : '#1a1914'} />
      {g.st.map((s, i) => <circle key={i} className="tw" cx={s.x} cy={s.y} r={s.r} style={sv({ animationDelay: `-${s.d}s` })} />)}
      {clean
        ? g.pl.map((p, i) => <use key={i} href="#sp" x={p.x} y={p.y - 56 * p.s} width={30 * p.s} height={44 * p.s} />)
        : g.deb.map((d, i) => <use key={i} href={'#' + d.k} x={d.x} y={d.y - 60 * d.s} width={(d.k === 'bt' ? 34 : d.k === 'gl' ? 58 : 60) * d.s} height={(d.k === 'bt' ? 76 : d.k === 'gl' ? 46 : 60) * d.s} opacity=".9" />)}
    </svg>
  )
}
export function MaskReveal() {
  const box = useRef<HTMLElement>(null)
  useProgress(box, (p, el) => el.style.setProperty('--m', String(clamp(p * 1.25))))
  return (
    <section className="mk" ref={box}><div className="mks">
      <div className="mkl"><Ground clean={false} /></div>
      <div className="mkl mkc"><Ground clean /></div>
      <div className="mkt">
        <div className="glass"><span className="chip"><Scramble text="Antes e depois" /></span><h2 className="h2">A mesma área, <em>antes e depois.</em></h2><p className="lead" style={{ marginTop: 0 }}>Role para abrir o círculo. Ilustração do conceito do produto.</p></div>
      </div>
      <span className="mkb l chip">Área poluída</span><span className="mkb r chip">Área tratada</span>
    </div></section>
  )
}

/* ---------- 25. Gráfico de barras: preço por litro de cada modalidade contra o preço do litro no Pro ---------- */
export type BarRow = { name: string; vol: string; perL: string; pct: number; v: number }
export function SavingsBars({ rows }: { rows: BarRow[] }) {
  return (
    <div className="glass bars sv4 rv">
      {rows.map((r, j) => (
        <div key={r.name} className="bar" style={sv({ '--v': r.v, '--j': j })}>
          <div className="col"><span className="gh" /><i /><b className={'off' + (r.pct ? '' : ' base')}>{r.pct ? '\u2212' + r.pct + '%' : 'Preço base'}</b></div>
          <div className="bl"><p className="sub">{r.name}</p><Price text={r.perL} /><p className="sub">por litro, {r.vol}</p></div>
        </div>
      ))}
    </div>
  )
}
