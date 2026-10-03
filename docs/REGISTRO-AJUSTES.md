# Registro de falhas e ajustes

Cada falha encontrada nos testes do simulador e o ajuste feito, em ordem. É material para mostrar ao coordenador da liga e para um futuro relato de experiência.

O resultado da rodada mais recente do teste adversarial está em `docs/TESTE-ADVERSARIAL.md`.

| Data | Onde | Falha encontrada | Ajuste feito |
| --- | --- | --- | --- |
| 03/10/2026 | Tela de atendimento | Em navegadores atuais, a tela ficava em branco ao passar do primeiro para o segundo momento (efeito de rolagem que devolvia um valor). | Correção no código das telas; o caso inteiro foi jogado de ponta a ponta no navegador para confirmar. |
| 03/10/2026 | Caso 001 | O desfecho D4 (alta indevida) nunca era alcançado; dar alta no M2 ou no M3 levava a momentos que não faziam sentido. | Regras R1, R10 e R11 passam a terminar em D4. Pendente de validação clínica. |
| 03/10/2026 | Sinais vitais | No intraoperatório apareciam os sinais vitais do momento anterior (taquicardia e febre), contradizendo "paciente estável na anestesia". | Momento sem sinais vitais no caso não repete os anteriores. |
| 03/10/2026 | Avaliador (IA) | "Não vou repor potássio" não era reconhecido, porque as omissões ficavam escondidas da IA. | A IA passa a ver as omissões da folha resposta. |
| 03/10/2026 | Avaliador (IA) | "Passar sonda" sozinho virava conduta não prevista, porque o item da folha junta jejum, sonda, acesso e hidratação. | Item composto é reconhecido pela ação central. A nota não fica mais fácil: o ideal continua exigindo todos os itens. |
| 03/10/2026 | Relatório (IA) | A IA explicou o risco de não examinar os orifícios herniários com conhecimento próprio ("hérnia encarcerada"), que não está na folha. | Instrução proíbe explicar risco que não esteja nos dados. |
| 03/10/2026 | Relatório (IA) | A IA atribuiu a consequência de não pedir a tomografia ao erro de não examinar as hérnias. | Cada consequência vai junto do item que a provocou. Confirmado em 5 rodadas seguidas. |
| 03/10/2026 | Teste adversarial | 1 de 31 tentativas recebeu "IA indisponível": o Gemini demorou ou falhou por um instante. | O servidor tenta de novo automaticamente uma vez em erro temporário. |
| 03/10/2026 | Painel do professor | A caixa "Revisada" só marcava depois da resposta do servidor e parecia não funcionar. | Marca na hora e volta atrás se o servidor recusar. |
| 03/10/2026 | Painel do professor | No celular, o cartão do modo sem IA espremia o texto ao lado do botão. | Texto e botão empilhados no celular. |
| 03/10/2026 | Servidor | Sem credencial do Firebase, o servidor levava 17 segundos tentando carregar o Firebase Admin. | Sem credencial, o servidor nem tenta. |
| 03/10/2026 | Caso 001 | O M3 dizia que "a sonda drenou 1.400 mL" mesmo para quem tinha retirado a sonda; R9 pulava o pós-operatório; no choque, não indicar cirurgia não tinha regra. | Texto "se mantida", R9 segue para o M5 e regra R12 criada. Pendente de validação clínica. |
| 03/10/2026 | Cadastro de caso pela IA | Teste com o documento do caso 2: 59 segundos, estrutura completa, nenhum erro de validação e 50 de 50 textos clínicos copiados literalmente. O que não estava no texto (título, tema, objetivos) foi apontado como pendência, sem invenção. | Nenhum ajuste necessário. Limitação conhecida: caso montado pela IA não tem os ajustes do modo de lista, e o painel avisa isso. |
| 03/10/2026 | Abertura do caso | Os objetivos de aprendizagem e o tema completo ("obstrução de intestino delgado por bridas", "volvo de sigmoide") apareciam antes do caso e entregavam o diagnóstico e o raciocínio esperado. Encontrado no uso pelo desenvolvedor. | Antes do caso, só a área geral do tema. Objetivos e diagnóstico passam para o relatório final. Teste automático impede a volta. |
