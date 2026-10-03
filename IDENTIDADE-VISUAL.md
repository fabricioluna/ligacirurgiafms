# Identidade visual

A referência é a logo da liga, em `assets/logoliga.jpg`: fundo quase preto, verde oliva ácido, branco sujo, textura de stencil e pichação, bisturi empunhado e marcas de sutura nas laterais. O tema escuro é o principal, porque é o da logo. O claro existe para leitura prolongada e para projeção em sala clara.

Um cuidado que vale mais que a estética: o conteúdo é clínico e precisa ser lido rápido, inclusive no celular. A textura e o peso gráfico ficam na moldura (cabeçalho, capa do caso, tela de resultado). A área onde o aluno lê e escreve é limpa, de alto contraste, sem ruído de fundo.

## Cores

Tema escuro, que é o padrão:

| Papel | Hex |
| --- | --- |
| Fundo | `#0A0A0A` |
| Superfície (cartões, campos) | `#161616` |
| Borda e divisória | `#2B2B29` |
| Texto principal | `#F2F2EC` |
| Texto secundário | `#9E9E95` |
| Verde da liga (acento) | `#9DB017` |
| Verde claro (texto sobre fundo escuro, foco) | `#C3D82B` |

Tema claro:

| Papel | Hex |
| --- | --- |
| Fundo | `#F3F3EE` |
| Superfície | `#FFFFFF` |
| Borda e divisória | `#D8D8CF` |
| Texto principal | `#111110` |
| Texto secundário | `#5C5C55` |
| Verde da liga (acento) | `#6E7D0C` |
| Verde de realce suave (fundos) | `#E8EDC4` |

O verde oliva perde contraste sobre branco. No tema claro, use sempre a versão escurecida para texto e ícones, e deixe o verde original só em áreas preenchidas.

Classificação das condutas, nos dois temas:

| Classificação | Escuro | Claro |
| --- | --- | --- |
| Ideal | `#9DB017` | `#6E7D0C` |
| Aceitável | `#7FA08C` | `#4C7360` |
| Subótima | `#D2A32A` | `#996E05` |
| Perigosa | `#CF4436` | `#B02E20` |
| Não prevista | `#9E9E95` | `#5C5C55` |

Nunca comunique a classificação só pela cor. Cada uma vem com rótulo escrito e um ícone próprio, porque parte dos alunos tem dificuldade de distinguir cores e o app será visto em projetor de qualidade variável.

## Tipografia

Dois tipos, com papéis bem separados:

- **Big Shoulders Display**, pesos 600 e 700, para títulos, nome do caso e números grandes. É condensada e angulosa, próxima do lettering da logo, e aguenta caixa alta sem virar bloco ilegível.
- **IBM Plex Sans**, pesos 400, 500 e 600, para todo o resto: enunciado do caso, falas do paciente, resultados de exame, campos e feedback. É feita para leitura em tela e tem números bem distinguíveis, o que importa em sinais vitais e laboratório.

Caixa alta só no nome do caso e no logotipo. Em rótulos pequenos, caixa alta prejudica a leitura e vira ruído.

Escala: 13, 15, 17, 20, 26, 34 e 46 px. Corpo do caso em 17 px no celular, com altura de linha 1,6 e largura máxima de 68 caracteres.

## Elementos próprios da marca

A sutura é o fio visual do app, e substitui as barras de progresso genéricas.

- **Progresso do caso**: cada momento concluído vira um ponto de sutura (o traço com as duas travessas, como nas laterais da logo). O momento atual aparece como ponto aberto. É a mesma marca da logo, cumprindo uma função real.
- **Divisória entre blocos**: uma linha fina com um ponto de sutura no centro, usada com parcimônia.
- **Textura**: a trama de stencil da logo aparece só no cabeçalho, na capa do caso e na tela de resultado, com opacidade baixa (algo entre 6 e 10 por cento), sempre atrás de áreas sem texto corrido.
- **Cantos**: 4 px na maior parte dos elementos, 0 px nos blocos de resultado de exame, para lembrar impresso de laboratório. Nada de cantos muito arredondados, que destoam da logo.
- **Movimento**: só quando responde a uma ação do aluno, por exemplo o ponto de sutura que se fecha ao concluir um momento. Sem animação de entrada em cada seção. Respeitar `prefers-reduced-motion`.

## Regras práticas de interface

- A fala do paciente é tratada como citação, com recuo e um filete verde à esquerda, nunca como balão de aplicativo de conversa. Isso evita que o aluno trate o caso como bate-papo.
- Resultado de exame vem em bloco de largura fixa, com rótulo e valor alinhados, e valores alterados marcados com um sinal textual além da cor.
- Imagens de tomografia e radiografia abrem em tela cheia sobre fundo preto nos dois temas, com crédito e licença visíveis.
- O campo onde o aluno escreve a conduta é o elemento mais evidente da tela, com o verde da liga na borda ao receber foco.
- O seletor de tema fica no cabeçalho e a escolha é lembrada no aparelho.
- Alvos de toque de pelo menos 44 px e foco de teclado sempre visível.

## Créditos

No rodapé e na tela inicial: Dr. Rafael Lucena como coordenador da liga, desenvolvimento de Fabrício Luna, Liga Acadêmica de Cirurgia da Faculdade de Medicina do Sertão. Junto, o aviso de que é uma ferramenta educacional e não serve para decisão sobre paciente real.
