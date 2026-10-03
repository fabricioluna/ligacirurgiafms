<!-- Arquivo gerado por `npm run documentos` a partir de casos/*.json. Não edite à mão. -->

# CASO-001: Dor abdominal e vômitos em paciente com laparotomia prévia

|  |  |
| --- | --- |
| Tema | Abdome agudo obstrutivo: obstrução de intestino delgado por bridas |
| Público | Graduação e ligas acadêmicas |
| Tempo estimado | 15 a 20 minutos |
| Autor | A definir |
| Versão | 1.4 |
| Situação | Conteúdo clínico aguardando validação (ver "Decisões pendentes" no fim) |

## Resumo

Reconhecer a obstrução de delgado e a provável brida, iniciar suporte com jejum, sonda, hidratação e correção eletrolítica, e confirmar com tomografia contrastada a ausência de sofrimento de alça (M1). Indicar tratamento conservador com contraste hidrossolúvel, reavaliação seriada e prazo definido (M2). Reconhecer, na reavaliação, os sinais de sofrimento e a falha do contraste, e indicar a cirurgia de urgência sem esperar o fim do prazo (M3). Liberar a brida, fazer a pausa para avaliar a viabilidade, ressecar o segmento inviável com anastomose primária e revisar todo o delgado (M4). Conduzir o pós-operatório com realimentação progressiva, profilaxia e vigilância de complicações (M5), chegando ao desfecho D1.

**Objetivos de aprendizagem**

- Reconhecer e classificar a obstrução de intestino delgado e suspeitar de bridas pela história de laparotomia.
- Conduzir o suporte inicial e a investigação, com a tomografia com contraste venoso como exame que muda conduta.
- Aplicar o tratamento conservador com contraste hidrossolúvel, reavaliação seriada e prazo definido.
- Reconhecer os sinais de sofrimento de alça e indicar a cirurgia sem esperar o fim do prazo.
- Avaliar a viabilidade da alça com uma pausa antes de ressecar e decidir entre anastomose e controle de danos.
- Conduzir o pós-operatório e reconhecer complicações.

# Parte 1: o caso

Tudo o que o aluno pode descobrir. O simulador mostra estes textos exatamente como estão aqui; a IA nunca escreve informação clínica.

## Apresentação inicial

Pronto-socorro, 22 horas. O Sr. Antônio, 66 anos, aposentado, chega trazido pela filha com dor abdominal em cólica há cerca de 18 horas, acompanhada de vômitos e de barriga inchada. Ele conta que não elimina gases desde a manhã.

| Sinal vital | Valor |
| --- | --- |
| Pressão arterial | 128 x 78 mmHg |
| Frequência cardíaca | 98 bpm |
| Frequência respiratória | 18 irpm |
| Temperatura axilar | 36,8 °C |
| Saturação de oxigênio | 97% em ar ambiente |
| Dor (0 a 10) | 6 |

**Pergunta ao aluno:** Você é o médico de plantão. Como conduz o caso?

## O paciente

Antônio, 66 anos. Acompanhante: a filha. Aposentado, de poucas palavras. Fala devagar, cansado e com dor, e chama o médico de doutor. Fica apreensivo quando ouve falar em cirurgia.

No simulador com IA, o paciente fala nesse jeito, mas só com o que está escrito no caso. O servidor confere cada fala e descarta a que trouxer fato clínico novo.

## Anamnese

Respostas na voz do paciente.

| Id | Tema | Resposta do paciente |
| --- | --- | --- |
| AN-01 | Início e evolução da dor | Começou ontem à tarde, perto do umbigo. Vem e passa, e foi piorando. |
| AN-02 | Característica da dor | É uma cólica forte que aperta e depois alivia. Entre uma crise e outra fica um incômodo. |
| AN-03 | Vômitos | Vomitei umas seis vezes. No começo era comida, agora sai um líquido esverdeado. |
| AN-04 | Gases e fezes | Evacuei um pouco ontem de manhã. Gases, não solto desde hoje cedo. |
| AN-05 | Cirurgias prévias | Fui operado da barriga há uns 12 anos, por uma úlcera que furou. O corte foi grande, no meio da barriga. |
| AN-06 | Episódios semelhantes | Nunca tive isso antes. |
| AN-07 | Febre | Não senti febre. |
| AN-08 | Doenças | Tenho pressão alta. |
| AN-09 | Medicações | Tomo losartana todo dia. |
| AN-10 | Alergias | Não tenho alergia a remédio. |
| AN-11 | Hábito intestinal, peso e sangramento | Meu intestino sempre funcionou bem. Não emagreci e nunca vi sangue nas fezes. |
| AN-12 | Colonoscopia | Nunca fiz esse exame. |
| AN-13 | Hérnias | Nunca reparei caroço na virilha nem na barriga. |
| AN-14 | Tabagismo e álcool | Fumei até os 50 anos. Bebo pouco, só em festa. |
| AN-15 | Urina | Hoje urinei pouco, e meio escuro. |

## Exame físico

| Id | Segmento | Achado |
| --- | --- | --- |
| EF-01 | Estado geral | Regular, desidratado (2+/4+), mucosas secas, corado, anictérico, afebril. |
| EF-02 | Inspeção abdominal | Abdome distendido, cicatriz mediana xifopúbica, ondas peristálticas discretas visíveis. |
| EF-03 | Ausculta abdominal | Ruídos hidroaéreos aumentados, de timbre metálico. |
| EF-04 | Percussão | Timpanismo difuso. |
| EF-05 | Palpação | Dor difusa, maior no mesogástrio, sem defesa, sem descompressão dolorosa, sem massas palpáveis. |
| EF-06 | Orifícios herniários | Regiões inguinais, femorais, umbilical e cicatriz cirúrgica livres, sem abaulamentos. |
| EF-07 | Toque retal | Ampola retal vazia, sem fecaloma, sem massas, sem sangue em dedo de luva. |
| EF-08 | Cardiovascular e respiratório | Sem alterações. |

## Exames complementares

| Id | Exame | Resultado | Disponível | Imagem |
| --- | --- | --- | --- | --- |
| EX-01 | Hemograma | Hb 15,8 g/dL; Ht 47%; leucócitos 11.200/mm³ sem desvio; plaquetas 260.000/mm³. | sempre |  |
| EX-02 | Sódio, potássio e cloro | Na 136 mEq/L; K 3,2 mEq/L; Cl 94 mEq/L. | sempre |  |
| EX-03 | Ureia e creatinina | Ureia 58 mg/dL; creatinina 1,3 mg/dL. | sempre |  |
| EX-04 | Gasometria venosa | pH 7,47; HCO3 30 mEq/L; BE +5. | sempre |  |
| EX-05 | Lactato | 1,6 mmol/L. | sempre |  |
| EX-06 | Amilase e lipase | Dentro da normalidade. | sempre |  |
| EX-07 | Coagulograma | Dentro da normalidade. | sempre |  |
| EX-08 | Proteína C reativa | 12 mg/L. | sempre |  |
| EX-09 | Glicemia | 118 mg/dL. | sempre |  |
| EX-10 | Eletrocardiograma | Ritmo sinusal, sem alterações agudas. | sempre |  |
| EX-11 | Tipagem sanguínea | O positivo. Reserva disponível. | sempre |  |
| EX-12 | Radiografias de abdome (ortostase e decúbito) e de tórax | Alças de delgado distendidas, até 4 cm, com níveis hidroaéreos em degraus. Pouco gás no cólon. Sem pneumoperitônio. | sempre | IMG-001-A |
| EX-13 | Tomografia de abdome com contraste venoso | Alças de delgado distendidas até 4,2 cm, com ponto de transição no íleo distal, na pelve, sem lesão expansiva. Sinal das fezes no delgado proximal à transição. Alças distais colabadas. Realce parietal preservado, sem espessamento, sem pneumatose, sem líquido livre, mesentério sem edema, sem sinal do redemoinho. Conclusão: obstrução de delgado provavelmente por brida, sem sinais de sofrimento de alça. | sempre | IMG-001-B |
| EX-14 | Radiografia de controle após contraste hidrossolúvel | Disponível apenas após a administração do contraste hidrossolúvel. | a partir do M3 | IMG-001-C |

## Respostas padrão

O que o simulador responde quando o aluno pede algo que não existe no caso.

| Situação | Resposta |
| --- | --- |
| Pergunta que não está no caso | Não sei dizer, doutor. |
| Exame de laboratório que não está no caso | Resultado dentro da normalidade. |
| Exame de imagem que não está no caso | Exame não disponível neste serviço no momento. |
| Segmento do exame físico que não está no caso | Sem alterações nesse segmento. |
| Pedido de parecer de especialista | O especialista avaliará depois, mas a conduta inicial é sua. |

## Momentos

### M1: Admissão no pronto-socorro

Situação: a apresentação inicial.

**Pergunta:** Como conduz o caso?

**Ações disponíveis:** perguntar, examinar, pedir exame, conduta.

**Se a conduta for ideal ou aceitável, segue para:** M2 (Definição do plano)

### M2: Definição do plano

*Cerca de 1 hora após a admissão.*

A sonda nasogástrica, se passada, drenou 600 mL de conteúdo bilioso. A dor está em 4/10.

| Sinal vital | Valor |
| --- | --- |
| Pressão arterial | 130 x 80 mmHg |
| Frequência cardíaca | 92 bpm |
| Temperatura axilar | 36,9 °C |
| Dor (0 a 10) | 4 |

**Pergunta:** Qual o plano a partir de agora?

**Ações disponíveis:** perguntar, examinar, pedir exame, conduta.

**Se a conduta for ideal ou aceitável, segue para:** M3 (Reavaliação após 24 horas)

### M3: Reavaliação após 24 horas

*24 horas após o início do tratamento conservador.*

A dor se tornou contínua, em 8/10, mais intensa no hipogástrio. O abdome está mais distendido, com defesa localizada no hipogástrio e descompressão dolorosa duvidosa. A sonda nasogástrica, se mantida, drenou 1.400 mL em 24 horas e a diurese está em 0,4 mL/kg/h.

| Sinal vital | Valor |
| --- | --- |
| Pressão arterial | 110 x 70 mmHg |
| Frequência cardíaca | 114 bpm (alterado) |
| Temperatura axilar | 38,0 °C (alterado) |
| Dor (0 a 10) | 8 (alterado) |

- Resultado novo de EX-01: Leucócitos 16.800/mm³ com 8% de bastões; Hb 15,1 g/dL.
- Resultado novo de EX-05: 2,8 mmol/L.
- Resultado novo de EX-08: 96 mg/L.
- Resultado novo de EX-14: Contraste retido em alças de delgado, sem chegar ao cólon.
- Resultado novo de EX-13: Espessamento parietal de segmento ileal de cerca de 15 cm, com redução do realce, edema mesentérico e pequena quantidade de líquido livre entre as alças. Sem pneumoperitônio. Imagem IMG-001-D.
- Achado novo de EF-05: Dor contínua e intensa, com defesa localizada no hipogástrio e descompressão dolorosa duvidosa.

**Pergunta:** Qual a sua conduta?

**Ações disponíveis:** perguntar, examinar, pedir exame, conduta.

**Se a conduta for ideal ou aceitável, segue para:** M4 (Intraoperatório)

### M3-ALT: Paciente em choque

O paciente está com extremidades frias e abdome com peritonite difusa. Creatinina em 2,1 mg/dL.

| Sinal vital | Valor |
| --- | --- |
| Pressão arterial | 86 x 50 mmHg (alterado) |
| Frequência cardíaca | 128 bpm (alterado) |
| Temperatura axilar | 38,6 °C (alterado) |

- Resultado novo de EX-01: Leucócitos 21.000/mm³ com 14% de bastões.
- Resultado novo de EX-05: 4,8 mmol/L.
- Resultado novo de EX-03: Ureia 92 mg/dL; creatinina 2,1 mg/dL.

**Pergunta:** Qual a sua conduta?

**Ações disponíveis:** perguntar, examinar, pedir exame, conduta.

**Se a conduta for ideal ou aceitável, segue para:** M4-ALT (Intraoperatório em paciente instável)

### M4: Intraoperatório

Paciente estável na anestesia, sem vasopressor, com lactato em 2,4 mmol/L. Na exploração há uma brida única entre a cicatriz e o mesentério do íleo, cerca de 60 cm da válvula ileocecal, estrangulando um segmento de aproximadamente 15 cm. Alças proximais distendidas e distais colabadas. Pequena quantidade de líquido serossanguinolento, sem odor fecal, sem perfuração. Após a secção da brida, o segmento está violáceo.

**Pergunta:** Como conduz a cirurgia?

**Ações disponíveis:** conduta.

**Se a conduta for ideal ou aceitável, segue para:** M5 (Pós-operatório)

### M4-ALT: Intraoperatório em paciente instável

Paciente em uso de noradrenalina em dose crescente, temperatura de 35,4 °C, pH 7,18 e sangramento difuso em superfícies cruentas. Segmento ileal de cerca de 40 cm necrótico, com perfuração e conteúdo entérico livre na pelve.

**Pergunta:** Como conduz a cirurgia?

**Ações disponíveis:** conduta.

**Se a conduta for ideal ou aceitável, segue para:** D3 (desfecho ruim)

### M5: Pós-operatório

Primeiro dia: estável, sonda com 300 mL, dor controlada. Terceiro dia: eliminou flatos, abdome menos distendido, aceita líquidos.

**Pergunta:** Quais são a prescrição e os cuidados do pós-operatório?

**Ações disponíveis:** conduta.

**Se a conduta for ideal ou aceitável, segue para:** D1 (desfecho ótimo)

## Regras de evolução

O que acontece quando o aluno decide fora do esperado. Quando mais de uma regra se aplica, vale a do item mais grave.

| Regra | Momento | Se o aluno | Então | Vai para | Acionada por |
| --- | --- | --- | --- | --- | --- |
| R1 | M1 | Dá alta, trata como gastroenterite ou não investiga a obstrução. | O paciente retorna 24 horas depois, em estado grave. | M3-ALT (Paciente em choque); o caso termina em D4 | "Dar alta ou tratar como gastroenterite sem investigar a obstrução." |
| R2 | M1 | Não solicita tomografia e define o plano apenas com a radiografia. | O caso segue sem os dados da tomografia. | M2 (Definição do plano) | quando o aluno não descobriu EX-13 (Tomografia de abdome com contraste venoso) |
| R3 | M2 | Indica cirurgia imediata sem sinais de sofrimento. | Cirurgia encontra brida única e alça viável após a liberação. | D2 (desfecho bom) | "Indicar cirurgia imediata sem sinais de sofrimento." |
| R4 | M2 | Mantém o tratamento conservador sem prazo, sem reavaliação ou sem contraste. | O caso segue normalmente, com a decisão registrada. | M3 (Reavaliação após 24 horas) | "Manter o tratamento conservador sem prazo definido ou sem reavaliação programada." |
| R5 | M3 | Mantém o tratamento conservador apesar dos sinais de sofrimento. | Seis horas depois o paciente entra em choque. | M3-ALT (Paciente em choque) | "Manter o tratamento conservador até completar 72 horas apesar dos sinais de sofrimento." ou "Repetir o contraste e aguardar." |
| R6 | M3 | Solicita nova tomografia antes de operar. | Recebe o resultado atualizado e segue para a cirurgia, com atraso registrado. | M4 (Intraoperatório) | "Repetir a tomografia ou aguardar novos exames, atrasando a cirurgia." ou "Tomografia de controle antes da cirurgia, desde que não atrase a operação." |
| R7 | M4 | Mantém o segmento inviável sem ressecar. | No segundo dia de pós-operatório há peritonite por necrose da alça, com reoperação. | D3 (desfecho ruim) | "Manter o segmento inviável sem ressecar." |
| R8 | M4 | Libera todas as aderências da cavidade. | Ocorre enterotomia em alça proximal, reparada no ato. | M5 (Pós-operatório) | "Liberar todas as aderências da cavidade." |
| R9 | M4 | Opta por controle de danos em paciente estável. | Reoperação programada desnecessária e internação mais longa. O paciente segue para o pós-operatório. | M5 (Pós-operatório) | "Optar por controle de danos em paciente estável." |
| R10 | M2 | Dá alta. | O paciente retorna 24 horas depois, em estado grave. | M3-ALT (Paciente em choque); o caso termina em D4 | "Dar alta." |
| R11 | M3 | Dá alta. | O paciente retorna em choque. | M3-ALT (Paciente em choque); o caso termina em D4 | "Dar alta." |
| R12 | M3-ALT | Mantém tratamento clínico sem indicar cirurgia. | O choque piora e a cirurgia acontece com atraso. | M4-ALT (Intraoperatório em paciente instável) | "Manter tratamento clínico sem indicar cirurgia." |

## Desfechos

| Desfecho | Qualidade | Texto |
| --- | --- | --- |
| D1 | ótimo | Recuperação plena. Alta no sexto dia de pós-operatório, aceitando dieta, com orientações sobre o risco de nova obstrução. |
| D2 | bom | Boa evolução, mas com uma cirurgia que provavelmente seria evitada pelo tratamento conservador. Alta no quarto dia, com o risco de novas aderências criado pela própria cirurgia. |
| D3 | ruim | Necrose extensa e perfuração. Controle de danos, internação em UTI e reoperação programada. Sobrevive após internação prolongada. |
| D4 | grave | Retorno em choque séptico após alta indevida. Controle de danos, UTI e internação prolongada. Sobrevive, com complicações. |

# Parte 2: folha resposta

## Hipótese diagnóstica

Pedida no M1, antes da conduta. Vale 10% da nota final: correta 100%, incompleta 50%, incorreta 0%.

**Correta:** Obstrução de intestino delgado por bridas (aderências da laparotomia prévia), sem sinais de sofrimento de alça.

**Incompletas**

- Obstrução intestinal, sem definir o nível nem a causa.
- Obstrução de intestino delgado, sem definir a causa.

**Incorretas** (também aparecem como alternativas na lista do simulador estático)

- Gastroenterite aguda.
- Íleo paralítico por distúrbio eletrolítico.
- Obstrução do cólon por neoplasia.
- Hérnia inguinal encarcerada.
- Pancreatite aguda.

**Como chegar ao diagnóstico**

- Dor em cólica, vômitos, distensão e parada de eliminação de gases fecham a síndrome de obstrução intestinal.
- Vômitos que ficam biliosos cedo, distensão moderada e alças de delgado com níveis em degraus apontam para obstrução de delgado, e não do cólon.
- A laparotomia prévia torna as bridas a causa mais provável. Os orifícios herniários livres afastam hérnia, e a ausência de massa e de sangramento torna neoplasia menos provável.
- Sem febre, sem peritonite, com lactato normal e realce de parede preservado na tomografia, não há sinais de sofrimento de alça na admissão.

**Diagnósticos diferenciais**

| Diferencial | Como afastar |
| --- | --- |
| Hérnia encarcerada | Exame de todos os orifícios herniários e da cicatriz, que estão livres. |
| Obstrução do cólon | Pouco gás no cólon, alças de delgado distendidas e ponto de transição no íleo distal na tomografia; sem alteração prévia do hábito intestinal nem sangramento. |
| Gastroenterite aguda | Não há diarreia, e há parada de eliminação de gases, distensão e ruídos metálicos. |
| Íleo paralítico | Ruídos aumentados e metálicos e ponto de transição na tomografia indicam obstrução mecânica. |

O que se espera do aluno em cada momento. A classificação vem do item mais grave: um erro crítico pesa mais que vários acertos. Sem erro, quem cobre todos os itens ideais tem conduta ideal; quem cobre parte, aceitável.

## M1: Admissão no pronto-socorro

Peso: 20 pontos.

**Ideal**

- Anamnese dirigida, incluindo cirurgia abdominal prévia, eliminação de gases e fezes e características dos vômitos.
- Exame físico completo, com inspeção da cicatriz, avaliação de todos os orifícios herniários e toque retal.
- Jejum, sonda nasogástrica aberta para descompressão, acesso venoso e hidratação com cristaloide.
- Correção de distúrbios eletrolíticos, com reposição de potássio após confirmar diurese.
- Controle de diurese, analgesia e antiemético.
- Exames: hemograma, eletrólitos, função renal, gasometria, lactato e amilase ou lipase.
- Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.
- Avaliação precoce pela equipe de cirurgia.

**Aceitável**

- Ir direto para a tomografia sem radiografia prévia.
- Controlar a diurese por balanço hídrico em vez de sonda vesical, se o paciente urina espontaneamente.
- Gasometria arterial em vez de venosa.

**Subótimo**

| Conduta | Custo |
| --- | --- |
| Solicitar contraste oral e atrasar a tomografia. | Atraso diagnóstico e risco de vômito e aspiração. |
| Não repor potássio. | Íleo mais prolongado e risco de arritmia. |
| Não passar sonda nasogástrica apesar de vômitos e distensão. | Persistência dos vômitos e risco de aspiração. |
| Negar analgesia para não mascarar o quadro. | Sofrimento desnecessário, sem ganho diagnóstico. |

**Erro crítico**

- Dar alta ou tratar como gastroenterite sem investigar a obstrução.
- Não examinar os orifícios herniários.
- Prescrever laxante ou procinético diante de obstrução mecânica.
- Liberar dieta oral.

**Pontos de raciocínio**

- Dor em cólica, vômitos, distensão e parada de eliminação de gases sugerem obstrução intestinal.
- Vômitos biliosos e alças de delgado distendidas indicam obstrução de delgado, e a laparotomia prévia torna as bridas a causa mais provável.
- Vômitos e sequestro de líquido explicam a desidratação, a hipocalemia, a alcalose metabólica e a elevação de ureia e creatinina.
- No momento não há sinais de sofrimento de alça, e isso precisa ser reavaliado de forma seriada.

**Justificativa**

- A tomografia com contraste venoso confirma a obstrução, localiza o ponto de transição, sugere a causa e mostra sinais de isquemia (Bologna 2017).
- A descompressão com sonda e a correção hidroeletrolítica fazem parte do tratamento inicial de toda obstrução de delgado (Bologna 2017; Sabiston).

**O que acontece na hora quando o aluno faz a conduta**

| Conduta | Efeito no paciente | Sinais vitais |
| --- | --- | --- |
| Jejum, sonda nasogástrica aberta para descompressão, acesso venoso e hidratação com cristaloide. | A sonda nasogástrica drena cerca de 300 mL de líquido esverdeado, e o paciente diz que o enjoo melhorou. A hidratação venosa está correndo. | Frequência cardíaca: 94 bpm |
| Correção de distúrbios eletrolíticos, com reposição de potássio após confirmar diurese. | A reposição de potássio foi iniciada depois de confirmada a diurese. |  |
| Controle de diurese, analgesia e antiemético. | Depois da analgesia e do antiemético, a dor cai para 3/10 e o paciente fica mais tranquilo. | Dor (0 a 10): 3 |
| Avaliação precoce pela equipe de cirurgia. | A equipe de cirurgia foi chamada e vem avaliar o paciente. |  |
| Prescrever laxante ou procinético diante de obstrução mecânica. | Depois do laxante, as cólicas ficam mais fortes e ele vomita de novo. | Dor (0 a 10): 8 |
| Liberar dieta oral. | Ele toma alguns goles de água e vomita logo em seguida. |  |

**Avaliado pelo que o aluno fez, e não por marcação na lista**

- "Anamnese dirigida, incluindo cirurgia abdominal prévia, eliminação de gases e fezes e características dos vômitos.": conta quando o aluno descobriu AN-03 (Vômitos), AN-04 (Gases e fezes), AN-05 (Cirurgias prévias).
- "Exame físico completo, com inspeção da cicatriz, avaliação de todos os orifícios herniários e toque retal.": conta quando o aluno descobriu EF-01 (Estado geral), EF-02 (Inspeção abdominal), EF-03 (Ausculta abdominal), EF-04 (Percussão), EF-05 (Palpação), EF-06 (Orifícios herniários), EF-07 (Toque retal), EF-08 (Cardiovascular e respiratório).
- "Exames: hemograma, eletrólitos, função renal, gasometria, lactato e amilase ou lipase.": conta quando o aluno descobriu EX-01 (Hemograma), EX-02 (Sódio, potássio e cloro), EX-03 (Ureia e creatinina), EX-04 (Gasometria venosa), EX-05 (Lactato), EX-06 (Amilase e lipase).
- "Radiografias de abdome e tórax e tomografia de abdome com contraste venoso.": conta quando o aluno descobriu EX-12 (Radiografias de abdome (ortostase e decúbito) e de tórax), EX-13 (Tomografia de abdome com contraste venoso).
- "Ir direto para a tomografia sem radiografia prévia.": conta quando o aluno descobriu EX-13 (Tomografia de abdome com contraste venoso); o aluno não descobriu EX-12 (Radiografias de abdome (ortostase e decúbito) e de tórax).
- "Não repor potássio.": conta quando não marcou "Correção de distúrbios eletrolíticos, com reposição de potássio após confirmar diurese.".
- "Não passar sonda nasogástrica apesar de vômitos e distensão.": conta quando não marcou "Jejum, sonda nasogástrica aberta para descompressão, acesso venoso e hidratação com cristaloide.".
- "Negar analgesia para não mascarar o quadro.": conta quando não marcou "Controle de diurese, analgesia e antiemético.".
- "Não examinar os orifícios herniários.": conta quando o aluno não descobriu EF-06 (Orifícios herniários).

**Textos mostrados na lista** (para não entregar a resposta)

| Texto da folha | Texto na lista |
| --- | --- |
| Dar alta ou tratar como gastroenterite sem investigar a obstrução. | Tratar como gastroenterite e dar alta. |
| Solicitar contraste oral e atrasar a tomografia. | Solicitar tomografia com contraste oral. |
| Prescrever laxante ou procinético diante de obstrução mecânica. | Prescrever laxante ou procinético. |
| Controlar a diurese por balanço hídrico em vez de sonda vesical, se o paciente urina espontaneamente. | Controlar a diurese por balanço hídrico, sem sonda vesical. |
| Gasometria arterial em vez de venosa. | Solicitar gasometria arterial. |

## M2: Definição do plano

Peso: 20 pontos.

**Ideal**

- Indicar tratamento conservador, pela ausência de peritonite e de sinais tomográficos de sofrimento.
- Manter jejum, sonda, hidratação e correção eletrolítica.
- Administrar contraste hidrossolúvel pela sonda e fazer radiografia de controle em até 24 horas.
- Reavaliar clinicamente de forma seriada, com exame abdominal e sinais vitais.
- Definir o prazo máximo do tratamento conservador, de 72 horas, e os critérios para indicar cirurgia a qualquer momento.

**Aceitável**

- Tratamento conservador com reavaliação seriada e prazo definido, sem contraste hidrossolúvel.

**Subótimo**

| Conduta | Custo |
| --- | --- |
| Indicar cirurgia imediata sem sinais de sofrimento. | Cirurgia provavelmente evitável e formação de novas aderências. |
| Manter o tratamento conservador sem prazo definido ou sem reavaliação programada. | Risco de atrasar o reconhecimento do sofrimento de alça. |

**Erro crítico**

- Retirar a sonda e liberar dieta.
- Dar alta.

**Pontos de raciocínio**

- A tomografia não mostra sinais de sofrimento, e a causa provável é uma brida.
- Sem sinais de alarme, a obstrução por aderências tem tratamento conservador inicial.
- O contraste hidrossolúvel tem papel diagnóstico e terapêutico: se chega ao cólon em até 24 horas, a resolução sem cirurgia é provável.
- O aluno deve dizer o que o faria mudar de ideia: piora da dor, febre, taquicardia, peritonite, leucocitose ou acidose.

**Justificativa**

- Bologna 2017: tratamento não operatório na ausência de estrangulamento e peritonite; contraste hidrossolúvel com papel diagnóstico e terapêutico; tratamento conservador por até 72 horas.

**O que acontece na hora quando o aluno faz a conduta**

| Conduta | Efeito no paciente | Sinais vitais |
| --- | --- | --- |
| Manter jejum, sonda, hidratação e correção eletrolítica. | A sonda segue aberta, drenando conteúdo bilioso, e a hidratação continua. |  |
| Administrar contraste hidrossolúvel pela sonda e fazer radiografia de controle em até 24 horas. | O contraste hidrossolúvel foi dado pela sonda, que ficou fechada por algumas horas. A radiografia de controle está programada. |  |
| Reavaliar clinicamente de forma seriada, com exame abdominal e sinais vitais. | A reavaliação clínica seriada foi programada, com exame do abdome e sinais vitais. |  |
| Definir o prazo máximo do tratamento conservador, de 72 horas, e os critérios para indicar cirurgia a qualquer momento. | O plano ficou registrado: tratamento conservador por até 72 horas, com os critérios para indicar cirurgia a qualquer momento. |  |
| Retirar a sonda e liberar dieta. | Sem a sonda, a náusea volta e ele vomita depois de beber água. |  |

**Avaliado pelo que o aluno fez, e não por marcação na lista**

- "Tratamento conservador com reavaliação seriada e prazo definido, sem contraste hidrossolúvel.": conta quando marcou "Indicar tratamento conservador, pela ausência de peritonite e de sinais tomográficos de sofrimento." e "Reavaliar clinicamente de forma seriada, com exame abdominal e sinais vitais." e "Definir o prazo máximo do tratamento conservador, de 72 horas, e os critérios para indicar cirurgia a qualquer momento."; não marcou "Administrar contraste hidrossolúvel pela sonda e fazer radiografia de controle em até 24 horas.".
- "Manter o tratamento conservador sem prazo definido ou sem reavaliação programada.": conta quando marcou "Indicar tratamento conservador, pela ausência de peritonite e de sinais tomográficos de sofrimento."; não marcou "Reavaliar clinicamente de forma seriada, com exame abdominal e sinais vitais.".
- "Manter o tratamento conservador sem prazo definido ou sem reavaliação programada.": conta quando marcou "Indicar tratamento conservador, pela ausência de peritonite e de sinais tomográficos de sofrimento."; não marcou "Definir o prazo máximo do tratamento conservador, de 72 horas, e os critérios para indicar cirurgia a qualquer momento.".

**Textos mostrados na lista** (para não entregar a resposta)

| Texto da folha | Texto na lista |
| --- | --- |
| Indicar tratamento conservador, pela ausência de peritonite e de sinais tomográficos de sofrimento. | Indicar tratamento conservador. |
| Indicar cirurgia imediata sem sinais de sofrimento. | Indicar cirurgia imediata. |

## M3: Reavaliação após 24 horas

Peso: 25 pontos.

**Ideal**

- Reconhecer a falha do tratamento conservador e os sinais de sofrimento de alça: dor contínua, febre, taquicardia, defesa, leucocitose com desvio, lactato em elevação e contraste que não chegou ao cólon.
- Indicar cirurgia de urgência, sem esperar completar 72 horas.
- Ressuscitação volêmica, antibiótico, reserva de sangue e consentimento que inclua ressecção e possível estoma.
- Lembrar da indução em sequência rápida com a sonda aberta.
- Escolher a via: laparotomia, pela distensão e suspeita de isquemia, ou laparoscopia com equipe experiente e limiar baixo para conversão.

**Aceitável**

- Tomografia de controle antes da cirurgia, desde que não atrase a operação.
- Laparoscopia diagnóstica com conversão precoce se a visão ou a segurança forem prejudicadas.

**Subótimo**

| Conduta | Custo |
| --- | --- |
| Repetir a tomografia ou aguardar novos exames, atrasando a cirurgia. | Progressão da isquemia. |
| Operar sem ressuscitação ou sem antibiótico. | Maior risco anestésico e infeccioso. |

**Erro crítico**

- Manter o tratamento conservador até completar 72 horas apesar dos sinais de sofrimento.
- Repetir o contraste e aguardar.
- Dar alta.

**Pontos de raciocínio**

- O prazo de 72 horas é um limite máximo, não uma espera obrigatória. Qualquer sinal de sofrimento leva à cirurgia.
- Nenhum sinal isolado confirma o estrangulamento, mas a combinação de achados clínicos, laboratoriais e da radiografia é suficiente para indicar a cirurgia.

**Justificativa**

- Bologna 2017: sinais de estrangulamento, peritonite ou falha do tratamento conservador indicam cirurgia. O contraste que não chega ao cólon em até 24 horas prediz falha do tratamento conservador.

**O que acontece na hora quando o aluno faz a conduta**

| Conduta | Efeito no paciente | Sinais vitais |
| --- | --- | --- |
| Indicar cirurgia de urgência, sem esperar completar 72 horas. | O centro cirúrgico foi avisado e a sala está sendo preparada. |  |
| Ressuscitação volêmica, antibiótico, reserva de sangue e consentimento que inclua ressecção e possível estoma. | A ressuscitação volêmica e o antibiótico foram iniciados, a reserva de sangue foi feita e o paciente assinou o consentimento. | Frequência cardíaca: 106 bpm |
| Lembrar da indução em sequência rápida com a sonda aberta. | A anestesia foi avisada: indução em sequência rápida, com a sonda aberta. |  |
| Repetir o contraste e aguardar. | Uma nova dose de contraste foi dada. A dor continua forte e contínua. |  |

**Avaliado pelo que o aluno fez, e não por marcação na lista**

- "Manter o tratamento conservador até completar 72 horas apesar dos sinais de sofrimento.": conta quando não marcou "Indicar cirurgia de urgência, sem esperar completar 72 horas." nem "Escolher a via: laparotomia, pela distensão e suspeita de isquemia, ou laparoscopia com equipe experiente e limiar baixo para conversão." nem "Laparoscopia diagnóstica com conversão precoce se a visão ou a segurança forem prejudicadas." (também aparece como opção).
- "Operar sem ressuscitação ou sem antibiótico.": conta quando marcou "Indicar cirurgia de urgência, sem esperar completar 72 horas."; não marcou "Ressuscitação volêmica, antibiótico, reserva de sangue e consentimento que inclua ressecção e possível estoma.".

**Textos mostrados na lista** (para não entregar a resposta)

| Texto da folha | Texto na lista |
| --- | --- |
| Reconhecer a falha do tratamento conservador e os sinais de sofrimento de alça: dor contínua, febre, taquicardia, defesa, leucocitose com desvio, lactato em elevação e contraste que não chegou ao cólon. | Reconhecer a falha do tratamento conservador e os sinais de sofrimento de alça. |
| Repetir a tomografia ou aguardar novos exames, atrasando a cirurgia. | Repetir a tomografia e aguardar o resultado para decidir. |
| Manter o tratamento conservador até completar 72 horas apesar dos sinais de sofrimento. | Manter o tratamento conservador até completar 72 horas. |

## M3-ALT: Paciente em choque

Peso: 25 pontos (usa o peso do M3).

**Ideal**

- Ressuscitação volêmica imediata, antibiótico de amplo espectro e monitorização.
- Cirurgia de urgência, sem atrasar com novos exames.
- Antecipar a possibilidade de controle de danos e a necessidade de UTI.

**Aceitável**

- Iniciar vasopressor se a hipotensão persistir após a reposição volêmica inicial.

**Subótimo**

| Conduta | Custo |
| --- | --- |
| Solicitar tomografia antes da cirurgia em paciente instável. | Atraso com risco de morte. |

**Erro crítico**

- Manter tratamento clínico sem indicar cirurgia.
- Não iniciar antibiótico.

**Pontos de raciocínio**

- Peritonite difusa, choque e lactato elevado indicam necrose e provável perfuração, com sepse de foco abdominal.

**Justificativa**

- Princípios de manejo da sepse de foco abdominal e da cirurgia de controle de danos em emergência não traumática.

**O que acontece na hora quando o aluno faz a conduta**

| Conduta | Efeito no paciente | Sinais vitais |
| --- | --- | --- |
| Ressuscitação volêmica imediata, antibiótico de amplo espectro e monitorização. | Depois do volume e do antibiótico, a pressão sobe para 98 x 60 mmHg, ainda com taquicardia. | Pressão arterial: 98 x 60 mmHg; Frequência cardíaca: 118 bpm |
| Iniciar vasopressor se a hipotensão persistir após a reposição volêmica inicial. | A noradrenalina foi iniciada em dose baixa. |  |

**Avaliado pelo que o aluno fez, e não por marcação na lista**

- "Manter tratamento clínico sem indicar cirurgia.": conta quando não marcou "Cirurgia de urgência, sem atrasar com novos exames." (também aparece como opção).
- "Não iniciar antibiótico.": conta quando não marcou "Ressuscitação volêmica imediata, antibiótico de amplo espectro e monitorização.".

**Textos mostrados na lista** (para não entregar a resposta)

| Texto da folha | Texto na lista |
| --- | --- |
| Solicitar tomografia antes da cirurgia em paciente instável. | Solicitar tomografia antes da cirurgia. |
| Manter tratamento clínico sem indicar cirurgia. | Manter tratamento clínico. |

## M4: Intraoperatório

Peso: 25 pontos.

**Ideal**

- Identificar a brida e liberar somente as aderências que causam a obstrução.
- Avaliar a viabilidade: cor, brilho, peristaltismo, pulso mesentérico e sangramento de borda.
- Fazer a pausa antes do passo irreversível: aquecer a alça com compressas mornas e reavaliar após 10 a 15 minutos.
- Ressecar o segmento inviável com margens viáveis e fazer anastomose primária, já que o paciente está estável e sem contaminação extensa.
- Revisar todo o delgado, do ângulo de Treitz à válvula ileocecal.
- Aspirar o líquido local, sem lavagem com grandes volumes, e fechar sem dreno de rotina.

**Aceitável**

- Anastomose manual ou mecânica.
- Reoperação programada para nova avaliação, se a viabilidade ficar duvidosa.

**Subótimo**

| Conduta | Custo |
| --- | --- |
| Ressecar sem a pausa e sem reavaliar. | Ressecção possivelmente maior que a necessária. |
| Liberar todas as aderências da cavidade. | Risco de enterotomia e tempo cirúrgico maior. |
| Deixar dreno de rotina. | Sem benefício comprovado e com desconforto. |
| Optar por controle de danos em paciente estável. | Reoperação e internação desnecessárias. |

**Erro crítico**

- Manter o segmento inviável sem ressecar.
- Não revisar o restante do delgado.

**Pontos de raciocínio**

- Assim como na colecistectomia se para antes de clipar, na obstrução se para antes de ressecar, porque é o passo irreversível.
- Anastomose primária é segura no paciente estável. No paciente instável, a escolha é o controle de danos.

**Justificativa**

- Bologna 2017: liberar apenas as aderências que causam a obstrução. Critérios clínicos de viabilidade intestinal conforme o Sabiston.

**O que acontece na hora quando o aluno faz a conduta**

| Conduta | Efeito no paciente | Sinais vitais |
| --- | --- | --- |
| Identificar a brida e liberar somente as aderências que causam a obstrução. | A brida foi seccionada; as alças proximais começam a se descomprimir. |  |
| Fazer a pausa antes do passo irreversível: aquecer a alça com compressas mornas e reavaliar após 10 a 15 minutos. | Depois de 15 minutos com compressas mornas, o segmento continua violáceo, sem brilho, sem peristaltismo e sem pulso no mesentério. |  |
| Ressecar o segmento inviável com margens viáveis e fazer anastomose primária, já que o paciente está estável e sem contaminação extensa. | O segmento inviável foi ressecado com margens de aspecto viável, e a anastomose ficou sem tensão. |  |
| Revisar todo o delgado, do ângulo de Treitz à válvula ileocecal. | A revisão do delgado, do ângulo de Treitz à válvula ileocecal, não mostra outras lesões. |  |

**Avaliado pelo que o aluno fez, e não por marcação na lista**

- "Ressecar sem a pausa e sem reavaliar.": conta quando marcou "Ressecar o segmento inviável com margens viáveis e fazer anastomose primária, já que o paciente está estável e sem contaminação extensa."; não marcou "Fazer a pausa antes do passo irreversível: aquecer a alça com compressas mornas e reavaliar após 10 a 15 minutos.".
- "Manter o segmento inviável sem ressecar.": conta quando não marcou "Ressecar o segmento inviável com margens viáveis e fazer anastomose primária, já que o paciente está estável e sem contaminação extensa." nem "Anastomose manual ou mecânica." nem "Reoperação programada para nova avaliação, se a viabilidade ficar duvidosa." nem "Optar por controle de danos em paciente estável.".
- "Não revisar o restante do delgado.": conta quando não marcou "Revisar todo o delgado, do ângulo de Treitz à válvula ileocecal.".

**Textos mostrados na lista** (para não entregar a resposta)

| Texto da folha | Texto na lista |
| --- | --- |
| Deixar dreno de rotina. | Deixar dreno abdominal. |
| Optar por controle de danos em paciente estável. | Optar por cirurgia de controle de danos. |

## M4-ALT: Intraoperatório em paciente instável

Peso: 25 pontos (usa o peso do M4).

**Ideal**

- Reconhecer a tríade letal: hipotermia, acidose e coagulopatia.
- Cirurgia abreviada: ressecar o segmento necrótico, controlar a contaminação, deixar as alças em descontinuidade e fazer fechamento temporário do abdome.
- Levar o paciente à UTI para estabilização e programar a reoperação em 24 a 48 horas.

**Aceitável**

- Exteriorizar as extremidades em estoma, conforme a experiência da equipe.

**Subótimo**

| Conduta | Custo |
| --- | --- |
| Prolongar a cirurgia para resolver tudo em um só tempo. | Piora da acidose, da hipotermia e da coagulopatia. |

**Erro crítico**

- Fazer anastomose primária em paciente em choque com acidose grave.

**Pontos de raciocínio**

- No paciente instável, o objetivo da cirurgia passa a ser a sobrevivência, e não a reconstrução definitiva.

**Justificativa**

- Princípios do controle de danos em cirurgia de emergência não traumática.

**Textos mostrados na lista** (para não entregar a resposta)

| Texto da folha | Texto na lista |
| --- | --- |
| Fazer anastomose primária em paciente em choque com acidose grave. | Ressecar e fazer anastomose primária. |
| Prolongar a cirurgia para resolver tudo em um só tempo. | Fazer a cirurgia definitiva em um só tempo. |

## M5: Pós-operatório

Peso: 10 pontos.

**Ideal**

- Manter a sonda até a melhora do débito e dos sinais de trânsito, e então realimentar de forma progressiva.
- Analgesia multimodal, poupando opioides.
- Profilaxia de tromboembolismo e deambulação precoce.
- Controle hidroeletrolítico.
- Vigiar sinais de fístula e deiscência: febre, taquicardia, dor desproporcional ou saída de conteúdo entérico.
- Orientar o paciente sobre o risco de novos episódios de obstrução.

**Aceitável**

- Retirar a sonda mais cedo se o paciente não tiver náuseas nem distensão.

**Subótimo**

| Conduta | Custo |
| --- | --- |
| Manter jejum prolongado sem motivo. | Catabolismo e recuperação mais lenta. |
| Não prescrever profilaxia de tromboembolismo. | Risco de trombose venosa e embolia pulmonar. |

**Erro crítico**

- Ignorar sinais de deiscência de anastomose.

**Pontos de raciocínio**

- O pós-operatório após ressecção intestinal exige vigilância ativa da anastomose nos primeiros dias.

**Justificativa**

- Princípios de cuidados pós-operatórios em cirurgia abdominal de urgência (Sabiston).

**Avaliado pelo que o aluno fez, e não por marcação na lista**

- "Não prescrever profilaxia de tromboembolismo.": conta quando não marcou "Profilaxia de tromboembolismo e deambulação precoce.".
- "Ignorar sinais de deiscência de anastomose.": conta quando não marcou "Vigiar sinais de fístula e deiscência: febre, taquicardia, dor desproporcional ou saída de conteúdo entérico.".

**Textos mostrados na lista** (para não entregar a resposta)

| Texto da folha | Texto na lista |
| --- | --- |
| Manter jejum prolongado sem motivo. | Manter jejum prolongado. |

## Pontuação

| Momento | Peso |
| --- | --- |
| M1 | 20 |
| M2 | 20 |
| M3 | 25 |
| M4 | 25 |
| M5 | 10 |

Escala por classificação: ideal 100%, aceitável 80%, subótima 50%, perigosa 0%; não prevista não pontua nem penaliza. A nota considera só os momentos jogados.

| Nota | Faixa |
| --- | --- |
| 85 a 100 | Excelente |
| 70 a 84 | Adequado |
| 50 a 69 | Precisa revisar o tema |
| 0 a 49 | Refazer o caso após estudo |

## Mensagens-chave

- Obstrução de delgado em paciente com laparotomia prévia sugere bridas, mas é a tomografia que afasta o sofrimento de alça.
- Tratamento conservador tem prazo e reavaliação, e não significa espera passiva.
- Sinais de sofrimento indicam cirurgia a qualquer momento, antes do fim do prazo.
- Antes de ressecar, pare, aqueça e reavalie.
- Paciente estável recebe anastomose. Paciente instável recebe controle de danos.

## Referências

- ten Broek RPG et al. Bologna guidelines for diagnosis and management of adhesive small bowel obstruction (ASBO): 2017 update. World J Emerg Surg. 2018.
- Sabiston Textbook of Surgery, edição mais recente, capítulo de intestino delgado.

# Imagens necessárias

Pasta: `public/imagens/casos/caso-001/`. Cada imagem precisa de fonte e licença registradas no caso.

| Situação | Código | Arquivo | Exame | Quando aparece | O que a imagem precisa mostrar | Fonte e licença |
| --- | --- | --- | --- | --- | --- | --- |
| **Falta** | IMG-001-A | img-001-a.jpg | EX-12 Radiografias de abdome (ortostase e decúbito) e de tórax | Quando o aluno pede o exame, em qualquer momento | Alças de delgado distendidas, até 4 cm, com níveis hidroaéreos em degraus. Pouco gás no cólon. Sem pneumoperitônio. | A definir no Radiopaedia; CC BY-NC-SA, citar autor e rID |
| **Falta** | IMG-001-B | img-001-b/01.jpg, 02.jpg, ... (série; informar a quantidade) | EX-13 Tomografia de abdome com contraste venoso | Quando o aluno pede o exame, em qualquer momento | Alças de delgado distendidas até 4,2 cm, com ponto de transição no íleo distal, na pelve, sem lesão expansiva. Sinal das fezes no delgado proximal à transição. Alças distais colabadas. Realce parietal preservado, sem espessamento, sem pneumatose, sem líquido livre, mesentério sem edema, sem sinal do redemoinho. Conclusão: obstrução de delgado provavelmente por brida, sem sinais de sofrimento de alça. | A definir no Radiopaedia; CC BY-NC-SA, citar autor e rID |
| **Falta** | IMG-001-C | img-001-c.jpg | EX-14 Radiografia de controle após contraste hidrossolúvel | Quando o aluno pede o exame, a partir do M3 | Contraste retido em alças de delgado, sem chegar ao cólon. | A definir; A definir |
| **Falta** | IMG-001-D | img-001-d.jpg | EX-13 Tomografia de abdome com contraste venoso (atualizado) | Quando o aluno repete o exame no M3 (Reavaliação após 24 horas) | Espessamento parietal de segmento ileal de cerca de 15 cm, com redução do realce, edema mesentérico e pequena quantidade de líquido livre entre as alças. Sem pneumoperitônio. | A definir; A definir |

# Decisões pendentes de validação

- Conduta sem erro, mas incompleta, vale 'aceitável' (80% do peso do momento). Confirmar, ou definir um mínimo de itens ideais.
- O item 'Exame físico completo' só conta quando o aluno examina os 8 segmentos. Confirmar, ou reduzir para inspeção, orifícios herniários e toque retal.
- Momentos não jogados (quando o caso termina cedo) ficam fora da nota. Confirmar, ou contá-los como zero.
- Dar alta no M1, no M2 ou no M3 termina no desfecho D4. As regras R10 e R11 foram criadas para o M2 e o M3; o texto da R11 ('O paciente retorna em choque.') foi escrito pelo desenvolvimento.
- R9 (controle de danos em paciente estável) agora segue para o pós-operatório (M5) em vez de terminar direto em D1.
- R12 foi criada: no choque (M3-ALT), não indicar cirurgia leva ao intraoperatório com atraso, sem desfecho próprio. Avaliar se precisa de um desfecho pior.
- M2 foi renomeado de 'Após a tomografia' para 'Definição do plano', porque o aluno pode chegar nele sem ter pedido a tomografia.
- O texto do M3 passou a dizer 'a sonda, se mantida, drenou...', porque o aluno pode ter retirado a sonda no M2.
- 17 opções da lista do simulador estático usam um texto neutro diferente do texto da folha (tabela 'Textos mostrados na lista'). Conferir se descrevem a mesma conduta.
- Resposta padrão para segmento do exame físico que não existe no caso: 'Sem alterações nesse segmento.' Confirmar.
- Hipótese diagnóstica, diferenciais e o jeito do paciente foram escritos pelo desenvolvimento. Conferir a hipótese correta, as incompletas, as incorretas, o raciocínio e os diferenciais. O peso do diagnóstico é 10% da nota.
- Os efeitos imediatos das condutas (o que acontece com o paciente na hora, inclusive mudança de sinais vitais) foram escritos pelo desenvolvimento. Conferir cada um na tabela 'O que acontece na hora'.
- Autor do caso: 'A definir'.
