import { EMB, NOME } from './logo'

/* Cápsula EcoVitalis em 3D, feita em WebGL puro (sem biblioteca extra).
   A forma é uma superfície de revolução desenhada a partir do perfil da imagem enviada:
   base prateada, faixa verde, rótulo escuro com a folha, faixa verde, ombro, pescoço e bico de acoplamento.
   O rótulo é uma textura desenhada na hora (com a logo vetorizada), então fica nítido em qualquer tela. */

export type Hot = { p: [number, number, number]; n: [number, number, number]; yaw: number; pitch: number; zoom: number; fy: number }
export type Pt = { x: number; y: number; v: number }
export type Opts = { hot: Hot[]; reduced: boolean; onFrame: (pts: Pt[], w: number, h: number, ang: number, sc: number) => void; onUser: (k: 'drag' | 'release' | 'ctl') => void; onLost?: () => void; host?: HTMLElement }
export type Ctl = {
  focus: (i: number | null) => void
  nudge: (dyaw: number, dpitch: number) => void
  spin: () => void
  reset: () => void
  dispose: () => void
  angle: () => number
}

const TAU = Math.PI * 2
const R = 0.5, H = 3.86, YC = H / 2
const LAB0 = 0.86, LAB1 = 2.3 // trecho do rótulo (y, antes de centralizar)

/* ---------- perfil (r, y) em tiras; m = material: 0 prata, 1 faixa verde, 2 rótulo, 3 metal escuro ---------- */
type P2 = [number, number]
type Strip = { m: number; pts: P2[]; v0?: number; v1?: number }
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number): P2[] {
  return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as P2 })
}
function profile(): Strip[] {
  const S: Strip[] = []
  // base: cúpula + anel
  S.push({ m: 0, pts: [...arc(0, 0.32, R, 0.32, -Math.PI / 2, 0, 18), [R, 0.62]] })
  // faixa verde inferior (levemente saliente)
  S.push({ m: 1, pts: [[R, 0.62], [R * 1.012, 0.64], [R * 1.012, 0.84], [R, 0.86]] })
  // rótulo
  S.push({ m: 2, pts: [[R, LAB0], [R, LAB0 + 0.001], [R, LAB1 - 0.001], [R, LAB1]], v0: 0, v1: 1 })
  // faixa verde superior
  S.push({ m: 1, pts: [[R, LAB1], [R * 1.012, LAB1 + 0.02], [R * 1.012, 2.52], [R, 2.54]] })
  // anel + ombro arredondado até o pescoço
  S.push({ m: 0, pts: [[R, 2.54], [R, 2.7], ...arc(0.19, 2.7, R - 0.19, 0.44, 0, Math.PI / 2, 20).slice(1)] })
  // pescoço, flange, haste
  S.push({ m: 0, pts: [[0.19, 3.14], [0.19, 3.38], [0.25, 3.38], [0.25, 3.44], [0.15, 3.44], [0.15, 3.62]] })
  // tampa do bico: disco com borda arredondada e rebaixo central
  const cap: P2[] = [[0.15, 3.62], [0.3, 3.62], ...arc(0.3, 3.67, 0.08, 0.05, -Math.PI / 2, 0, 6).slice(1), [0.38, 3.8], ...arc(0.33, 3.8, 0.05, 0.06, 0, Math.PI / 2, 6).slice(1), [0.26, 3.86]]
  S.push({ m: 0, pts: cap })
  S.push({ m: 3, pts: [[0.26, 3.86], [0.25, 3.84], [0.2, 3.83], [0, 3.83]] })
  return S
}
function build(seg: number) {
  const V: number[] = [], I: number[] = []
  for (const s of profile()) {
    const n = s.pts.length, base = V.length / 9
    // comprimento acumulado para o v do rótulo
    const lab = s.m === 2
    for (let i = 0; i < n; i++) {
      const a = s.pts[Math.max(0, i - 1)], b = s.pts[Math.min(n - 1, i + 1)]
      let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l
      const nr = ty, ny = -tx, [r, y] = s.pts[i]
      const v = lab ? (y - LAB0) / (LAB1 - LAB0) : 0
      for (let j = 0; j <= seg; j++) {
        const th = -Math.PI + TAU * j / seg, sn = Math.sin(th), cs = Math.cos(th)
        V.push(r * sn, y - YC, r * cs, nr * sn, ny, nr * cs, j / seg, v, s.m)
      }
    }
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) {
      const a = base + i * (seg + 1) + j, b = a + seg + 1
      I.push(a, a + 1, b, a + 1, b + 1, b) // anti-horário visto de fora, para a frente da face ser o lado de fora
    }
  }
  return { V: new Float32Array(V), I: new Uint16Array(I) }
}

/* ---------- rótulo desenhado em canvas ---------- */
function labelCanvas(): HTMLCanvasElement {
  const W = 2048, Hh = 1024, c = document.createElement('canvas'); c.width = W; c.height = Hh
  const g = c.getContext('2d')!
  const phys = (Math.PI * 2 * R) / (LAB1 - LAB0), sx = (W / Hh) / phys // compensa a esticada horizontal do cilindro
  const bgr = g.createLinearGradient(0, 0, 0, Hh); bgr.addColorStop(0, '#04170e'); bgr.addColorStop(.5, '#06241a'); bgr.addColorStop(1, '#031109')
  g.fillStyle = bgr; g.fillRect(0, 0, W, Hh)
  // veias de folha bem discretas ao redor
  g.save(); g.globalAlpha = .07; g.strokeStyle = '#7CB542'; g.lineWidth = 2
  for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(W / 2 + i * 160, 0); g.bezierCurveTo(W / 2 + i * 160 + 90, Hh * .3, W / 2 + i * 160 - 90, Hh * .7, W / 2 + i * 160, Hh); g.stroke() }
  g.restore()
  const emb = (cx: number, cy: number, h: number) => {
    const k = h / EMB.h
    g.save(); g.translate(cx, cy); g.scale(k * sx, k); g.translate(-EMB.w / 2, -EMB.h / 2)
    g.fillStyle = '#116A34'; g.fill(new Path2D(EMB.dark), 'evenodd')
    g.fillStyle = '#7CB542'; g.fill(new Path2D(EMB.leaf), 'evenodd')
    g.fillStyle = '#488F31'; g.fill(new Path2D(EMB.fold), 'evenodd')
    g.restore()
  }
  const word = (cx: number, cy: number, h: number) => {
    const k = h / NOME.h
    g.save(); g.translate(cx, cy); g.scale(k * sx, k); g.translate(-NOME.w / 2, -NOME.h / 2)
    NOME.l.forEach(l => { g.save(); g.fillStyle = l.k === 'eco' ? '#7CB542' : '#EAF5EE'; g.fill(new Path2D(l.d), 'evenodd'); g.restore() })
    g.restore()
  }
  const txt = (t: string, cx: number, cy: number, font: string, col: string, sp = 0) => {
    g.save(); g.translate(cx, cy); g.scale(sx, 1); g.font = font; g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'
    ;(g as unknown as { letterSpacing: string }).letterSpacing = sp + 'px'; g.fillText(t, 0, 0); g.restore()
  }
  const line = (cx: number, cy: number, w: number) => { const gr = g.createLinearGradient(cx - w * sx / 2, 0, cx + w * sx / 2, 0); gr.addColorStop(0, 'rgba(124,181,66,0)'); gr.addColorStop(.5, 'rgba(124,181,66,.9)'); gr.addColorStop(1, 'rgba(124,181,66,0)'); g.fillStyle = gr; g.fillRect(cx - w * sx / 2, cy, w * sx, 3) }
  // frente (centro da textura)
  emb(W / 2, Hh * .36, 380)
  txt('EcoVitalis', W / 2, Hh * .68, '600 128px Inter, system-ui, sans-serif', '#EAF5EE', 6)
  line(W / 2, Hh * .775, 520)
  txt('A natureza renova,', W / 2, Hh * .845, 'italic 400 56px "Instrument Serif", Georgia, serif', '#9CCB6B', 1)
  txt('a ciência transforma.', W / 2, Hh * .915, 'italic 400 56px "Instrument Serif", Georgia, serif', '#9CCB6B', 1)
  // verso (bordas da textura, emendadas)
  for (const cx of [0, W]) {
    word(cx, Hh * .3, 96)
    line(cx, Hh * .43, 560)
    txt('Uso técnico', cx, Hh * .55, '600 60px Inter, system-ui, sans-serif', '#EAF5EE', 4)
    txt('Manuseio por equipes capacitadas', cx, Hh * .66, '400 46px Inter, system-ui, sans-serif', '#8FA89B', 2)
  }
  // lados: pequenas folhas
  for (const cx of [W * .25, W * .75]) emb(cx, Hh * .5, 150)
  return c
}

/* ---------- shaders ---------- */
const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;attribute float aM;
uniform mat4 uMVP;uniform mat4 uM;
varying vec3 vN;varying vec3 vW;varying vec2 vT;varying float vMat;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=(uM*vec4(aN,0.)).xyz;vT=aT;vMat=aM;gl_Position=uMVP*vec4(aP,1.);}`
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vN;varying vec3 vW;varying vec2 vT;varying float vMat;
uniform vec3 uCam;uniform sampler2D uTex;
float box(vec2 p,vec2 c,vec2 h,float s){vec2 d=abs(p-c)-h;return 1.-smoothstep(-s,s,max(d.x,d.y));}
/* estúdio simples: duas fitas verticais, luz de cima, contraluz verde e chão escuro */
vec3 env(vec3 d,float ro){
  float az=atan(d.x,d.z),el=asin(clamp(d.y,-1.,1.)),s=.05+ro*.55;vec2 p=vec2(az,el);
  vec3 c=mix(vec3(.05,.065,.055),vec3(.6,.64,.6),smoothstep(-.45,.95,d.y));
  c=mix(c,vec3(.015,.03,.02),smoothstep(0.,-.4,d.y));
  c+=vec3(1.,.99,.94)*3.4*box(p,vec2(-.95,.12),vec2(.15,.78),s);
  c+=vec3(.85,.96,.9)*1.9*box(p,vec2(1.2,.08),vec2(.1,.72),s);
  c+=vec3(1.,1.,.96)*2.2*box(vec2(abs(az)*.5,el),vec2(.5,1.25),vec2(.55,.24),s);
  c+=vec3(.55,.9,.35)*1.2*box(vec2(abs(az),el),vec2(2.85,.1),vec2(.38,.62),s);
  return c;
}
float h1(float n){return fract(sin(n*127.1)*43758.5453);}
/* luz difusa: céu suave, chão escuro, uma luz principal, uma de preenchimento e contraluz verde */
vec3 irr(vec3 n){
  vec3 c=mix(vec3(.01,.028,.02),vec3(.16,.22,.18),n.y*.5+.5);
  c+=max(dot(n,normalize(vec3(-.8,.5,.6))),0.)*vec3(.95,.95,.88)*.7;
  c+=max(dot(n,normalize(vec3(.9,.2,.5))),0.)*vec3(.5,.6,.55)*.25;
  c+=max(dot(n,vec3(0.,0.,-1.)),0.)*vec3(.3,.55,.2)*.45;
  return c;
}
void main(){
  vec3 N=normalize(vN),V=normalize(uCam-vW);if(!gl_FrontFacing)N=-N;
  float nv=clamp(dot(N,V),0.,1.),fr=pow(1.-nv,5.);vec3 Rf=reflect(-V,N);vec3 col;
  if(vMat<.5){
    float br=h1(floor(vT.y*320.+vT.x*7.))*.05-.025;
    vec3 al=vec3(.78,.80,.77);vec3 F=al+(1.-al)*fr;
    col=F*env(Rf,.16+br)+al*irr(N)*.05;
  }else if(vMat<1.5){
    vec3 al=vec3(.05,.34,.12);col=al*irr(N)*1.1+(.05+.95*fr)*env(Rf,.05)*.9;
  }else if(vMat<2.5){
    vec3 al=texture2D(uTex,vec2(vT.x,vT.y)).rgb;al*=al;
    col=al*(irr(N)+.05)*1.5+(.035+.85*fr)*env(Rf,.04)*.55+vec3(.05,.2,.08)*pow(1.-nv,3.)*.35;
  }else{
    col=vec3(.05,.055,.05)*(.3+irr(N))+(.04+.5*fr)*env(Rf,.2);
  }
  col*=1.15;col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);col=pow(clamp(col,0.,1.),vec3(1./2.2));
  gl_FragColor=vec4(col,1.);
}`

/* ---------- matrizes ---------- */
type M4 = Float32Array
const mul = (a: M4, b: M4): M4 => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s } return o }
const rotY = (a: number): M4 => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]) }
const rotX = (a: number): M4 => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]) }
const trans = (x: number, y: number, z: number): M4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
const persp = (fov: number, asp: number, n: number, f: number): M4 => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]) }
const vec = (m: M4, x: number, y: number, z: number, w = 1): [number, number, number, number] => [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w]
const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const wrap = (a: number) => a - TAU * Math.round(a / TAU)

export const REST = { yaw: 0, pitch: .14, zoom: 1, fy: 0 }

export function createCapsule(canvas: HTMLCanvasElement, o: Opts): Ctl | null {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' })
  if (!gl) return null
  const sh = (t: number, s: string) => { const x = gl.createShader(t)!; gl.shaderSource(x, s); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null }
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS)
  if (!vs || !fs) return null
  const pr = gl.createProgram()!; gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr)
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null
  gl.useProgram(pr)

  const geo = build(112)
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, geo.V, gl.STATIC_DRAW)
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.I, gl.STATIC_DRAW)
  const at = (n: string, sz: number, off: number) => { const l = gl.getAttribLocation(pr, n); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, sz, gl.FLOAT, false, 36, off * 4) }
  at('aP', 3, 0); at('aN', 3, 3); at('aT', 2, 6); at('aM', 1, 8)
  const U = (n: string) => gl.getUniformLocation(pr, n)
  const uMVP = U('uMVP'), uM = U('uM'), uCam = U('uCam'), uTex = U('uTex')

  // textura do rótulo (refeita quando as fontes terminam de carregar)
  const tex = gl.createTexture()
  const upload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, labelCanvas())
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const an = gl.getExtension('EXT_texture_filter_anisotropic')
    if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))
    dirty = true
  }
  let dirty = true
  upload()
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  if (fonts) Promise.all([fonts.load('600 64px Inter'), fonts.load('italic 400 54px "Instrument Serif"')]).catch(() => {}).then(() => { if (!dead) upload() })
  gl.activeTexture(gl.TEXTURE0); gl.uniform1i(uTex, 0)
  gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0)

  /* ---------- estado ---------- */
  const st = { yaw: 0, pitch: REST.pitch, zoom: 1, fy: 0, vy: 0, vp: 0 }
  let dead = false, vis = true, raf = 0, last = 0, auto = !o.reduced, t0 = performance.now(), idle = 0, drag = false, tw: null | { from: typeof st; to: Partial<typeof st>; t: number; d: number } = null
  let holdPitch = false, spinning = 0, spinFrom = 0, W = 1, Hc = 1, focused: number | null = null
  const sway = () => auto ? Math.sin((performance.now() - t0) / 1000 * .7) * .42 : 0

  const tween = (to: Partial<typeof st>, ms: number) => {
    if (o.reduced) ms = 0
    const t = { ...to }
    if (t.yaw !== undefined) { const cur = st.yaw + sway(); t.yaw = cur + wrap(t.yaw - cur) } // menor caminho
    if (ms === 0) { Object.assign(st, t); st.yaw += 0; tw = null; dirty = true; return }
    st.yaw += sway(); auto = false; tw = { from: { ...st }, to: t, t: 0, d: ms }; st.vy = st.vp = 0; dirty = true
  }
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    W = w; Hc = h; canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); gl.viewport(0, 0, canvas.width, canvas.height); dirty = true
  }

  const frame = (now: number) => {
    raf = 0
    if (dead) return
    const dt = Math.min(120, now - (last || now)); last = now
    let moving = false
    if (tw) {
      tw.t += dt; const k = ease(Math.min(1, tw.t / tw.d))
      for (const key of Object.keys(tw.to) as (keyof typeof st)[]) st[key] = tw.from[key] + ((tw.to[key] as number) - tw.from[key]) * k
      if (tw.t >= tw.d) tw = null
      moving = true
    } else if (spinning) {
      spinning = Math.min(1, spinning + dt / 2200); st.yaw = spinFrom + ease(spinning) * TAU; if (spinning >= 1) spinning = 0; moving = true
    } else if (!drag) {
      if (Math.abs(st.vy) > 1e-5 || Math.abs(st.vp) > 1e-5) { st.yaw += st.vy * dt; st.pitch += st.vp * dt; const f = Math.exp(-dt * .005); st.vy *= f; st.vp *= f; st.pitch = Math.max(-1.35, Math.min(1.35, st.pitch)); moving = true }
      idle += dt
      if (!holdPitch && idle > 2200 && Math.abs(st.pitch - REST.pitch) > .002) { st.pitch += (REST.pitch - st.pitch) * (1 - Math.exp(-dt * .004)); moving = true }
    }
    if (focused === null && !tw && !spinning && (Math.abs(st.zoom - 1) > .002 || Math.abs(st.fy) > .002)) {
      const f = 1 - Math.exp(-dt * .006); st.zoom += (1 - st.zoom) * f; st.fy += (0 - st.fy) * f; moving = true
    }
    if (auto && !o.reduced) moving = true
    if (!moving && !dirty && !drag) { return }

    // matrizes
    const yaw = st.yaw + sway()
    const Mo = mul(rotX(st.pitch), rotY(yaw))
    const fitK = W / Hc < .9 ? 1.16 : 1 // cena estreita (celular): afasta um pouco, para sobrar espaço aos controles
    const D = 10.4 * st.zoom * fitK
    const tg = vec(Mo, 0, st.fy, 0)
    const Vw = mul(trans(0, 0, -D), trans(-tg[0], -tg[1], -tg[2]))
    const Pm = persp(26 * Math.PI / 180, W / Hc, 1, 40)
    const MVP = mul(Pm, mul(Vw, Mo))
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniformMatrix4fv(uMVP, false, MVP); gl.uniformMatrix4fv(uM, false, Mo); gl.uniform3f(uCam, tg[0], tg[1], tg[2] + D)
    gl.drawElements(gl.TRIANGLES, geo.I.length, gl.UNSIGNED_SHORT, 0)
    dirty = false

    // pontos de destaque na tela
    const pts: Pt[] = o.hot.map(h => {
      const w = vec(Mo, h.p[0], h.p[1], h.p[2]), c = vec(MVP, h.p[0], h.p[1], h.p[2])
      const n = vec(Mo, h.n[0], h.n[1], h.n[2], 0)
      let vx = tg[0] - w[0], vy = tg[1] - w[1] + 0, vz = tg[2] + D - w[2]; const l = Math.hypot(vx, vy, vz) || 1; vx /= l; vy /= l; vz /= l
      const f = n[0] * vx + n[1] * vy + n[2] * vz
      return { x: (c[0] / c[3] * .5 + .5) * W, y: (1 - (c[1] / c[3] * .5 + .5)) * Hc, v: Math.max(0, Math.min(1, (f - .04) / .22)) }
    })
    o.onFrame(pts, W, Hc, ((yaw % TAU) + TAU) % TAU, Hc / (4.8 * st.zoom * fitK))
    if ((auto && !o.reduced) || moving || tw || spinning || drag) raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (!raf && !dead && vis) { last = 0; raf = requestAnimationFrame(frame) } }

  /* ---------- entrada: mouse, toque e teclado ---------- */
  // O arrasto vale em toda a cena (inclusive começando em cima de um ponto), mas só começa depois de 6 px de movimento,
  // então um clique simples num ponto continua sendo um clique.
  const host = o.host || canvas
  let px = 0, py = 0, pt = 0, touchLike = false, pend: null | { x: number; y: number; id: number } = null
  const begin = (e: PointerEvent) => {
    drag = true; touchLike = e.pointerType !== 'mouse'; px = e.clientX; py = e.clientY; pt = performance.now()
    if (auto || tw || spinning) { st.yaw += sway(); auto = false; tw = null; spinning = 0 }
    st.vy = st.vp = 0
    if (focused !== null) { focused = null; holdPitch = false; o.onUser('release') } else o.onUser('drag')
    try { host.setPointerCapture(e.pointerId) } catch { /* ignora */ }
    canvas.classList.add('grab'); kick()
  }
  const down = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if ((e.target as HTMLElement).closest('.vt-ctl,.vt-ang')) return
    pend = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }
  const move = (e: PointerEvent) => {
    if (pend && !drag && Math.hypot(e.clientX - pend.x, e.clientY - pend.y) > 6) begin(e)
    if (!drag) return
    const now = performance.now(), dt = Math.max(1, now - pt); pt = now
    const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY
    const dyaw = dx / Math.max(260, W) * TAU * 1.05, dp = touchLike ? 0 : dy / Math.max(260, Hc) * Math.PI * .9
    st.yaw += dyaw; st.pitch = Math.max(-1.35, Math.min(1.35, st.pitch + dp))
    st.vy = dyaw / dt; st.vp = dp / dt; dirty = true; idle = 0; kick()
  }
  const up = () => { pend = null; if (!drag) return; drag = false; canvas.classList.remove('grab'); idle = 0; if (o.reduced) st.vy = st.vp = 0; kick() }
  const key = (e: KeyboardEvent) => {
    const m: Record<string, [number, number]> = { ArrowLeft: [-.26, 0], ArrowRight: [.26, 0], ArrowUp: [0, -.2], ArrowDown: [0, .2] }
    if (e.key === 'Home') { e.preventDefault(); ctl.reset(); return }
    const d = m[e.key]; if (!d) return
    e.preventDefault(); ctl.nudge(d[0], d[1])
  }
  host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move); host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up); canvas.addEventListener('keydown', key)
  const ro = new ResizeObserver(() => { size(); kick() }); ro.observe(canvas)
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) { dirty = true; kick() } }, { threshold: 0 }); io.observe(canvas)
  const vc = () => { vis = !document.hidden; kick() }; document.addEventListener('visibilitychange', vc)
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; o.onLost?.() })
  size(); kick()

  const ctl: Ctl = {
    focus(i) {
      focused = i; holdPitch = i !== null; o.onUser('ctl'); idle = 0
      if (i === null) tween({ ...REST }, 900)
      else { const h = o.hot[i]; tween({ yaw: h.yaw, pitch: h.pitch, zoom: h.zoom, fy: h.fy }, 950) }
      kick()
    },
    nudge(dy, dp) { st.yaw += sway(); auto = false; o.onUser('ctl'); tw = null; st.vy = dy / 140; st.vp = dp / 140; idle = 0; dirty = true; kick() },
    spin() { if (spinning) return; st.yaw += sway(); auto = false; tw = null; o.onUser('ctl'); if (o.reduced) { st.yaw += TAU; dirty = true } else { spinFrom = st.yaw; spinning = .0001 } kick() },
    reset() { holdPitch = false; focused = null; o.onUser('ctl'); tween({ ...REST, yaw: Math.round(st.yaw / TAU) * TAU }, 900); kick() },
    angle: () => ((st.yaw + sway()) % TAU + TAU) % TAU,
    dispose() {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vc)
      host.removeEventListener('pointerdown', down); host.removeEventListener('pointermove', move); host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', up); canvas.removeEventListener('keydown', key)
      // libera só o que criamos. Não derrubamos o contexto: o React em modo de desenvolvimento monta o componente duas vezes
      // no mesmo canvas, e um contexto derrubado deixaria o 3D em branco.
      gl.deleteBuffer(vb); gl.deleteBuffer(ib); gl.deleteTexture(tex); gl.deleteProgram(pr); gl.deleteShader(vs); gl.deleteShader(fs)
    },
  }
  return ctl
}
