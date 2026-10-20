import type { Hot } from './capsule3d'

/* Textos e dados enviados pelo cliente. Para trocar o nome da linha de produtos nos textos, altere só MARCA. */
export const MARCA = 'EcoVitalis'
export const SLOGAN: [string, string] = ['A natureza renova,', 'a ciência transforma.']

/* Uma pesquisa por card do processo, na ordem 1 a 5. t = título, p = texto, c = a conexão com a marca */
export const PESQUISA: { t: string; p: string; c: string }[] = [
  { t: 'Por que alguns resíduos persistem por tanto tempo?',
    p: 'Plástico, vidro e borracha apresentam características que dificultam sua degradação natural. Enquanto alguns materiais podem se fragmentar pela ação do sol e do desgaste ambiental, outros permanecem por longos períodos. No caso dos plásticos, essa fragmentação pode gerar microplásticos, sem eliminar necessariamente o impacto ambiental.',
    c: 'desenvolver alternativas que reduzam a persistência dos resíduos sem gerar novos riscos ambientais.' },
  { t: 'Quando o descarte se transforma em recurso',
    p: 'A biomassa vegetal, formada por folhas, caules e outros resíduos de plantas, pode ser aproveitada como matéria-prima para diferentes processos biotecnológicos. Essa prática está relacionada à economia circular, que busca reduzir desperdícios e valorizar recursos antes descartados.',
    c: 'aproveitar o carrapicho (Xanthium cavanillesii) e o capim-caninha (Andropogon lateralis) como fontes de biomassa para pesquisar novas soluções ambientais.' },
  { t: 'É possível acelerar a degradação dos materiais?',
    p: 'Enzimas são moléculas capazes de acelerar reações químicas. Pesquisas já demonstraram que determinadas enzimas podem degradar plásticos específicos, como o PET. Entretanto, cada material possui características próprias: uma solução que funciona para um tipo de plástico não necessariamente funciona para outros polímeros, borrachas ou vidro.',
    c: 'desenvolver uma formulação de origem vegetal cuja capacidade de degradar resíduos seja investigada e comprovada cientificamente.' },
  { t: 'Da hipótese à aplicação ambiental',
    p: 'Antes de utilizar uma nova tecnologia na natureza, é necessário verificar sua eficácia e segurança. Testes controlados permitem avaliar a transformação dos materiais, identificar os resíduos resultantes e investigar possíveis efeitos sobre o solo, a água e os organismos vivos.',
    c: 'o sistema de cápsula e pulverizador representa uma proposta de aplicação que precisaria passar por testes de eficiência e segurança antes de ser utilizado em ambientes reais.' },
  { t: 'Degradar não significa necessariamente eliminar',
    p: 'A degradação de um material pode gerar substâncias menores sem eliminar completamente seus impactos. Plásticos podem originar microplásticos, enquanto vidro e borracha apresentam desafios diferentes de transformação. Por isso, é importante avaliar não apenas a redução dos resíduos, mas também os produtos resultantes do processo.',
    c: 'buscar uma solução que reduza a persistência dos poluentes sem transferir a contaminação para o solo ou para a água.' },
]

/* Cartões da seção "Do descarte à inovação ambiental." */
export const WHY: { n: string; t: string; s: string; p: string; tags: string[] }[] = [
  { n: '01', t: 'Economia circular na prática', s: 'De resíduo vegetal a recurso produtivo.', p: 'Em vez de depender exclusivamente de matérias-primas convencionais, a proposta busca valorizar a biomassa proveniente do manejo da vegetação, conectando o aproveitamento de resíduos à inovação ambiental.', tags: ['Reaproveitamento', 'Economia circular'] },
  { n: '02', t: 'Uma solução orientada pela ciência', s: 'Inovação exige evidências.', p: 'Cada material apresenta características próprias. Por isso, uma tecnologia ambiental precisa ser testada para identificar sua eficácia, seus limites e os possíveis impactos dos produtos resultantes.', tags: ['Pesquisa', 'Validação científica'] },
  { n: '03', t: 'Além da aparência limpa', s: 'O que acontece depois da degradação?', p: 'Reduzir o tamanho de um resíduo não significa eliminá-lo. Uma solução realmente responsável precisa considerar os subprodutos do processo e evitar a transferência da contaminação para o solo e a água.', tags: ['Segurança ambiental', 'Monitoramento'] },
  { n: '04', t: 'O futuro que queremos construir', s: 'Uma nova perspectiva para o manejo de resíduos.', p: `A ${MARCA} propõe aproximar o aproveitamento de biomassa, a pesquisa biotecnológica e a gestão de resíduos em um mesmo projeto, buscando caminhos para reduzir impactos ambientais por meio de soluções verificáveis.`, tags: ['Inovação sustentável', 'Visão de futuro'] },
]

/* Modalidades de compra. Valores em centavos; desconto e economia são calculados contra comprar o mesmo volume em cápsulas Pro de 1 litro. */
const BASE = 39990
export const MODS = ([['Pro', 1, 39990], ['Max', 5, 142990], ['Industrial', 10, 259990], ['Bulk', 20, 479990]] as [string, number, number][]).map(([nome, vol, cents]) => {
  const ref = BASE * vol, save = ref - cents
  return { nome, full: `${MARCA} ${nome}`, vol, vl: vol === 1 ? '1 litro' : `${vol} litros`, cents, perL: Math.round(cents / vol), pct: Math.round(save / ref * 100), save }
})
export const brl = (c: number) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* Partes da cápsula no 3D e no infográfico. Os textos descrevem o produto como o cliente apresentou;
   os nomes das peças (bico, pescoço, base) vêm do desenho da cápsula e podem ser ajustados aqui.
   hot: p = ponto no modelo, n = direção da superfície, yaw/pitch/zoom/fy = para onde a câmera vai ao selecionar. */
export type Parte = { t: string; p: string; tags: string[]; hot: Hot }
export const PARTES: Parte[] = [
  { t: 'Bico de acoplamento', p: 'É a peça que liga a cápsula ao pulverizador. O líquido segue por aqui e o equipamento o espalha sobre a área poluída.', tags: ['Encaixe', 'Pulverizador'],
    hot: { p: [0, 1.81, .38], n: [0, 0, 1], yaw: 0, pitch: .5, zoom: .5, fy: 1.8 } },
  { t: 'Pescoço e vedação', p: 'Mantém o reservatório fechado durante o transporte e o armazenamento. Como é um produto de uso técnico, o manuseio fica com equipes capacitadas.', tags: ['Transporte', 'Uso técnico'],
    hot: { p: [0, 1.33, .19], n: [0, 0, 1], yaw: 0, pitch: .15, zoom: .55, fy: 1.3 } },
  { t: 'Rótulo e folha da marca', p: 'A folha em dois tons é o símbolo da EcoVitality: a natureza que renova e a ciência que transforma. No rótulo também aparece o nome da linha, EcoVitalis.', tags: ['Identidade', 'Linha EcoVitalis'],
    hot: { p: [.292, -.35, .408], n: [.581, 0, .814], yaw: -.62, pitch: .1, zoom: .72, fy: -.35 } },
  { t: 'Reservatório do líquido', p: 'Guarda o líquido feito da biomassa de carrapicho (Xanthium cavanillesii) e capim-caninha (Andropogon lateralis), plantas de solo degradado que costumam ser roçadas e descartadas. O líquido foi pensado para encurtar a vida útil de plástico, vidro e borracha. Antes do uso em campo, a eficácia e a segurança precisam ser comprovadas em testes.', tags: ['Biomassa', 'Plástico, vidro e borracha', 'Em validação'],
    hot: { p: [-.322, .2, .383], n: [-.644, 0, .765], yaw: .7, pitch: .08, zoom: .85, fy: .15 } },
  { t: 'Base e modalidades', p: 'A cápsula vem em quatro modalidades: Pro (1 litro), Max (5 litros), Industrial (10 litros) e Bulk (20 litros). Quanto maior a modalidade, menor o preço do litro.', tags: ['1 a 20 litros'],
    hot: { p: [0, -1.46, .5], n: [0, 0, 1], yaw: 0, pitch: -.45, zoom: .55, fy: -1.5 } },
]
