# Reel Achei Troféus — relatório de edição

**Entrega:** `output/reel_final.mp4` · 1080×1920 (9:16) · H.264 High · 30 fps · AAC 48 kHz · **22,37 s**
**Montagem:** hook → contexto (São Paulo) → B-roll em L-cut → anúncio da feira → parcerias → fechamento com expectativa.

---

## 1. Material recebido

| Arquivo | Como chegou | Duração | Conteúdo |
|---|---|---|---|
| **IMG_2117** (vídeo principal) | `…A1AA2882…BB267.mov`, 512×910, H.264, 30 fps, AAC 44,1 kHz estéreo | **35,50 s** | Ela sentada na poltrona falando para a câmera (câmera na mão) |
| **IMG_2123** (B-roll) | `…A5B61E51…2510.mov`, 512×910, H.264, 30 fps, AAC 44,1 kHz estéreo | **8,87 s** | Ela caminhando pelo corredor em direção à câmera |

Os arquivos chegaram com nomes gerados pelo upload; a correspondência IMG_2117/IMG_2123 foi feita pelo conteúdo (o de 35,5 s é a fala; o de 8,9 s é a caminhada, sem fala).

**Duração final:** 22,367 s (671 quadros). Fica dentro da faixa de 20–30 s sem cortar nenhuma frase boa.

---

## 2. Análise do material (antes de editar)

### Transcrição completa do IMG_2117
Feita com três modelos independentes (Whisper large-v3, Whisper turbo e NVIDIA Parakeet TDT 0.6B v3). Onde eles discordaram, cada frase candidata foi **pontuada pelo próprio decodificador do Whisper contra o áudio** (escolha forçada) para decidir a leitura mais provável.

| Tempo | Fala |
|---|---|
| 00:00,0–05,4 | *(câmera enquadrando a poltrona vazia; ela entra e sai da borda; ruído e fala fora de quadro, ininteligível)* |
| 05,5–08,4 | *(fala inicial ininteligível — os três modelos divergem completamente)* |
| 08,5–11,0 | "Três dias de muita **[imersão? / invenção? / intenção?]**, gente." |
| 11,1–20,4 | "A Achei Troféus está aqui em São Paulo pra buscar conhecimento de gestão, pra elevar cada vez mais a Achei Troféus, levar muito produto de qualidade pra vocês." |
| 20,5–22,2 | "A semana vai ser incrível." |
| 22,2–28,0 | "A partir de quinta-feira, nós vamos estar na maior feira olímpica da América Latina." |
| 28,0–31,5 | "E lá a gente vai buscar muito mais conteúdo e fazer muita parceria." |
| 31,5–33,3 | "Aguardo mostrar tudo pra vocês." |
| 33,3–35,5 | *(sorriso pós-fala; a câmera avança e ela se levanta)* |

IMG_2123: sem fala (só passos e ambiente do corredor).

### Diagnóstico

- **Frase mais forte (conteúdo):** "A partir de quinta-feira, nós vamos estar na **maior feira olímpica da América Latina**." É a notícia, o "tem coisa grande acontecendo".
- **Melhor hook:** "**A semana vai ser incrível.**" (ver §4).
- **Trechos repetitivos:** "Achei Troféus" duas vezes em 7 s (mantido, é a marca); "buscar" duas vezes ("buscar conhecimento" / "buscar muito mais conteúdo"). Mantido: cortar "buscar muito mais conteúdo e" exigiria emendar "vai | fazer" no meio da frase e quebraria a entonação dela, e o texto ainda informa algo diferente.
- **Pausas desnecessárias:** todo o início (0–11 s) é espera, busca de enquadramento e fala ininteligível. Dentro da fala ela é fluente, com pausas ≤ 0,25 s. Essas pausas foram **mantidas** porque dão respiro e autoridade.
- **Erros de fala:** abertura ininteligível (descartada). "Aguardo mostrar tudo pra vocês" é uma construção levemente incomum, mas foi o que ela disse (a pontuação forçada rejeitou "Aguardo, vou mostrar" e "Aguardem"). A legenda respeita a fala.
- **Respirações:** inspiração audível em 20,33–20,47 s (antes de "A semana"). O hook começa em 20,50, logo depois dela, e o corte escondido pelo B-roll remove a respiração do meio.
- **Momentos de maior expressão:** mãos abertas e sorriso largo em "São Paulo" (12,5–13,1 s); gesto em "incrível" (21,6 s); mãos em concha em "maior feira" (25–26 s); dedo apontando em "Aguardo" (31,6–31,8 s); sorriso final (33,2–33,4 s).
- **Piscadas mapeadas quadro a quadro:** 22,10–22,17; 11,03–11,13; 23,37–23,53. Os cortes foram posicionados em volta delas (§5).
- **Cortes que seriam perceptíveis:** (a) hook → "A Achei Troféus" é um salto de 9 s no mesmo plano. Foi resolvido com mudança de enquadramento (112% → 100%) e corte no fim de uma piscada. (b) Tirar "A semana vai ser incrível" do meio (virou o hook) cria um salto de fala em 20,48 → 22,20, que **o B-roll esconde**.
- **Câmera original:** na mão, com deriva lenta; a operadora se aproxima no fim (a partir de ~33 s o rosto cresce 20%). Entre 25 e 31 s a câmera sobe e sobra muito teto acima da cabeça.

---

## 3. Trechos utilizados e descartados

### Utilizados
| Arquivo | Trecho | Uso |
|---|---|---|
| IMG_2117 | 20,50–22,267 | Hook (reposicionado do meio para a abertura) |
| IMG_2117 | 11,09–18,10 (imagem) / 11,09–20,48 (áudio) | Desenvolvimento; o áudio continua sob o B-roll |
| IMG_2117 | 22,20–23,567 (só áudio) | "A partir de quinta-feira", sob o B-roll |
| IMG_2117 | 23,567–33,467 | Anúncio, parcerias e fechamento |
| IMG_2123 | 3,913–7,850 | B-roll (aproximação e sorriso, termina antes dela passar pela câmera) |
| IMG_2123 | 3,913–7,850 (áudio) | Som direto dos passos, bem baixo, como textura |

### Descartados
| Arquivo | Trecho | Motivo |
|---|---|---|
| IMG_2117 | 0,00–8,45 | Câmera procurando enquadramento, poltrona vazia, fala ininteligível |
| IMG_2117 | 8,45–11,09 | "Três dias de muita ___, gente": a câmera ainda está em movimento até ~9,3 s, e a palavra-chave é ambígua (os três modelos discordam). Legendar um palpite seria inventar fala |
| IMG_2117 | 20,20–20,48 | Pausa e respiração entre frases (ficaram escondidas pelo B-roll) |
| IMG_2117 | 33,467–35,50 | Pós-fala: "cara de terminou", câmera avançando, ela se levantando |
| IMG_2123 | 0,00–3,91 | Início da caminhada, ainda distante e com pouca energia |
| IMG_2123 | 7,85–8,87 | Ela ultrapassa a câmera e sai de quadro; pan final nas ripas |

---

## 4. Narrativa e motivo do hook

**Estrutura:** promessa (hook) → onde e por quê (São Paulo, gestão) → movimento/entrega (B-roll: "levar produto de qualidade pra vocês") → a notícia grande (feira) → o objetivo (parcerias) → expectativa ("Aguardo mostrar tudo pra vocês").

**Por que "A semana vai ser incrível." abre o vídeo:**
1. Cabe exatamente na janela de 0–2 s (1,70 s) e começa na primeira sílaba, sem silêncio.
2. É uma promessa que abre curiosidade ("por quê?"). Os 20 s seguintes respondem a ela.
3. É o momento de maior energia facial do take: sorriso aberto e gesto na palavra "incrível".
4. A frase mais forte ("maior feira olímpica da América Latina") não serve de hook: dura 5,8 s e começa devagar ("A partir de quinta-feira…"). Ela rende mais como virada no meio, com punch-in e push-in.

**Final:** "Aguardo mostrar tudo pra vocês." com gesto e sorriso. Deixa expectativa e convida a acompanhar. O corte acontece 0,17 s depois do "s" final, antes da câmera avançar e antes de qualquer expressão de "terminei".

---

## 5. Cortes, B-roll e punch-ins

### B-roll (IMG_2123), de 00:08,700 a 00:12,467
- **L-cut:** a imagem troca para o corredor na palavra "levar" (áudio contínuo: "…levar muito produto de qualidade pra vocês."). Assim a frase sobre entrega de produto acontece com ela vindo em direção à câmera.
- **Corte escondido:** em 00:11,090 o áudio salta de "pra vocês." (20,48 s) para "A partir de quinta-feira" (22,20 s), com crossfade de 12 ms. Esse corte é invisível porque a imagem é o B-roll.
- **Volta para a poltrona:** em "nós vamos estar…" (23,567 s), com ela já de olhos abertos (a piscada de 23,37–23,53 fica escondida pelo B-roll).
- **Trecho:** 3,913–7,850 s. Termina com ela grande no quadro e sorrindo, antes de passar pela câmera (~8,2 s).
- **Velocidade:** rampa bem discreta, 1,12× no primeiro segundo, desacelerando até 1,00× em 1,8 s. A aproximação e o sorriso rodam em tempo real. Sem interpolação de quadros (nada sintético); os quadros são amostrados diretamente.
- **Enquadramento:** crop de 106% com reenquadramento horizontal suavizado pela posição real dela. Cabeça e pés inteiros enquanto ela está longe; ao se aproximar, os pés saem pela base de forma natural.

### Punch-ins (todos com motivo editorial)
| Momento | Enquadramento | Motivo |
|---|---|---|
| 00:00,000 hook | **112%** | Abertura íntima e forte |
| 00:01,767 "A Achei Troféus…" | 100% | Salto de tempo no mesmo plano vira corte de enquadramento; plano aberto para os gestos em "São Paulo" |
| 00:03,700 "pra buscar conhecimento de gestão" | **108%** (1,22×) | Troca de ideia (o "por quê"), cortado na pausa depois de "São Paulo" |
| 00:06,333 "pra elevar cada vez mais…" | 100% (1,12×) | Respiro antes do B-roll. A linha dos olhos fica em 33,5% para tirar do quadro uma placa vermelha de parede no canto superior |
| 00:12,467 "nós vamos estar na" | 100% | Volta do B-roll em plano normal |
| 00:13,833 "**maior** feira olímpica…" | **112% → 120%** (push-in lento) | Corte exatamente em "maior" (palavra em vermelho na legenda). O push-in de 3 s dá peso à notícia e ainda corrige o excesso de teto da câmera original |
| 00:16,900 "E lá a gente vai…" | 100% | Nova frase, plano volta a abrir |
| 00:20,433 "Aguardo mostrar tudo pra vocês" | **108%** | Entra no gesto de apontar. O avanço real da câmera foi compensado em parte (1,28× → 1,16×) e virou um push-in natural de fechamento |

### Microdecisões de corte
- **Hook → "A Achei Troféus":** a piscada acontece dentro do hook (22,10–22,17), no fim do pensamento. O hook segue 2 quadros além do áudio (a boca forma um "A", que casa com o "A" de "A Achei Troféus" já soando) e corta para o próximo plano quando os olhos dela já estão abertos (11,167 s).
- **Legendas presas aos cortes:** toda troca de legenda a até 4 quadros de um corte de imagem foi alinhada ao próprio corte.
- **Sem transições:** todos os cortes são secos e precisos. Sem glitch, flash, zoom 3D, whip ou efeito pronto.

---

## 6. Enquadramento (reframing por quadro)

- **Rastreamento:** detector de rosto (OpenCV SSD ResNet-10) em todos os 1.331 quadros dos dois arquivos, mais uma máscara do blazer vermelho para o corpo.
- **Poltrona:** em cada plano, a câmera virtual acompanha a posição real do rosto quadro a quadro, suavizada (ajuste polinomial + gaussiana), com o **olho em 36–38% da altura** (terço superior). Isso também estabiliza a deriva da câmera na mão. A escala é por plano, para os níveis 100/108/112% ficarem consistentes (rosto ≈ 23–28% da largura no plano normal e ≈ 28–31% nos punch-ins). As mãos ficam no quadro em todos os planos, porque os gestos são parte da fala dela.
- **Teto:** onde a câmera original subiu (25–31 s), o reenquadramento baixa a janela para não sobrar espaço acima da cabeça.
- **B-roll:** acompanhamento horizontal suave, sem cortar cabeça nem pés de forma estranha.

---

## 7. Legendas e tipografia

- **Fonte:** Inter Tight 800 (a fonte de texto do site da Achei Troféus, convertida das `fonts/` do repositório). Branco, 78 px, no máximo 2 linhas e 2–6 palavras por bloco, em frases naturais (nunca palavra por palavra).
- **Posição:** centro em y = 1478 px, dentro da área segura dos Reels (livre dos botões laterais e da legenda do post), sobre mãos e jeans, que são fundos escuros. Assim a legenda **não cobre o logo da camiseta**.
- **Legibilidade:** halo escuro suave (borda desfocada com 45% de opacidade + sombra leve). Nada de caixa sólida estilo CapCut.
- **Vermelho da marca** (#FF3C4A, versão mais clara do #D21F2D do site para ter contraste no vídeo), em **uma palavra por bloco** e só onde importa: *incrível · gestão · qualidade · maior · parceria · tudo*.
- **Animação:** microescala de 96% para 100% em 4 quadros. Fade-in de 2 quadros só quando a legenda volta depois de uma pausa. Blocos encostados trocam secos, sem quadro vazio entre eles. Sincronizada pelo início de cada palavra (timestamps do Parakeet refinados pelo envelope de voz), entrando 2 quadros antes da fala.
- **Intervenção tipográfica (única):** "**SÃO PAULO.**" em Anton (a fonte display do site), branca e com o ponto final em vermelho da marca, no terço superior acima da cabeça dela, de 00:02,86 a 00:04,30. Entra junto com a palavra "São", com fade e leve subida (o espaçamento das letras fecha de 22 para 10). Ela substitui a legenda de "em São Paulo" para não duplicar texto. Justificativa: é um dado concreto dito por ela (local), com cara de carimbo editorial. Nada foi inventado.

---

## 8. Tratamento de imagem

Tudo feito por clipe, com LUT 3D de 65³ pontos gerado no espaço OKLab (perceptual). Primeiro a correção técnica, depois um grade criativo mínimo.

**Diagnóstico medido na pele, na camiseta e no blazer:**
- **IMG_2117:** dominante magenta/fria. Blazer puxando para o rosa (matiz 9°, contra 24° do vermelho da marca), pele rosada (matiz 38°) e camiseta azulada (luz mista).
- **IMG_2123:** rosto ~1 stop mais escuro, parede azul (luz do dia) e pele alaranjada na sombra.

| Ajuste | IMG_2117 | IMG_2123 |
|---|---|---|
| Balanço de branco (ganhos lineares R/G/B) | 1,04 / 1,00 / 0,90 | 0,95 / 1,00 / 1,07 |
| Curva de luminância | Preto de 0,10 para 0,07, contraste moderado, teto em 98,5% | Médios elevados (rosto de L 0,48 para 0,57), preto preservado, teto em 98,5% |
| Vermelhos | Matiz +11° (magenta → vermelho verdadeiro), croma +6% | Matiz −3°, croma +14%, luminância −0,035 (blazer denso, não laranja) |
| Pele | Croma −3% | Croma −12% (sem laranja) |
| Azuis | −25% | −45% (parede neutra) |
| Branco da camiseta | Croma dos neutros claros −80% | Croma dos neutros claros −75% |
| Sombras | Croma −25% abaixo de L 0,22 (pretos limpos, sem esmagar) | Idem |
| Proteção de gamut | Teto suave de croma (joelho em 0,19) | Idem |

**Resultado medido:** blazer com matiz 22° / 20° (os dois clipes iguais entre si e iguais à marca); pele com matiz 45° / 51°; camiseta com croma 0,019 / 0,010 (branca de verdade); madeira quente. Sem filtro laranja, sem HDR artificial.

**Upscale (512×910 → 1080×1920):** FSRCNN ×2 (rede pequena de reconstrução, não generativa; não cria rosto nem textura nova), depois reamostragem Lanczos com o crop do reenquadramento e nitidez leve (unsharp σ 1,1, 32%).

**Identidade preservada:** nenhum filtro de beleza, afinamento, troca de fundo ou alteração de roupa/logo, e nenhum quadro gerado ou interpolado. Todos os quadros são da filmagem real.

---

## 9. Tratamento de áudio

Voz (IMG_2117), mono centralizada em estéreo, 48 kHz:
1. **Montagem** com crossfades de potência constante de 12 ms em cada emenda; fade-in de 15 ms e fade-out de 120 ms.
2. **Redução de ruído** espectral com o perfil da própria sala, medido nas pausas da gravação (ganho decision-directed, piso de −13 dB, sem gate e sem "som de lata"). O ronco grave nas pausas caiu ~10 dB (pausas de −26,5 para −36,7 dBFS RMS; voz a ~−12 dBFS).
3. **High-pass** de 100 Hz, 24 dB/oitava (tira ronco de ar-condicionado e manuseio).
4. **EQ:** −2,5 dB em 210 Hz (embolado), −1,5 dB em 480 Hz (caixa), +3 dB em 3,1 kHz (presença), +1 dB em 7 kHz (ar).
5. **De-esser** (intensidade 0,35).
6. **Compressor:** limiar −24 dB, razão 3:1, ataque 8 ms, release 120 ms, joelho 6 dB, makeup +4 dB.
7. **Som direto do B-roll** (passos no corredor) bem baixo, filtrado 180 Hz–9 kHz, só sob o B-roll.
8. **Normalização:** ganho estático até **−14,0 LUFS integrado** e limitador em −2 dBFS.

**Medido no arquivo final:** −14,1 LUFS · **pico real −1,9 dBTP** · LRA 4,8 LU (voz estável, sem saltos de volume) · zero clipping (flat factor 0). A transcrição Whisper do áudio final reproduz o texto completo, sem palavra cortada.

**Música:** não há trilha licenciada disponível no ambiente, então **a versão é sem música** (nenhum arquivo foi inventado). Para incluir uma trilha licenciada depois, com ducking automático sob a voz:

```bash
ffmpeg -i reel_final.mp4 -i trilha.mp3 -filter_complex \
 "[1:a]volume=-20dB,afade=t=in:d=0.3,afade=t=out:st=21.4:d=0.9[m]; \
  [0:a]asplit[v][sc]; [m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=350[md]; \
  [v][md]amix=inputs=2:normalize=0,alimiter=limit=0.79[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -shortest reel_com_trilha.mp4
```

---

## 10. Parâmetros de exportação

| | |
|---|---|
| Container | MP4, `+faststart` |
| Vídeo | H.264 (libx264) High @ L4.1, CRF 16, preset slow, VBV máx. 20 Mb/s, GOP 60 (2 s), aq-mode 3 |
| Resolução / quadros | 1080×1920, SAR 1:1, 30 fps constantes, 671 quadros |
| Cor | yuv420p, BT.709 (primárias, transferência e matriz), faixa limitada (tv), com tags |
| Áudio | AAC-LC, 48 kHz, estéreo, 256 kb/s |
| Duração | 22,367 s |

---

## 11. Checagem final (QC)

- Sem quadros pretos (`blackdetect`) e sem quadros congelados (`freezedetect`).
- Cada corte revisado quadro a quadro (±2 quadros): sem piscada nos pontos de corte, gestos contínuos nas trocas de enquadramento.
- Legendas conferidas contra o áudio e quadro a quadro. Nenhuma troca de legenda fica a 1–4 quadros de um corte de imagem, e não há quadro vazio entre blocos. Os únicos intervalos sem legenda são intencionais: 3,0–3,7 s, onde "SÃO PAULO." ocupa o lugar, e o fade dos 2 últimos quadros.
- Sem clipping; loudness e picos dentro do alvo; emendas de áudio sem clique.
- Formato 9:16 exato, SAR 1:1, sem barras.

## 12. Observações

- **Resolução de origem:** os dois arquivos chegaram em 512×910, provavelmente comprimidos no envio. O resultado é limpo, mas é um upscale de ~2,1× a 2,9×. Se houver os originais do iPhone (1080p/4K), a mesma edição pode ser reexportada com nitidez muito maior. O pipeline é independente de resolução e mantém todos os cortes.
- **Nome do evento:** os três modelos de transcrição concordam em "maior feira **olímpica** da América Latina". Vale confirmar com ela antes de publicar.
- **Fala descartada:** "Três dias de muita ___" ficou fora por ambiguidade. Se ela confirmar a palavra (provavelmente "imersão"), a frase pode entrar, mas a abertura atual é mais forte.
