# Simulador de Casos Clínicos

Ferramenta de ensino da Liga Acadêmica de Cirurgia da Faculdade de Medicina do Sertão. Veja `CLAUDE.md` para as regras do projeto e `ESPECIFICACAO.md` para o que o app faz.

## Rodar no computador

```
npm install
npm run dev
```

Abra o endereço que aparece no terminal.

Para o simulador com IA funcionar no computador, crie um arquivo `.env.local` na pasta do projeto, copiando o `.env.example`, e coloque a chave do Gemini em `GEMINI_API_KEY`. Esse arquivo nunca vai para o GitHub. Para testar as telas sem gastar chamadas, use `IA_SIMULADA=1` no lugar da chave. Para testar no celular na mesma rede Wi-Fi: `npm run dev -- --host` e abra no celular o endereço "Network".

## Antes de publicar

```
npm test          # confere o caso e percorre todos os caminhos
npm run test:regras  # testa as regras de segurança do Firebase no emulador (precisa de Java)
npm run build     # confere tipos e gera a versão de produção
```

## Publicar na Vercel

1. Suba o repositório para o GitHub.
2. Em vercel.com, "Add New Project", escolha o repositório. A Vercel detecta o Vite sozinha.
3. A cada `git push` na branch `main`, a Vercel publica de novo.

## Onde fica cada coisa

- `casos/`: os casos clínicos em JSON e o schema que define a estrutura.
- `src/motor/`: a lógica do caso, sem tela. Avaliação, regras de evolução e nota.
- `src/telas/` e `src/componentes/`: a interface.
- `testes/`: testes automáticos do caso e do motor.
- `servidor/` e `api/`: funções da Vercel. Só aqui existe a chave do Gemini.
- `firestore.rules`: regras de segurança do banco. `docs/CONFIGURAR-FIREBASE.md`: passo a passo do Firebase.
- `docs/IMAGENS-PENDENTES.md`: lista das imagens que faltam. `npm run imagens` mostra o que já está no lugar.
- `docs/casos/`: documento de cada caso, com folha resposta, imagens e decisões pendentes de validação. Gerados por `npm run documentos`; não edite à mão.
