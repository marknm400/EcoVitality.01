# EcoVitality (React + Vite + Tailwind + TypeScript)

    npm install
    npm run dev      # desenvolvimento (abra o endereço localhost mostrado)
    npm run build    # gera a pasta dist/

Páginas (roteamento por hash, sem dependência extra):
- `#/` Início: hero com vídeo, texto que se preenche, cartões numerados e cartões que empilham.
- `#/jornada` A jornada da cápsula (animação conceitual em scroll, em página própria).
- `#/produto` Preços em vidro, alternância por litro e tabela.
- `#/contato` Proposta, perguntas e formulário de demonstração (com confete).
- Qualquer outra rota mostra a página 404.

Visual v2 (vidro escuro premium, mais bruto):
- `src/styles/glass2.css`: camada nova de estilo. Vidro com luz nas bordas e brilho diagonal, grão fino, aurora de fundo, títulos grandes com degradê, botões com luz interna, cúpula com órbitas, marca gigante no rodapé. Para voltar ao visual anterior, remova o import dessa folha em `main.tsx`.
- `src/components/Fx.tsx`: efeitos novos do naocodei.com/free-code: galeria horizontal (02), máscara que revela (05), embaralhar letras (15), gráfico de barras (25) e fundo com shader WebGL (31).
- Início: galeria "Onde a cápsula trabalha", antes e depois com máscara circular e cúpula que leva à jornada. Rodapé com shader e marca gigante.
- Produto: gráfico de barras do preço por litro (usa os preços já existentes).
- Jornada (página própria): linha do tempo, anel de progresso e shader que acende conforme o solo se recupera.
- Em celular, tela vertical e movimento reduzido, tudo cai para versões estáticas (sem shader, galeria com rolagem lateral, máscara dividida ao meio).

Rodada v3:
- `src/lib/copy.ts`: todos os textos e preços enviados (pesquisas, cartões, modalidades). A constante `MARCA` troca o nome "EcoVitalis" em todos os textos de uma vez.
- `src/components/Expand.tsx`: card do processo que expande após 2 s de cursor (ou clique, toque e Enter), com a pesquisa em painel.
- `src/components/Finale.tsx` e `src/lib/logo.ts`: final de página com a logo vetorizada (folha e letras animadas) e o slogan.
- `src/styles/v3.css`: estilos novos. Produto agora tem 4 modalidades, tabela com desconto e gráfico de desconto por quantidade.

Rodada v4:
- Hero limpo (`Hero.tsx`): só o título "A natureza renova, a ciência transforma." e um botão, no molde do hero de referência. Sem produto, sem caixas de texto extras, sem partículas e sem a máscara branca em volta do vídeo. O vídeo usa `mix-blend-mode: multiply` para o branco dele se fundir ao fundo da página. Se o seu vídeo tiver fundo escuro, troque a variável `--vblend` para `normal` (em `v4.css`, regra `.hero2`).
- Correção dos cards 1 a 5 (`Expand.tsx`): o React reescrevia a `className` e apagava a classe `in` da animação de revelar, por isso o card sumia ao passar o mouse e não voltava. O estado agora vai em `data-*`. O painel cresce a partir do card até o centro, como um pop-up (ou o vídeo do YouTube em tela cheia, sem ocupar a tela toda), e o card volta ao fechar. Também corrigido o tamanho do painel em modo de desenvolvimento.
- Vitrine do produto logo abaixo do hero (`Showcase.tsx` e `lib/capsule3d.ts`): cápsula EcoVitalis em 3D feita em WebGL puro, sem biblioteca extra. Gira 360° ao arrastar (mouse, toque e setas do teclado), com botões de girar, inclinar e reiniciar. Cinco pontos clicáveis abrem um cartão com a descrição de cada parte, e a câmera aproxima da peça escolhida. Os textos e as posições dos pontos estão em `PARTES`, no fim de `lib/copy.ts`. O rótulo é desenhado na hora com a logo vetorizada. Sem WebGL, aparece a imagem do produto e a lista de partes continua funcionando.
- Nova logo (`lib/logo.ts`): vetorizada do arquivo enviado. Usada no menu, no rodapé, no favicon, no rótulo 3D e no final de página (`Finale.tsx`), que agora tem fundo escuro e calmo, sem o clarão que parecia uma máscara branca.
- Paleta ajustada às cores da nova logo (verde-floresta, verde-folha e verde-médio) em todos os estilos. Menu com a marca vetorizada.
- Card "Leve a EcoVitality para a sua área" refeito (`Cta` em `Chrome.tsx`): vidro escuro com o emblema da marca como marca d'água, sem shader nem manchas.
- Celular e tablet: só "movimento reduzido" desliga as animações. A versão animada agora roda em telas pequenas, com adaptações em `v4.css`: galeria vira faixa de deslize, legendas da jornada viram cartões na base, cartão do componente 3D aparece abaixo da cena, alvos de toque maiores e shader mais leve.

Arquivos principais: `src/components/Hero.tsx` (vídeo em loop com fade), `Journey.tsx` e `Scene.tsx` (jornada), `Global.tsx` (cursor, rolagem com inércia, luz e inclinação nos cartões, ímã e onda nos botões), `ui.tsx` (odômetro, partículas, confete), `src/styles/*`.
O vídeo vem da URL em `VIDEO`, no topo de Hero.tsx. O formulário é de demonstração e não envia dados.
