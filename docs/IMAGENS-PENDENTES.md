# Imagens pendentes

Para conferir a qualquer momento o que já está no lugar, rode `npm run imagens`.

Todas as imagens do caso 1 vão para a pasta `public/imagens/casos/caso-001/`, com o nome exato da tabela. Formato JPG, de preferência com o lado maior entre 1200 e 1600 px, sem nenhum dado de paciente visível (nome, data de nascimento, número de prontuário, hospital).

Enquanto a imagem não existe, o app mostra um aviso "Imagem pendente" com o código da imagem, no lugar exato em que ela vai aparecer.

## Caso 1: obstrução de delgado por brida

| Código | Arquivo | Exame | Quando aparece | O que a imagem precisa mostrar |
| --- | --- | --- | --- | --- |
| IMG-001-A | `img-001-a.jpg` | Radiografias de abdome e tórax (EX-12) | Quando o aluno pede a radiografia, em qualquer momento | Radiografia de abdome **em ortostase**: alças de delgado distendidas (até 4 cm), níveis hidroaéreos em degraus, pouco gás no cólon, **sem pneumoperitônio** |
| IMG-001-B | pasta `img-001-b/` com `01.jpg`, `02.jpg`, … | Tomografia de abdome com contraste venoso (EX-13) | Quando o aluno pede a tomografia no M1 ou no M2 | **Série de 8 a 12 cortes axiais** em sequência, em torno do ponto de transição no íleo distal, na pelve. Alças proximais distendidas (até 4,2 cm), sinal das fezes no delgado, alças distais colabadas, realce da parede preservado, sem líquido livre, sem sinal do redemoinho |
| IMG-001-C | `img-001-c.jpg` | Radiografia de controle após contraste hidrossolúvel (EX-14) | Só a partir do M3, quando o aluno pede a radiografia de controle | Radiografia 24 horas após contraste hidrossolúvel (Gastrografin) com **contraste retido em alças de delgado, sem chegar ao cólon** |
| IMG-001-D | `img-001-d.jpg` | Tomografia de controle (EX-13 atualizado) | No M3, se o aluno pedir nova tomografia | Segmento ileal de cerca de 15 cm com **parede espessada e realce reduzido**, edema do mesentério e pouco líquido livre entre as alças, sem pneumoperitônio |

### Detalhes importantes

- **IMG-001-B é uma série.** Quando você tiver os cortes, me diga quantos são e eu coloco o número no caso, no campo `quantidade`. O app mostra os cortes com uma barra para passar de um para outro, como num visualizador de tomografia.
- **EX-12 inclui decúbito e tórax**, mas o caso só tem a imagem em ortostase. Se você conseguir a radiografia em decúbito e a de tórax (mostrando que não há pneumoperitônio), dá para acrescentá-las como imagens extras.
- **IMG-001-A e IMG-001-B** já estão marcadas no caso como vindas do Radiopaedia, com licença CC BY-NC-SA. **IMG-001-C e IMG-001-D** estão com fonte e licença "A definir".

## Crédito e licença (obrigatório)

Para cada imagem, anote e me passe:

1. **Fonte:** o site e o caso de origem. No Radiopaedia, o nome do autor e o número do caso (rID), por exemplo: "Caso cortesia de Dr. Fulano, Radiopaedia.org, rID: 12345".
2. **Licença:** no Radiopaedia, quase sempre CC BY-NC-SA 3.0. Ela permite uso educacional sem fins lucrativos, desde que o autor seja citado e a licença seja mantida.
3. **Link** do caso de origem.

O app mostra o crédito e a licença embaixo de cada imagem, inclusive em tela cheia. Imagem sem crédito não pode ser publicada.

## Onde procurar

- **Radiopaedia.org:** procure "adhesive small bowel obstruction", "small bowel obstruction closed loop" e "Gastrografin challenge". Os casos costumam ter a série completa de cortes.
- **Imagens de serviço próprio**, se houver: precisam ser totalmente anonimizadas e ter a autorização registrada.
