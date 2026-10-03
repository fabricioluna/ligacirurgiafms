# Revisão do caso 001: ajustes feitos para a Fase 1

Para: Dr. Rafael Lucena, professor e coordenador da liga
Arquivo: `casos/caso-001.json`, versão 1.0 → 1.1

Na Fase 1 o simulador funciona sem inteligência artificial. O aluno não escreve: ele pergunta, examina e pede exames clicando em listas, e define a conduta marcando itens numa lista. Para isso funcionar, precisei fazer alguns ajustes no arquivo do caso. **Nenhum texto clínico da folha resposta foi alterado.** Os ajustes estão abaixo, cada um com a pergunta que preciso que o senhor responda.

## 1. Como a conduta é avaliada

O aluno marca vários itens numa lista embaralhada. A lista mistura os itens ideais, aceitáveis, subótimos e os erros críticos da folha resposta de cada momento.

- Se marcou algum erro crítico, a conduta é **perigosa**.
- Se não, e marcou algo subótimo, é **subótima**.
- Se não, e cobriu todos os itens ideais, é **ideal**.
- Se não, ou seja, sem erro mas incompleta, é **aceitável**, e o feedback lista o que o caminho ideal também incluía.

**Pergunta:** a conduta sem erros mas incompleta deve mesmo valer "aceitável" (80% do peso)? A alternativa seria exigir um número mínimo de itens ideais.

## 2. Itens avaliados pelo que o aluno fez, não pelo que marcou

Alguns itens da folha são ações que o aluno já faz nas abas de pergunta, exame e pedido de exame. Esses itens não aparecem na lista de conduta: são avaliados pelo que o aluno descobriu.

| Momento | Item da folha | Conta como feito quando o aluno |
| --- | --- | --- |
| M1 | Anamnese dirigida | perguntou sobre vômitos, gases e fezes e cirurgias prévias |
| M1 | Exame físico completo | examinou todos os 8 segmentos |
| M1 | Exames laboratoriais | pediu hemograma, eletrólitos, ureia e creatinina, gasometria, lactato e amilase e lipase |
| M1 | Radiografias e tomografia | pediu as radiografias e a tomografia |
| M1 | Ir direto para a tomografia (aceitável) | pediu a tomografia e não pediu as radiografias |
| M1 | Não examinar os orifícios herniários (erro crítico) | não examinou os orifícios herniários |

**Pergunta:** "exame físico completo" exigindo todos os 8 segmentos está certo, ou bastam inspeção, orifícios herniários e toque retal?

## 3. Omissões

Itens escritos como omissão ("Não repor potássio") não fazem sentido como opção de lista. Eles passam a ser detectados quando o aluno não marca o item positivo correspondente:

- **M1:** "Não repor potássio" (não marcou a correção eletrolítica), "Não passar sonda" (não marcou jejum e sonda) e "Negar analgesia" (não marcou analgesia).
- **M2:** "Conservador sem prazo ou sem reavaliação" (marcou conservador sem marcar o prazo ou a reavaliação). "Conservador sem contraste" (aceitável) vale quando marcou conservador, reavaliação e prazo, mas não o contraste.
- **M3:** "Manter o conservador até 72 horas" (não indicou cirurgia por nenhuma via) e "Operar sem ressuscitação ou sem antibiótico" (indicou cirurgia sem marcar ressuscitação e antibiótico).
- **M3-ALT:** "Manter tratamento clínico sem indicar cirurgia" (não marcou cirurgia) e "Não iniciar antibiótico" (não marcou ressuscitação e antibiótico).
- **M4:** "Ressecar sem a pausa" (marcou ressecção sem a pausa), "Manter o segmento inviável" (não marcou ressecção, reoperação programada nem controle de danos) e "Não revisar o delgado" (não marcou a revisão).
- **M5:** "Não prescrever profilaxia" (não marcou profilaxia) e "Ignorar sinais de deiscência" (não marcou a vigilância).

## 4. Textos das opções que entregavam a resposta

Alguns itens, lidos na lista, já diziam se eram certos ou errados ("...e atrasar a tomografia", "...sem motivo"). Para esses, a lista mostra um texto neutro. O feedback continua mostrando o texto original da folha. **Por favor, confira se os textos neutros ainda descrevem a mesma conduta:**

| Momento | Texto da folha | Texto na lista |
| --- | --- | --- |
| M1 | Dar alta ou tratar como gastroenterite sem investigar a obstrução. | Tratar como gastroenterite e dar alta. |
| M1 | Solicitar contraste oral e atrasar a tomografia. | Solicitar tomografia com contraste oral. |
| M1 | Prescrever laxante ou procinético diante de obstrução mecânica. | Prescrever laxante ou procinético. |
| M1 | Controlar a diurese por balanço hídrico em vez de sonda vesical, se o paciente urina espontaneamente. | Controlar a diurese por balanço hídrico, sem sonda vesical. |
| M1 | Gasometria arterial em vez de venosa. | Solicitar gasometria arterial. |
| M2 | Indicar tratamento conservador, pela ausência de peritonite e de sinais tomográficos de sofrimento. | Indicar tratamento conservador. |
| M2 | Indicar cirurgia imediata sem sinais de sofrimento. | Indicar cirurgia imediata. |
| M3 | Reconhecer a falha do tratamento conservador e os sinais de sofrimento de alça: (lista de sinais). | Reconhecer a falha do tratamento conservador e os sinais de sofrimento de alça. |
| M3 | Repetir a tomografia ou aguardar novos exames, atrasando a cirurgia. | Repetir a tomografia e aguardar o resultado para decidir. |
| M3 | Manter o tratamento conservador até completar 72 horas apesar dos sinais de sofrimento. | Manter o tratamento conservador até completar 72 horas. |
| M3-ALT | Solicitar tomografia antes da cirurgia em paciente instável. | Solicitar tomografia antes da cirurgia. |
| M3-ALT | Manter tratamento clínico sem indicar cirurgia. | Manter tratamento clínico. |
| M4 | Deixar dreno de rotina. | Deixar dreno abdominal. |
| M4 | Optar por controle de danos em paciente estável. | Optar por cirurgia de controle de danos. |
| M4-ALT | Fazer anastomose primária em paciente em choque com acidose grave. | Ressecar e fazer anastomose primária. |
| M4-ALT | Prolongar a cirurgia para resolver tudo em um só tempo. | Fazer a cirurgia definitiva em um só tempo. |
| M5 | Manter jejum prolongado sem motivo. | Manter jejum prolongado. |

## 5. Regras de evolução

Cada regra agora diz qual item da folha a aciona. Quando mais de uma regra se aplica, vale a do item mais grave.

| Regra | Acionada por |
| --- | --- |
| R1 | M1: dar alta ou tratar como gastroenterite |
| R2 | M1: não ter pedido a tomografia |
| R3 | M2: cirurgia imediata |
| R4 | M2: conservador sem prazo ou sem reavaliação |
| R5 | M3: manter o conservador até 72 horas, ou repetir o contraste e aguardar |
| R6 | M3: repetir a tomografia, ou tomografia de controle antes da cirurgia |
| R7 | M4: manter o segmento inviável |
| R8 | M4: liberar todas as aderências |
| R9 | M4: controle de danos em paciente estável |

**Correções que fiz e que precisam da sua confirmação:**

- **O desfecho D4 nunca era alcançado.** A R1 (alta indevida) levava a M3-ALT → M4-ALT → D3. Agora a R1 marca o caso para terminar em D4 ("retorno em choque séptico após alta indevida"), mesmo que o aluno conduza bem o choque depois.
- **Criei R10:** no M2, "dar alta" leva a M3-ALT e termina em D4. Sem ela, o aluno que desse alta seguiria para a reavaliação de 24 horas com sonda, o que não faz sentido.
- **Criei R11:** no M3, "dar alta" leva a M3-ALT e termina em D4. Sem ela, o aluno seguiria direto para o intraoperatório. O texto que escrevi para ela é "O paciente retorna em choque." **Por favor, reescreva se quiser.**
- **O M2 se chamava "Após a tomografia"**, mas pela R2 o aluno pode chegar nele sem ter pedido a tomografia. Renomeei para **"Definição do plano"**.

## 6. Nota

A nota é calculada só sobre os momentos que o aluno jogou. Por exemplo, quem indica cirurgia imediata no M2 vai direto para o D2 e não joga M3, M4 e M5. A nota dele é sobre os 40 pontos de M1 e M2, e o relatório avisa isso. Momento ALT usa o peso do momento que substitui.

**Pergunta:** prefere que os momentos não jogados contem como zero?

## 7. Ações por momento

No intraoperatório (M4 e M4-ALT) e no pós-operatório (M5), só a conduta fica disponível. As respostas da anamnese são do momento da admissão e soariam estranhas depois da cirurgia. Nos momentos que não têm sinais vitais no caso (M4, M4-ALT e M5), a tela não mostra sinais vitais, em vez de repetir os do momento anterior.

## 8. Pontos que deixei como estavam

- **M2, "Retirar a sonda e liberar dieta" (erro crítico):** segue para o M3, cujo texto diz que "a sonda drenou 1.400 mL em 24 horas". Isso é aceitável, ou precisa de outro caminho?
- **M3-ALT, "Manter tratamento clínico sem indicar cirurgia":** segue para o intraoperatório do M4-ALT. Deveria haver um desfecho próprio?
- **R9 (controle de danos em paciente estável):** vai direto para o D1, "Recuperação plena", sem passar pelo M5. Está certo?
- **Imagens dos exames:** todas estão "A definir". O app mostra "Imagem pendente" com a legenda e o crédito.
- **Autor do caso:** está como "A definir".
- **Exame físico não listado:** o caso não define o que responder quando o aluno pede um segmento do exame físico que não existe (por exemplo, membros inferiores). Hoje o app responde "Esse segmento do exame físico não consta neste caso." Se quiser outro texto, ele entra em `respostaPadrao.exameFisicoNaoListado`.
