# Achei Troféus — site "Eternizamos conquistas"

Site estático: HTML, CSS e JS, sem build. Para publicar, suba a pasta inteira em
qualquer hospedagem estática (Netlify, Vercel, Hostinger, S3 etc.).
Para testar localmente: `python3 -m http.server` dentro da pasta e abra http://localhost:8000.

## Estrutura
- `index.html` — página única, 8 capítulos (00 Hero → 07 Orçamento).
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

## Pré-venda "Próxima Conquista" (`prevenda/`) — prévia para aprovação
Página própria da campanha de 48 horas (16/11, 20h → 18/11, 20h, horário de Brasília). Abre em `/prevenda/`.
Usa as mesmas fontes e fotos do site (`../fonts`, `../img`); CSS e JS ficam em `prevenda/`. Tem `noindex`.

- `prevenda/index.html` — hero com contagem, Troféu Mundial -70% (seletor de tamanho), categorias,
  simulador de bônus (trilho arrastável, teclado e campo de valor), o que você ganha, regras de acúmulo,
  os 8 pacotes, janelas de velocidade, comparativo por janela, perguntas e CTA final.
- `prevenda/prevenda.js` — **todas as regras da campanha ficam no bloco `DADOS` no topo**: datas das
  janelas, pacotes, extras, sorteios, preços do Mundial, médias de medalha (R$ 11,29) e troféu (R$ 20,79).
  O simulador, a tabela "O mesmo pedido em cada janela", os itens liberados e a linha destacada
  dos 8 pacotes são calculados a partir dele. As tabelas fixas do HTML repetem os mesmos números:
  se mudar um pacote, atualize também `index.html`.
- A página muda sozinha conforme o relógio: "abre em" → "termina em" com a janela atual, janelas fechadas
  riscadas e desabilitadas no simulador → "encerrada". Para ver cada estado antes da data, use
  `?agora=`, por exemplo `/prevenda/?agora=2026-11-16T20:30` (1ª hora), `?agora=2026-11-17T10:00` (24h),
  `?agora=2026-11-19T00:00` (encerrada).

### Antes de publicar (pendências da prévia)
- **Link do grupo:** os botões "Entrar no grupo" (`data-cta="grupo"`) abrem o WhatsApp da Achei com
  mensagem pronta. Trocar pelo link de convite do grupo quando existir.
- **Fotos:** Troféu Mundial = `cut/rings.webp`; vôlei e areia = `ligadelas.webp`; outras modalidades =
  `cut/futsal.webp`; corporativo = `cimed.webp`; medalhas = `medalhas.webp`; troféus de 15 cm =
  `cut/podio.webp`. **E-sports não tem foto** (card ilustrado, "modelo em definição"). O chaveiro e os
  demais extras são ilustrações, marcadas como tal.
- **Respostas das perguntas que dependem de regra ainda não definida** foram escritas como "em validação":
  cancelamento (crédito/reembolso e prazos), prazo para usar o pedido, condições de frete, formas de
  pagamento e parcelamento, prazo de produção e entrega. Confirmar com a Achei e reescrever.
- Sorteios marcados como "sujeito a regulamento e autorização" e quantidades "propostas", como no material.
- O simulador também mostra o valor **com** o bônus da janela (ex.: R$ 3.000 na 1ª hora ≈ R$ 894,25),
  calculado com as mesmas médias. Remover a frase em `render()` se a Achei preferir mostrar só o do pacote.
- Testado em 1440×900, 1280×900 e 390×844 (toque), sem rolagem horizontal; respeita `prefers-reduced-motion`.
