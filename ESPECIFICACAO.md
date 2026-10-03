# Especificação

## O que o app faz

O aluno escolhe um caso, conduz o atendimento escrevendo em texto livre e vê o paciente evoluir conforme as decisões que toma. Ao final, recebe uma avaliação com nota, comparação com o caminho ideal e referências para estudar.

O caso tem momentos. Em cada momento o aluno pode perguntar ao paciente, examinar, pedir exames e tomar condutas. A conduta é o que faz o caso avançar. Caminhos diferentes do ideal continuam válidos: o aluno chega a um desfecho, ainda que pior, e isso aparece no feedback.

## Papéis

**Aluno.** Entra sem cadastro (sessão anônima do Firebase) e pode informar o nome para aparecer no relatório. Resolve casos e vê o próprio histórico naquele aparelho.

**Professor.** Entra com e-mail e senha. Vê as tentativas, lê as condutas marcadas como não previstas e, a partir da Fase 3, cadastra casos novos.

## Telas

1. **Início.** Logo, nome do simulador, lista de casos disponíveis com tema e tempo estimado, aviso de ferramenta educacional e créditos.
2. **Abertura do caso.** Título, objetivos de aprendizagem, como funciona em três linhas, botão para começar.
3. **Atendimento.** É a tela principal, e tem: o progresso em pontos de sutura, o texto da situação atual, os sinais vitais, o histórico do que já foi perguntado ou pedido, e o campo de ação. O campo de ação aceita texto livre, com quatro atalhos acima dele: perguntar ao paciente, examinar, pedir exame e definir conduta.
4. **Resultado de exame.** Abre sobre a tela de atendimento, em bloco de laudo, com imagem quando houver.
5. **Avaliação do momento.** Após cada conduta: a classificação, a explicação em até três frases e o que acontece com o paciente. O aluno confirma para seguir.
6. **Desfecho.** O que aconteceu com o paciente.
7. **Relatório final.** Nota, nota por momento, caminho percorrido ao lado do caminho ideal, erros críticos em destaque, mensagens-chave e referências. Botão para refazer e para baixar em PDF.
8. **Painel do professor.** Lista de tentativas com nota e tempo, condutas não previstas agrupadas por caso e momento, e a partir da Fase 3 o cadastro de casos.

## Como o app decide o que fazer com o que o aluno escreveu

A cada envio, o app classifica a intenção em uma de cinco: pergunta ao paciente, exame físico, pedido de exame, conduta, ou fora de escopo. Pergunta, exame e pedido de exame apenas revelam informação e não avançam o caso. Conduta é avaliada e avança o caso.

Para perguntas e exames, a IA recebe apenas o conteúdo daquele caso e responde com o texto correspondente. Não havendo correspondência, usa a resposta padrão do caso.

Para condutas, a IA recebe o momento atual da folha resposta e devolve: a classificação, qual item sustenta a classificação, a explicação curta e qual regra de evolução se aplica. O app é quem muda o estado do caso, seguindo a regra. A IA não decide o próximo momento por conta própria.

## Modelo de dados no Firestore

```
casos/{casoId}
  publicado: boolean
  caso: { ...conforme caso-schema.json }
  folhaResposta: { ... }
  criadoPor, criadoEm, versao

tentativas/{tentativaId}
  casoId, alunoUid, nomeInformado
  iniciadaEm, finalizadaEm
  passos: [ { momento, textoDoAluno, intencao, classificacao, itemDaFolha, explicacao, regraAplicada, em } ]
  notaFinal, notaPorMomento, errosCriticos, desfecho

respostas_nao_previstas/{id}
  casoId, momento, textoDoAluno, em, revisada
```

As imagens dos casos ficam no Firebase Storage, com leitura pública e escrita restrita ao professor.

## Arquitetura

Frontend em React com Vite, hospedado na Vercel. O Firebase cuida de login, banco e arquivos. Nenhuma chamada à IA sai do navegador: tudo passa por funções serverless da Vercel.

- `/api/paciente`: responde pergunta de anamnese ou exame, com base no caso.
- `/api/avaliar`: classifica uma conduta contra a folha resposta do momento.
- `/api/feedback`: monta o relatório final.

A chave do Gemini fica em variável de ambiente na Vercel, sem o prefixo `VITE_`. As funções validam que o pedido se refere a um caso publicado, limitam o tamanho do texto recebido e aplicam um limite de chamadas por sessão.

Sobre o modelo: use um modelo Gemini rápido e barato da família Flash. Confirme na documentação oficial qual é o nome atual antes de fixar no código, e deixe o nome em variável de ambiente para poder trocar sem mexer no código.

## Modo de contingência

Um interruptor no painel do professor e um parâmetro na URL ativam o modo sem IA. Nele, o app usa correspondência por palavras-chave definidas no próprio caso, e condutas são escolhidas em uma lista pronta em vez de texto livre. O caso roda inteiro, o feedback sai com os textos fixos da folha resposta, e nada depende da internet além do carregamento inicial. É esse modo que garante a demonstração ao vivo.

## Segurança e privacidade

- Regras do Firestore: aluno só escreve na própria tentativa; só professor lê o conjunto de tentativas e escreve casos.
- Nenhum dado de paciente real entra no sistema. Os casos são fictícios ou totalmente anonimizados.
- O nome do aluno é opcional e serve apenas ao relatório.
- Imagens de exame precisam de crédito e licença registrados no próprio caso.

## O que fica de fora por enquanto

Ranking entre alunos, turmas, prazos, correção de prova valendo nota e aplicativo instalável. Nada disso é necessário para o seminário e cada item acrescenta risco.
