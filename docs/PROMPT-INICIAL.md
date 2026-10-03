# Prompt inicial para o Claude Code

Como usar: crie a pasta do projeto, coloque dentro dela os arquivos `CLAUDE.md`, `ESPECIFICACAO.md`, `PLANO.md`, `prompts-ia.md`, `casos/caso-schema.json` e `casos/caso-001.json`. Abra a pasta no VS Code, rode o Claude Code e cole o texto abaixo. Não cole tudo de uma vez junto com pedidos de fases seguintes: o fluxo funciona melhor uma fase por vez.

---

Você vai me ajudar a construir, do zero, um app web chamado **Simulador de Casos Clínicos**. É uma ferramenta de ensino para estudantes de medicina: o aluno recebe um caso clínico, conduz o atendimento escrevendo em texto livre, e recebe uma avaliação com feedback ao final.

Antes de escrever qualquer código, leia nesta ordem os arquivos `CLAUDE.md`, `ESPECIFICACAO.md`, `PLANO.md`, `prompts-ia.md` e os dois arquivos em `casos/`. O `caso-001.json` é um caso real já preenchido e serve de referência para toda a estrutura de dados.

Pontos que eu quero que você respeite sem exceção, porque são o núcleo do projeto:

1. **A inteligência artificial nunca cria informação clínica.** Ela só apresenta o que está escrito no arquivo do caso e só avalia com base na folha resposta do próprio caso. Se o aluno pedir algo que não existe no caso, o sistema responde com a resposta padrão definida no arquivo. Se a conduta do aluno não se encaixar em nada da folha resposta, a IA não inventa um julgamento: marca como não prevista e registra para revisão do professor.
2. **A chave da API do Gemini nunca pode ir para o frontend.** Toda chamada passa por uma função serverless na Vercel.
3. **Mobile em primeiro lugar.** O app precisa ser confortável no celular e funcionar bem no computador.
4. **O app precisa funcionar sem internet para a IA.** Existe um modo de contingência com respostas pré-escritas, porque ele vai ser demonstrado ao vivo em um auditório.

Comece pela Fase 1 do `PLANO.md` e só ela. Antes de começar a programar, me apresente em texto a estrutura de pastas e as decisões técnicas que você pretende tomar, e espere eu aprovar. Depois implemente em passos pequenos, me mostrando o que mudou a cada passo. Não avance para a fase seguinte sem eu pedir.

Uma observação importante: eu programo por vibe coding e não vou revisar cada linha. Então me avise sempre que uma decisão sua tiver risco de me dar dor de cabeça depois, e me explique as alternativas em linguagem simples antes de seguir.
