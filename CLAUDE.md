# Simulador de Casos Clínicos

App web de ensino da Liga Acadêmica de Cirurgia da Faculdade de Medicina do Sertão. O aluno recebe um caso clínico, conduz o atendimento escrevendo em texto livre, e recebe avaliação e feedback ao final.

Desenvolvimento: Fabrício Luna. Coordenador da liga: Dr. Rafael Lucena. Ele é mencionado apenas como coordenador da liga, em qualquer lugar (app, casos, documentos): não atribuir a ele revisão, conteúdo clínico, papel de professor nem qualquer outra responsabilidade.

## Regras que não mudam

1. A IA nunca inventa informação clínica. Ela apresenta o que está no arquivo do caso e avalia apenas com base na folha resposta daquele caso. Pedido fora do caso recebe a resposta padrão definida no próprio caso.
2. Conduta do aluno que não se encaixa na folha resposta é marcada como `nao_prevista`, não pontua, não penaliza, e fica registrada para o professor revisar.
3. A chave da API do Gemini fica apenas na função serverless da Vercel. Nunca no frontend, nunca no repositório, nunca em `VITE_`.
4. Mobile em primeiro lugar. O app será usado principalmente no celular.
5. Modo de contingência obrigatório: o app precisa rodar um caso inteiro sem chamar a IA, com respostas pré-escritas, porque será demonstrado ao vivo em auditório.
6. Nada de diagnóstico ou conduta de paciente real. É ferramenta de ensino, e isso aparece em aviso no rodapé e na tela inicial.

## Stack

React + Vite + Tailwind, hospedagem na Vercel, funções serverless da Vercel em `/api`, Firebase (Auth, Firestore e Storage), Gemini pela API.

## Arquivos de referência

- `ESPECIFICACAO.md`: o que o app faz, telas, modelo de dados e arquitetura.
- `PLANO.md`: fases de desenvolvimento. Uma fase por vez.
- `IDENTIDADE-VISUAL.md`: cores, tipografia e componentes. Seguir à risca.
- `prompts-ia.md`: instruções dos três papéis de IA (paciente, avaliador, feedback).
- `casos/caso-schema.json`: estrutura de um caso.
- `casos/caso-001.json`: caso real completo, usado como referência e como semente.
- `assets/logoliga.jpg`: logo da liga.

## Decisões da Fase 1

- O motor do caso (`src/motor/`) é puro e testado (`npm test`). A IA da Fase 2 só preenche a classificação; quem muda o estado é sempre o motor.
- Modo de lista: a avaliação usa `folhaResposta.momentos[].modoLista` (itens derivados do que o aluno descobriu, omissões e rótulos neutros) e os gatilhos `disparadaPor`/`quando` das regras. Itens são referenciados pelo texto exato da folha; os testes acusam qualquer texto que não bata.
- Nota calculada só sobre os momentos jogados.
- Tentativa salva no aparelho (localStorage); mudar a `versao` do caso descarta tentativas antigas.
- Documentos dos casos (caso, folha resposta, imagens e decisões pendentes de validação) em `docs/casos/`, gerados por `npm run documentos` a partir de `casos/*.json`. As decisões pendentes ficam em `docs/casos/pendencias.json`.

## Decisões da Fase 2

- Dois simuladores: estático (listas, sem internet) e com IA. `?contingencia=1` deixa só o estático.
- A IA só aponta ids do caso (paciente) e itens da folha (avaliador). Texto mostrado e classificação vêm do caso e do motor.
- Sem login. Firebase é opcional e silencioso (`src/nuvem.ts`), carregado depois da página. O navegador só grava (tentativas com id UUID e não previstas), nunca lê. O painel do professor (Fase 3) lê pelo servidor com código de acesso. Regras em `firestore.rules`, testadas com `npm run test:regras`.
- Limite de chamadas à IA é aproximado (por instância). Proteção real de gasto: limite na conta do Google.

## Decisões da Fase 3

- Painel do professor em `/painel`, com código de acesso (`PAINEL_CODIGO`), sem login. O servidor emite uma senha temporária de 8 horas assinada com o código.
- O servidor lê o Firestore com a conta de serviço (`FIREBASE_SERVICE_ACCOUNT`); o navegador continua sem ler nada.
- Casos do projeto (`casos/*.json`) vêm com o site e funcionam offline. Casos do painel ficam em `casos/{id}` no Firestore e só aparecem publicados.
- Cadastro: texto dos dois PDFs extraído no navegador (pdf.js), a IA monta o caso copiando os documentos, o servidor valida (`src/motor/validacao.ts` + schema), o professor joga a prévia e publica.
- Interruptor "modo sem IA para todos" em `config/geral`: o servidor recusa chamadas de IA e a abertura do caso só oferece o estático.
- Imagens ficam em `public/imagens/casos/<id>/`; o painel mostra quais faltam.
- Paciente com IA: a fala é escrita pela IA no jeito do paciente (`caso.paciente`) e conferida por `servidor/verificarFala.ts` (grupos de termos clínicos, números e negação inventada). Fala barrada ganha uma segunda chance; se falhar de novo, vale o texto do caso. Pergunta fora do caso recebe o aviso "fora do roteiro".
- Condutas no simulador com IA são ordens imediatas, com efeito escrito no caso (`folhaResposta.momentos[].efeitos`) que muda a situação e os sinais vitais. O momento só é avaliado ao concluir. A hipótese diagnóstica é pedida antes de concluir o momento indicado.
- Nada antes do caso pode entregar a resposta: a abertura e a tela inicial mostram só a área geral do tema (antes dos dois-pontos, `temaParaAluno`); objetivos e diagnóstico só no relatório.

## Como trabalhar comigo

Eu desenvolvo por vibe coding e não reviso linha por linha. Então:

- Antes de uma mudança grande, explique o plano em linguagem simples e espere aprovação.
- Avise quando uma decisão tiver risco de dar problema depois, com as alternativas.
- Faça commits pequenos, com mensagem clara em português.
- Nunca suba chave, segredo ou arquivo `.env` para o repositório.
- Ao terminar um passo, diga o que testar na prática, não só o que mudou no código.
