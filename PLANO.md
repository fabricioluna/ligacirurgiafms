# Plano de desenvolvimento

Uma fase por vez. Cada fase termina com algo que funciona de verdade e pode ser testado no celular. A regra que mais importa: a Fase 3 só começa depois que o seminário passar, porque o que decide o sucesso do dia é um caso impecável, não a quantidade de recursos.

## Fase 1. O caso roda sem IA

Objetivo: o caso 1 inteiro, jogável, sem nenhuma chamada à inteligência artificial.

- Projeto React com Vite, Tailwind e os dois temas da identidade visual.
- Caso carregado do arquivo `casos/caso-001.json` que está no próprio projeto.
- Telas de início, abertura, atendimento, resultado de exame, avaliação do momento, desfecho e relatório.
- Em vez de texto livre, listas de opções: perguntas, exames e condutas vindas do caso.
- Avaliação por correspondência direta com a folha resposta, sem IA.
- Progresso em pontos de sutura, responsivo, testado no celular.
- Publicação na Vercel.

No fim desta fase você já tem um simulador apresentável. Se tudo der errado daqui para frente, é com ele que você faz a demonstração.

## Fase 2. Texto livre e inteligência artificial

Objetivo: o aluno escreve com as próprias palavras.

- Funções `/api/paciente`, `/api/avaliar` e `/api/feedback` na Vercel, com a chave protegida.
- Classificação da intenção do texto e resposta do paciente na voz dele.
- Avaliação da conduta contra a folha resposta, com classificação, item que a sustenta e explicação.
- Registro das condutas não previstas.
- Relatório final escrito com apoio da IA, sempre ancorado na folha resposta.
- Interruptor do modo de contingência, mantendo a Fase 1 viva por baixo.
- Voz do paciente pela leitura de texto do próprio navegador, opcional.

Esta é a fase que exige mais teste. Reserve tempo para o teste adversarial descrito abaixo.

## Fase 3. Cadastro de casos pelo professor

Objetivo: o professor cria casos sem depender de você. Depois do seminário.

- Login de professor e painel.
- Envio dos dois PDFs e das imagens, extração para o formato estruturado, validação, prévia e publicação.
- Lista de condutas não previstas para o professor transformar em novos itens da folha resposta.
- Casos no Firestore em vez de arquivo local.

## Fase 4. Depois

Casos 2 e 3 do roteiro, exportação do relatório em PDF, histórico do aluno, integração ao Luna MedClass.

## Teste adversarial antes do seminário

Antes de mostrar para qualquer pessoa, tente quebrar o simulador de propósito e corrija o que escapar:

- Pedir o diagnóstico ao paciente, ou perguntar o que ele acha que deve ser feito.
- Perguntar coisas que não existem no caso e verificar se a resposta padrão aparece em vez de informação inventada.
- Escrever a conduta certa com palavras muito diferentes, com abreviação e com erro de digitação.
- Escrever duas condutas opostas na mesma frase.
- Escrever um absurdo e conferir se cai em não prevista, sem nota e sem penalidade.
- Tentar fazer o paciente sair do personagem e seguir instruções do aluno.
- Desligar a internet no meio do caso.

Registre cada falha e o ajuste feito. Esse registro é um ótimo material para mostrar ao professor e para um futuro relato de experiência.

## Checklist do dia do seminário

- Testado no computador e no projetor do auditório.
- Modo de contingência testado com a internet desligada.
- Vídeo de tela gravado como plano B.
- QR code do endereço funcionando e impresso em tamanho grande.
- Caso 1 revisado por Dr. Rafael Lucena.
- Limite de gasto configurado na conta da API.
