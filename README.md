# Achei Troféus — site "Eternizamos conquistas"

Site estático: HTML, CSS e JS, sem build. Para publicar, suba a pasta inteira em
qualquer hospedagem estática (Netlify, Vercel, Hostinger, S3 etc.).
Para testar localmente: `python3 -m http.server` dentro da pasta e abra http://localhost:8000.

## Estrutura
- `index.html` — página única, 8 capítulos (00 Hero → 07 Orçamento).
- O catálogo é o capítulo 06 de `index.html` (`#catalogo`). `catalogo.html` só redireciona para lá,
  para não quebrar links antigos (inclusive listas compartilhadas).
- `css/site.css` — todo o design system (tokens no `:root`).
- `css/fonts.css` + `fonts/` — Anton, Instrument Serif e Inter Tight hospedadas localmente.
- `js/site.js` — direção de movimento (cenas, revelação a laser, hover, orçamento).
- `js/gsap.min.js`, `js/ScrollTrigger.min.js` (GSAP 3.12.5) e `js/lenis.min.js` (Lenis 1.1.14).
- `img/` — fotos do Instagram da Achei, recortadas, ampliadas 4× (Real-ESRGAN) e em WebP;
  `img/cut/` são os produtos com fundo removido; `img/judo/` são as 5 camadas da desmontagem.

## Informações usadas — todas vêm do material enviado (confirmar com a Achei antes de publicar)
- "+20 mil eventos premiados", "Todo o Brasil", "CEO @karuliny.t.r" — bio do Instagram.
- WhatsApp (32) 9 9804-2012 — posts de anúncio. O formulário abre wa.me/5532998042012.
- "Sem pedido mínimo" — post do World Tour BT 400. **Confirmar se vale para todos os pedidos.**
- Parceira oficial Copa Fla / CopaFla Maraca e FBT — posts de parceria.
- "Centro logístico Full — Mercado Livre", "Indústria, estrutura e alcance nacional" — posts.
- Frases da marca reaproveitadas: "A chegada passa. A conquista fica.", "Os minutos mais
  importantes do seu evento começam aqui.", "Antes do apito final. Antes do pódio. Antes das fotos."
- Nomes de competições (marquee e legendas) — lidos nos próprios troféus e posts.
- Link da loja: bit.ly/acheitrofeuscombr (bio). Trocar pelo domínio definitivo quando houver.

## Próximos passos recomendados
- Substituir as fotos do Instagram por originais em alta resolução (a mesma diagramação aceita).
- Se houver vídeo da fábrica (laser cortando), ele pode entrar no lugar de `laserbeam.webp`.
- Logo: o símbolo no header é um desenho provisório; trocar pelo SVG oficial da marca.

## Mobile (≤ 820px) — projetado à parte
- Hero em coluna (palavra → produto → ação); "ETERNIZAMOS" em contorno e "CONQUISTAS." sólido.
- Menu próprio (botão no header, painel revelado pelo laser, foco preso, Esc fecha, scroll travado).
- Anatomia com desmontagem **vertical** e uma camada por vez; Fábrica e Esportes como carrosséis nativos com a linha de laser de progresso.
- Coleção com 6 peças (sem repetir o hero e os esportes), Eventos com o número como manchete e 6 fotos.
- Scroll nativo no toque (Lenis só com mouse); animações contínuas pausam fora da tela; grão desligado no celular.
- Testado em 320×568, 360×800, 375×812, 390×844, 412×915, 430×932, 768×1024 e 844×390 (deitado), sem overflow horizontal.

## Catálogo + lista de orçamento (capítulo 06 de `index.html`)
- **258 modelos** transcritos dos 10 catálogos em PDF (Futebol/Futsal, Beach Tennis, Vôlei, Medalhas,
  Coleção 2025 — Exclusivos, Padel, Ciclismo/MTB, Pescaria, Poker/Baralho, Peteca/Kart/Sinuca), com código,
  todas as medidas e o preço de cada medida. Fotos recortadas dos PDFs em `img/catalogo/` (WebP 4:5).
- Dados em `js/catalogo-data.js` (um objeto por produto). Para mudar preço, nome ou medida, edite ali.
  Foto nova: salve `img/catalogo/<id>.webp` com o mesmo `id` do produto.
- `js/catalogo.js` — filtros por coleção e subgrupo, busca (nome, coleção ou código do catálogo impresso,
  com ou sem acento), ordenação, ficha do produto com quantidade por medida, "kit pódio" (1º, 2º e 3º),
  personalização por modelo, lista editável (trocar medida, quantidade, remover, observações), dados do evento,
  link compartilhável da lista e envio para o WhatsApp com a mensagem pronta.
- A lista fica salva no navegador (localStorage); fechar a página não perde nada.
- **Preços**: aparecem como "valor de referência da tabela". Para um catálogo só de orçamento, troque
  `mostrarPrecos: true` por `false` no topo de `js/catalogo.js` — todos os valores somem da página e da mensagem.
- Links úteis: `index.html?c=beach#catalogo` abre uma coleção; `?q=volei011#catalogo` já busca; `#p=futebol-brasil` abre a ficha.
- **Conferência**: nomes e códigos foram lidos nas etiquetas de cada foto (MOD. … e #código). Pontos para a
  Achei revisar no catálogo impresso: Beach Tennis repete #beachtennis060 (Marabá e Blumenau); Vôlei repete
  #volei031 (San Diego e Orlando); Pesca 5 e Pesca 12 não têm código; Peteca/Kart/Sinuca traz o código
  provisório #00000000 (no site ficam sem código). O PDF de Ciclismo tem 4 páginas ocultas que são cópias do
  Beach Tennis (ignoradas).

## Versão em arquivo único
`python3 tools/arquivo-unico.py` gera `oficial/index.html`: o site completo, com o catálogo, num único arquivo
(estilos, scripts, fontes e fotos embutidos; as fotos do catálogo são reduzidas para 360×450). Abre sozinho,
sem pastas e sem internet (o WhatsApp precisa de internet, claro).
