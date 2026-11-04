/* Achei Troféus — catálogo da pré-venda (PRÉVIA)
   Transcrito do texto da vitrine atual. Substituir pelo arquivo oficial quando chegar.

   Cada modelo: 'Nome|tamanho|de|por|desconto'
     tamanho  "30" (um tamanho) ou "30 a 50" (faixa; o preço é o do menor tamanho, "a partir de")
     de/por   preço por unidade, em reais ("120,89")
   Os grupos seguem a ordem da vitrine. mod: null = modalidade ainda não informada no texto
   (vai para "A classificar" até o catálogo oficial). tipo: 't' troféu, 'm' medalha.
   img (opcional, por modelo ou kit): caminho da foto; sem foto, a loja desenha uma ilustração. */
window.CATALOGO = {
  modalidades: [
    { id: 'futebol', slug: 'futebol-futsal', nome: 'Futebol e futsal', ic: 'i-soccer' },
    { id: 'beach', slug: 'beach-tennis', nome: 'Beach tennis', ic: 'i-racket' },
    { id: 'volei', slug: 'volei', nome: 'Vôlei', ic: 'i-volley' },
    { id: 'futevolei', slug: 'futevolei', nome: 'Futevôlei', ic: 'i-wave' },
    { id: 'tenis', slug: 'tenis', nome: 'Tênis', ic: 'i-tennis' },
    { id: 'corrida', slug: 'corrida', nome: 'Corrida', ic: 'i-run' },
    { id: 'padel', slug: 'padel', nome: 'Padel', ic: 'i-padel' },
    { id: 'ciclismo', slug: 'ciclismo', nome: 'Ciclismo', ic: 'i-bike' },
    { id: 'basquete', slug: 'basquete', nome: 'Basquete', ic: 'i-basket' },
    { id: 'pesca', slug: 'pescaria', nome: 'Pescaria', ic: 'i-fish' },
    { id: 'poker', slug: 'poquer-baralho', nome: 'Pôquer e baralho', ic: 'i-cards' },
    { id: 'lutas', slug: 'lutas', nome: 'Lutas', ic: 'i-fight' },
    { id: 'homenagem', slug: 'homenagem', nome: 'Homenagem', ic: 'i-laurel' }
  ],

  grupos: [
    { mod: 'futebol', tipo: 't', itens: [
      'Inglaterra|30 a 50|120,89|96,71|20', 'Gold Stadium|23|98,95|84,11|15', 'Maracanã|23|81,29|65,03|20',
      'Chuteira|20|54,49|46,32|15', 'Bola Master|20|54,89|46,66|15', 'Goleiro Master|20|48,29|41,05|15',
      'Bola Murcha|20|43,89|32,92|25', 'Chuteira de Ouro|17|87,84|74,66|15', 'Bola de Ouro|20|98,95|84,11|15',
      'Goleiro de Ouro|20|87,84|74,66|15', 'Árbitro de Ouro|20|87,84|65,88|25', 'Assistência|30|43,34|32,51|25',
      'Artilheiro|30|43,34|34,67|20', 'Goleiro|30|43,34|34,67|20', 'Craque|30|43,34|32,51|25',
      'Argentina|50 a 90|351,84|263,88|25', 'Uruguai|40 a 60|84,90|67,92|20', 'Equador|25 a 40|44,80|33,60|25',
      'Chile|20 a 30|22,90|19,47|15', 'Bolívia|30|91,85|68,89|25', 'Arbitragem|20|50,49|42,92|15',
      'Melhor Técnico|20|52,69|42,15|20'
    ] },
    { mod: null, tipo: 't', itens: [
      'Rio Pomba|20 a 25|31,90|23,93|25', 'Mercês|17 a 20|38,70|29,03|25', 'Arraial do Cabo|20 a 25|46,10|32,27|30',
      'Caxias do Sul|15 a 25|35,90|26,93|25', 'Guarapari|20 a 30|45,90|34,43|25', 'Viçosa|20|79,90|59,93|25',
      'Tocantins|15 a 25|16,90|14,37|15', 'Goiânia|25 a 40|44,90|33,68|25', 'Piraúba|15 a 18|33,90|23,73|30',
      'Juiz de Fora|15 a 23|34,90|26,18|25', 'Ubatuba|20 a 25|39,60|27,72|30', 'Porto Alegre|20 a 25|37,35|28,01|25',
      'Manaus|25 a 40|46,10|34,58|25', 'Cabo Frio|20 a 25|40,50|30,38|25', 'Campos|20 a 25|51,40|38,55|25',
      'Macaé|13 a 15|56,80|42,60|25', 'Angra dos Reis|17 a 20|42,80|34,24|20', 'Ilha Guaíba|20 a 35|37,30|27,98|25',
      'Dubai|22 a 25|51,40|38,55|25', 'Ilha Bela|25 a 40|45,80|34,35|25', 'Maragogi|16 a 20|32,85|24,64|25',
      'Anchieta|16 a 25|24,90|21,17|15', 'Amazônia|20 a 30|47,90|35,93|25', 'Campinas|20 a 25|36,20|27,15|25',
      'Belo Horizonte|22 a 26|44,90|33,68|25', 'Balneário Camboriú|20 a 30|50,50|37,88|25', 'Foz do Iguaçu|20 a 30|39,90|31,92|20',
      'São Paulo|20 a 27|39,65|29,74|25', 'Criciúma|20 a 27|39,50|29,63|25', 'Campina Grande|20 a 27|27,30|23,21|15',
      'Petrópolis|20 a 27|37,90|26,53|30', 'Maringá|20 a 27|30,65|22,99|25', 'Rio de Janeiro|20 a 25|38,90|27,23|30',
      'Salvador|13 a 17|53,75|40,31|25', 'Fortaleza|15 a 25|36,20|27,15|25', 'Búzius|25 a 40|39,90|31,92|20',
      'Maranhão|17 a 25|37,90|28,43|25', 'São Luis|15 a 25|25,25|18,94|25', 'Florianópolis|22 a 25|73,20|54,90|25',
      'Niterói|15 a 25|24,90|19,92|20', 'Olinda|15 a 18|37,35|28,01|25', 'Aracajú|17 a 23|30,70|21,49|30',
      'Maceió|18 a 25|28,95|24,61|15', 'Sorocaba|20 a 25|43,90|32,93|25', 'Guarujá|20 a 27|42,80|29,96|30',
      'Jundiaí|20 a 25|34,90|26,18|25', 'Amapá|16 a 20|79,90|59,93|25', 'Muriaé|20 a 30|42,90|32,18|25',
      'Alagoas|15 a 20|34,65|25,99|25', 'Cuiabá|20 a 25|41,90|31,43|25', 'Recife|20 a 25|43,90|32,93|25',
      'Curitiba|20 a 25|38,90|29,18|25', 'Acre|17 a 23|28,95|20,27|30', 'Brasília|17 a 23|31,65|23,74|25',
      'Neon 1|20 a 23|52,90|39,68|25', 'Neon 2|20 a 23|39,90|29,93|25', 'Neon 3|20 a 25|36,90|25,83|30',
      'Neon 4|20 a 25|29,90|22,43|25', 'Neon 5|20 a 25|36,90|27,68|25', 'Neon 6|20 a 25|52,90|39,68|25',
      'Neon 7|20 a 25|36,90|25,83|30', 'Neon 8|20 a 23|39,90|29,93|25', 'Neon 9|20 a 25|29,90|23,92|20',
      'Neon 10|20 a 25|43,90|30,73|30', 'Neon 11|20 a 25|33,90|23,73|30', 'Neon 12|20 a 25|36,85|27,64|25',
      'Califórnia|20 a 25|40,25|30,19|25', 'Flórida|20 a 30|39,50|29,63|25', 'Texas|20 a 35|37,80|28,35|25',
      'Alaska|25 a 40|41,90|33,52|20', 'Hawaí|25 a 40|45,80|36,64|20', 'Geórgia|25 a 40|37,30|29,84|20',
      'Arizona|25 a 40|43,90|37,32|15', 'Pensilvânia|25 a 40|41,65|35,40|15', 'Colorado|15 a 30|26,90|20,18|25',
      'Alabama|20 a 35|25,75|21,89|15', 'Luisiana|15 a 25|20,90|15,68|25', 'Kansas|16 a 25|24,90|18,68|25',
      'Charlotte|25 a 40|33,90|27,12|20', 'Portland|20 a 30|39,00|29,25|25', 'Phoenix|20 a 30|51,65|38,74|25',
      'Columbus|25 a 40|46,10|32,27|30', 'Sacramento|20 a 30|22,90|19,47|15', 'Memphis|35 a 60|108,95|76,27|30',
      'Milwaukee|25 a 30|44,90|33,68|25', 'Nova Iguaçu|20 a 35|29,90|22,43|25', 'Mineápolis|23 a 27|28,45|22,76|20',
      'Pitsburgo|20|51,90|38,93|25', 'Cleveland|20 a 40|37,20|27,90|25', 'Tulsa|25 a 30|29,90|23,92|20',
      'Virgínia|20 a 25|33,90|28,82|15', 'Ohio|15 a 25|16,90|14,37|15', 'Michigan|25 a 35|44,90|31,43|30',
      'Maryland|25 a 45|57,50|40,25|30', 'Sydney|25 a 40|61,49|46,12|25', 'Washington|30 a 50|85,65|59,96|30',
      'Tennessee|15 a 25|25,25|18,94|25', 'Nova Jersey|20 a 27|27,30|21,84|20', 'Nebraska|20 a 25|39,90|29,93|25',
      'Hollywood|20 a 27|43,90|30,73|30', 'Delaware|18 a 25|28,95|21,71|25', 'Áustria|20 a 50|28,16|23,94|15',
      'Filadélfia|20 a 30|39,20|27,44|30', 'Dallas|15 a 25|36,20|25,34|30', 'São Francisco|20 a 25|20,60|17,51|15',
      'Austin|20 a 50|37,20|27,90|25', 'Seattle|20|31,60|23,70|25',
      'Alemanha|25 a 40|39,90|33,92|15', 'Las Vegas Color|20 a 25|35,90|25,13|30', 'Las Vegas Amadeirado|20 a 25|25,90|20,72|20',
      'Miami|15 a 25|25,25|20,20|20', 'Detroit|20 a 30|40,60|28,42|30', 'Roma Color|25 a 50|50,40|40,32|20',
      'Roma Amadeirado|25 a 50|45,80|36,64|20', 'New Orleans|25 a 40|46,10|32,27|30', 'Istambul|20 a 40|37,30|27,98|25',
      'Turquia|25 a 40|39,49|31,59|20', 'Espanha|20 a 30|22,90|19,47|15', 'Itália|20 a 60|40,59|32,47|20',
      'Viena Amadeirado|15 a 25|16,90|14,37|15', 'Viena Color|15 a 20|25,90|19,43|25', 'Berlim|15 a 30|18,60|14,88|20',
      'Torino|20|54,89|38,42|30', 'Chicago|20 a 25|40,60|32,48|20', 'Turim|15 a 20|26,90|20,18|25',
      'Palermo|15 a 20|26,90|21,52|20', 'Milão|15 a 20|26,90|20,18|25', 'Napoli|16 a 25|24,90|17,43|30',
      'Madrid|15 a 25|25,20|17,64|30', 'Melhor Técnico|15 a 20|26,90|18,83|30', 'Génova|15 a 20|26,90|20,18|25',
      'Ravena|15 a 20|26,90|20,18|25', 'Vicenza|15 a 20|26,90|18,83|30', 'Lecce|15 a 20|26,90|21,52|20',
      'Braga|15 a 20|26,90|20,18|25'
    ] },
    { mod: 'corrida', tipo: 't', itens: [
      'Corrida 01|20 a 30|20,80|17,68|15', 'Corrida 02|20 a 25|20,90|17,77|15', 'Corrida 03|25 a 35|37,30|27,98|25',
      'Corrida 04|20 a 25|28,90|24,57|15', 'Corrida 05|20 a 25|39,50|29,63|25', 'Corrida 06|16 a 25|24,90|18,68|25',
      'Corrida 07|20 a 25|20,90|17,77|15', 'Corrida 08|15 a 25|24,90|17,43|30', 'Corrida 09|20 a 25|20,60|16,48|20',
      'Corrida 10|20 a 27|27,30|19,11|30', 'Corrida 11|15 a 25|25,25|17,68|30', 'Corrida 12|18 a 25|28,95|21,71|25'
    ] },
    { mod: 'ciclismo', tipo: 't', itens: [
      'Ciclismo/MTB 1|20 a 25|36,20|27,15|25', 'Ciclismo/MTB 2|15 a 30|18,90|13,23|30', 'Ciclismo/MTB 3|20 a 30|39,40|29,55|25',
      'Ciclismo/MTB 4|25 a 30|39,00|29,25|25', 'Ciclismo/MTB 5|20 a 25|56,00|42,00|25', 'Ciclismo/MTB 6|15 a 25|19,90|13,93|30',
      'Ciclismo/MTB 7|20 a 25|37,70|26,39|30', 'Ciclismo/MTB 8|20 a 27|39,60|29,70|25', 'Ciclismo/MTB 9|20 a 25|59,90|41,93|30',
      'Ciclismo/MTB 10|15 a 25|58,00|43,50|25', 'Ciclismo/MTB 11|25 a 35|37,90|28,43|25', 'Ciclismo/MTB 12|25 a 35|38,80|27,16|30'
    ] },
    { mod: 'basquete', tipo: 't', itens: [
      'Basquetebol 01|25 a 40|39,10|29,33|25', 'Basquetebol 02|20 a 30|39,50|27,65|30', 'Basquetebol 03|15 a 30|20,70|15,53|25',
      'Basquetebol 04|25 a 35|44,90|31,43|30', 'Basquetebol 05|20 a 30|24,50|18,38|25', 'Basquetebol 06|35 a 50|108,90|81,68|25',
      'Basquetebol 07|25 a 40|35,90|26,93|25', 'Basquetebol 08|25 a 40|42,80|29,96|30', 'Basquetebol 09|20 a 30|29,90|20,93|30',
      'Basquetebol 11|15 a 25|22,90|16,03|30', 'Basquetebol 12|20 a 30|36,90|27,68|25'
    ] },
    { mod: 'padel', tipo: 't', itens: [
      'Padel 01|20|43,90|32,93|25', 'Padel 02|18 a 25|28,95|20,27|30', 'Padel 03|20 a 30|50,55|37,91|25',
      'Padel 04|25 a 35|42,90|32,18|25', 'Padel 05|20|58,50|43,88|25', 'Padel 06|20|65,90|49,43|25',
      'Padel 07|20|58,90|44,18|25', 'Padel 08|16 a 25|24,90|18,68|25', 'Padel 09|20 a 25|39,90|29,93|25',
      'Padel 10|20 a 30|27,30|20,48|25', 'Padel 11|15 a 25|25,25|18,94|25', 'Padel 12|20 a 35|37,30|27,98|25'
    ] },
    { mod: 'pesca', tipo: 't', itens: [
      'Pesca 1|20 a 50|25,60|17,92|30', 'Pesca 2|25 a 40|35,90|26,93|25', 'Pesca 3|25 a 40|39,90|27,93|30',
      'Pesca 4|15 a 25|22,90|16,03|30', 'Pesca 5|25 a 35|35,90|25,13|30', 'Pesca 6|25 a 40|36,90|25,83|30',
      'Pesca 7|25 a 40|39,05|27,34|30', 'Pesca 8|20 a 30|38,50|26,95|30', 'Pesca 9|20 a 25|29,90|22,43|25',
      'Pesca 10|20 a 25|29,90|22,43|25', 'Pesca 11|20 a 25|29,90|20,93|30'
    ] },
    { mod: 'poker', tipo: 't', itens: [
      'Poker 01|20 a 30|27,90|20,93|25', 'Poker 02|20 a 30|24,90|18,68|25', 'Poker 03|15 a 25|20,90|14,63|30',
      'Poker 04|25 a 40|41,90|29,33|30', 'Poker 05|25 a 40|43,90|32,93|25', 'Poker 06|25 a 30|29,90|22,43|25',
      'Baralho 01|20 a 27|27,30|20,48|25', 'Baralho 02|20 a 35|59,90|44,93|25', 'Baralho 03|20 a 25|35,90|26,93|25',
      'Baralho 04|20 a 25|45,80|36,64|20', 'Baralho 05|25|44,40|31,08|30', 'Baralho 06|15 a 25|25,25|18,94|25'
    ] },
    { mod: 'homenagem', tipo: 't', itens: [
      'Homenagem 001|20 a 25|35,80|28,64|20', 'Homenagem 002|20 a 25|72,50|54,38|25', 'Homenagem 003|20 a 25|53,40|37,38|30',
      'Homenagem 004|20 a 25|33,90|25,43|25', 'Homenagem 005|20|89,00|66,75|25', 'Homenagem 006|20|36,20|27,15|25',
      'Homenagem 007|20 a 25|36,70|27,53|25', 'Homenagem 008|17 a 25|26,50|18,55|30', 'Homenagem 009|25|56,90|45,52|20',
      'Homenagem 010|20 a 25|39,90|29,93|25', 'Homenagem 011|20 a 30|42,90|32,18|25', 'Homenagem 012|25 a 30|57,70|40,39|30',
      'Homenagem 013|20|39,80|29,85|25', 'Homenagem 014|20 a 25|65,20|48,90|25', 'Homenagem 015|23|80,00|56,00|30',
      'Homenagem 016|17 a 25|25,40|19,05|25', 'Homenagem 017|17 a 25|24,90|19,92|20', 'Homenagem 018|17 a 25|25,40|17,78|30',
      'Homenagem 019|17 a 25|36,20|27,15|25', 'Homenagem 020|17 a 25|24,90|18,68|25', 'Homenagem 021|20|179,50|125,65|30',
      'Homenagem 022|20|129,90|90,93|30', 'Homenagem 023|20|129,90|90,93|30', 'Homenagem 024|16|39,90|27,93|30',
      'Homenagem 025|15 a 20|27,80|20,85|25', 'Homenagem 026|12 a 17|28,50|19,95|30', 'Homenagem 027|17 a 20|34,90|26,18|25',
      'Homenagem 028|17 a 20|38,90|29,18|25', 'Homenagem 029|20|76,80|57,60|25', 'Homenagem 030|23|90,00|67,50|25',
      'Homenagem 031|20 a 25|35,20|24,64|30', 'Homenagem 032|17 a 20|44,20|30,94|30', 'Homenagem 033|20 a 25|48,50|36,38|25',
      'Homenagem 034|20 a 25|55,80|39,06|30', 'Homenagem 035|20 a 25|59,90|44,93|25', 'Homenagem 036|17 a 20|45,40|31,78|30'
    ] },
    { mod: 'futebol', tipo: 'm', itens: [
      'Fut 01|8 a 12|10,90|7,63|30', 'Fut 02|6 a 10|5,90|5,02|15', 'Fut 03|8 a 12|10,90|9,27|15',
      'Fut 04|8 a 12|10,90|8,18|25', 'Fut 05|8 a 12|10,90|8,18|25', 'Fut 06|8 a 12|10,90|8,18|25',
      'Fut 07|6 a 10|5,90|4,72|20', 'Fut 08|8 a 12|10,90|9,27|15', 'Fut 09|8 a 12|10,90|8,72|20',
      'Fut 10|8 a 12|10,90|8,18|25', 'Fut 11|8 a 12|10,90|8,18|25', 'Fut 12|8 a 12|10,90|7,63|30',
      'Fut 13|8 a 12|10,90|8,18|25', 'Fut 14|8 a 12|10,90|8,18|25', 'Fut 15|8 a 12|10,90|8,18|25',
      'Fut 16|8 a 12|10,90|8,18|25', 'Fut 17|6 a 10|5,90|4,43|25', 'Fut 18|8 a 12|10,90|8,18|25',
      'Fut 19|8 a 12|10,90|9,27|15', 'Fut 20|8 a 12|10,90|8,18|25', 'Fut 21|8 a 12|10,90|8,72|20',
      'Fut 22|8 a 12|10,90|9,27|15', 'Fut 23|8 a 12|10,90|7,63|30', 'Fut 24|8 a 12|10,90|8,18|25'
    ] },
    { mod: 'volei', tipo: 'm', itens: [
      'Vôlei 01|8 a 12|10,90|9,27|15', 'Vôlei 02|6 a 10|5,90|5,02|15', 'Vôlei 03|8 a 12|10,90|7,63|30',
      'Vôlei 04|8 a 12|10,90|7,63|30', 'Vôlei 05|8 a 12|10,90|8,18|25', 'Vôlei 06|8 a 12|10,90|9,27|15',
      'Vôlei 07|8 a 12|10,90|9,27|15', 'Vôlei 08|8 a 12|10,90|8,18|25', 'Vôlei 09|6 a 10|5,90|4,43|25',
      'Vôlei 10|8 a 12|10,90|8,72|20', 'Vôlei 11|8 a 12|10,90|8,72|20', 'Vôlei 12|6 a 10|5,90|4,72|20'
    ] },
    { mod: 'beach', tipo: 'm', itens: [
      'Beach 01|8 a 12|10,90|7,63|30', 'Beach 02|8 a 12|10,90|8,18|25', 'Beach 03|6 a 10|5,90|4,13|30',
      'Beach 04|8 a 12|10,90|9,27|15', 'Beach 05|8 a 12|10,90|8,18|25', 'Beach 06|8 a 12|10,90|7,63|30',
      'Beach 07|8 a 12|10,90|8,18|25', 'Beach 08|8 a 12|10,90|8,72|20'
    ] },
    { mod: 'tenis', tipo: 'm', itens: [
      'Tênis 01|8 a 12|10,90|7,63|30', 'Tênis 02|8 a 12|10,90|8,18|25', 'Tênis 03|8 a 12|10,90|7,63|30',
      'Tênis 04|8 a 12|10,90|7,63|30'
    ] },
    { mod: 'corrida', tipo: 'm', itens: [
      'Corrida 01|8 a 12|10,90|7,63|30', 'Corrida 02|8 a 12|10,90|8,18|25', 'Corrida 03|8 a 12|10,90|7,63|30',
      'Corrida 04|8 a 12|10,90|8,18|25'
    ] },
    { mod: 'ciclismo', tipo: 'm', itens: ['Ciclismo 01|8 a 12|10,90|8,18|25', 'Ciclismo 02|8 a 12|10,90|8,18|25'] },
    { mod: 'lutas', tipo: 'm', itens: ['Luta 01|8 a 12|10,90|7,63|30', 'Luta 02|8 a 12|10,90|8,18|25'] },
    { mod: null, tipo: 'm', itens: [
      'Logomarcas 01|8 a 12|10,90|8,72|20', 'Logomarcas 02|8 a 12|10,90|9,27|15', 'Logomarcas 03|6 a 10|5,90|4,72|20',
      'Logomarcas 04|6 a 10|5,90|4,72|20'
    ] },
    { mod: null, tipo: 't', itens: ['Sucesso|25|44,90|33,68|25'] },
    { mod: 'beach', tipo: 't', itens: ['Conquista Beach|25|49,90|34,93|30'] },
    { mod: 'lutas', tipo: 't', itens: ['Combate Corda|25|49,90|34,93|30'] },
    { mod: null, tipo: 't', itens: ['Triunfo|25|49,90|37,43|25'] },
    { mod: 'beach', tipo: 't', itens: ['Triunfo Beach|25|49,90|37,43|25'] },
    { mod: 'lutas', tipo: 't', itens: ['Combate Luta|25|54,90|41,18|25'] }
  ],

  /* Kits prontos. de/por em centavos, como na vitrine. desc = desconto mostrado.
     pecas: [id do modelo, quantidade] — só o "Copa com destaques" veio com a lista.
     Nos demais, o kit entra no carrinho fechado, pelo preço do kit. */
  kits: [
    { id: 'futebol-torneio-de-bairro', nome: 'Torneio de bairro', mod: 'futebol', med: 132, tro: 6, de: 181006, por: 130974, desc: 27 },
    { id: 'futebol-copa-com-destaques', nome: 'Copa com destaques', mod: 'futebol', med: 122, tro: 10, de: 202838, por: 150902, desc: 25,
      pecas: [
        ['futebol-futsal-gold-stadium', 2], ['futebol-futsal-craque', 1], ['futebol-futsal-artilheiro', 1],
        ['futebol-futsal-goleiro', 1], ['futebol-futsal-assistencia', 1], ['futebol-futsal-bola-de-ouro', 1],
        ['futebol-futsal-chuteira-de-ouro', 1], ['futebol-futsal-goleiro-de-ouro', 1], ['futebol-futsal-melhor-tecnico', 1],
        ['medalhas-fut-01', 122]
      ] },
    { id: 'futebol-campeonato-completo', nome: 'Campeonato completo', mod: 'futebol', med: 145, tro: 36, de: 388500, por: 301639, desc: 22 },
    { id: 'futebol-libera-o-mundial', nome: 'Libera o Mundial: Futebol', mod: 'futebol', med: 158, tro: 72, de: 633120, por: 502562, desc: 20 },
    { id: 'beach-torneio-de-duplas', nome: 'Torneio de duplas', mod: 'beach', med: 88, tro: 20, de: 183320, por: 130574, desc: 28 },
    { id: 'beach-torneio-por-categorias', nome: 'Torneio por categorias', mod: 'beach', med: 79, tro: 22, de: 200400, por: 150348, desc: 24 },
    { id: 'beach-circuito-de-duplas', nome: 'Circuito de duplas', mod: 'beach', med: 146, tro: 36, de: 413060, por: 301842, desc: 26 },
    { id: 'beach-libera-o-mundial', nome: 'Libera o Mundial: Beach Tennis', mod: 'beach', med: 275, tro: 56, de: 689790, por: 502361, desc: 27 },
    { id: 'volei-torneio-de-volei', nome: 'Torneio de vôlei', mod: 'volei', med: 103, tro: 12, de: 157450, por: 130349, desc: 17 },
    { id: 'volei-copa-com-posicoes', nome: 'Copa com posições', mod: 'volei', med: 143, tro: 12, de: 209810, por: 150559, desc: 28 },
    { id: 'volei-campeonato-de-volei', nome: 'Campeonato de vôlei', mod: 'volei', med: 209, tro: 24, de: 368194, por: 301939, desc: 17 },
    { id: 'volei-libera-o-mundial', nome: 'Libera o Mundial: Vôlei', mod: 'volei', med: 309, tro: 48, de: 617578, por: 502835, desc: 18 },
    { id: 'kit-torneio-de-duplas-2', nome: 'Torneio de duplas', mod: null, med: 65, tro: 20, de: 166550, por: 130550, desc: 21 },
    { id: 'kit-torneio-por-categorias-2', nome: 'Torneio por categorias', mod: null, med: 33, tro: 26, de: 204190, por: 150680, desc: 26 },
    { id: 'kit-circuito-de-duplas-2', nome: 'Circuito de duplas', mod: null, med: 92, tro: 36, de: 402600, por: 301584, desc: 25 },
    { id: 'corrida-kit-participantes', nome: 'Corrida: kit participantes', mod: 'corrida', med: 146, tro: 9, de: 182870, por: 130454, desc: 28 },
    { id: 'corrida-grande-evento', nome: 'Corrida: grande evento', mod: 'corrida', med: 118, tro: 112, de: 380970, por: 301502, desc: 20 },
    { id: 'kit-torneio-de-duplas-3', nome: 'Torneio de duplas', mod: null, med: 0, tro: 34, de: 174620, por: 130972, desc: 24 },
    { id: 'homenagem-reconhecimento-de-equipe', nome: 'Reconhecimento de equipe', mod: 'homenagem', med: 0, tro: 34, de: 178620, por: 131192, desc: 26 }
  ]
};
