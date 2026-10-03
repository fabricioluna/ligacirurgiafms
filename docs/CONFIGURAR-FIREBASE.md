# Configurar o Firebase

O simulador não tem login. O Firebase só guarda as tentativas e as condutas não previstas. O navegador grava, mas nunca lê: quem lê é o painel do professor (Fase 3), pelo servidor, com um código de acesso.

O projeto `liga-de-cirurgia-fms` já foi criado e a configuração já está no seu `.env.local`. Faltam três coisas.

## 1. Criar o banco (Firestore)

1. Em console.firebase.google.com, abra o projeto **liga-de-cirurgia-fms**.
2. No menu da esquerda: **Criação** (Build) → **Firestore Database** → **Criar banco de dados**.
3. Edição: **Standard**, se o console perguntar.
4. Local: **southamerica-east1 (São Paulo)**. Essa escolha não pode ser mudada depois.
5. Modo: **produção** (production mode).
6. Clique em **Criar**.

**Não precisa ligar o Authentication.**

## 2. Colar as regras de segurança

1. Ainda no Firestore, abra a aba **Regras**.
2. Apague tudo o que estiver lá.
3. Copie todo o conteúdo do arquivo `firestore.rules`, que fica na pasta do projeto, e cole.
4. Clique em **Publicar**.

Sem este passo, o banco recusa todas as gravações: o app continua funcionando, mas não guarda nada.

## 3. Cadastrar as variáveis na Vercel

Em Settings → Environment Variables, crie estas quatro, marcando Production, Preview e Development:

Os valores são os mesmos das quatro linhas `VITE_FIREBASE_...` que estão no fim do seu `.env.local`. Copie de lá, linha por linha:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Esses valores **não são senha**: aparecem para qualquer pessoa que abrir o site. Quem protege os dados são as regras do passo 2. Eles ficam em variáveis de ambiente para não irem para o código no GitHub, que é público e dispara alertas automáticos de "chave exposta".

A Vercel só lê essas variáveis quando publica. Depois de cadastrá-las, é preciso publicar de novo: um push novo ou **Redeploy** no painel.

## 4. Conferir

Depois da publicação:

1. Jogue um caso no site. Escreva uma conduta absurda no simulador com IA, para gerar uma "não prevista".
2. No Firebase, abra **Firestore Database → Dados**. Devem aparecer as coleções `tentativas` e `respostas_nao_previstas`.

## Opcional: restringir a configuração ao seu site

No Google Cloud Console → APIs e serviços → Credenciais, abra a chave "Browser key" do projeto e, em "Restrições de aplicativo", escolha "Sites" e adicione `ligacirurgiafms.vercel.app/*` e `localhost:*/*`. Assim a configuração só funciona a partir do seu site.
