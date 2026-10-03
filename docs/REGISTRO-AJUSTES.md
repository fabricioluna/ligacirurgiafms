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
