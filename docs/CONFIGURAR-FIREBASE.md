# Configurar o Firebase

São uns 10 minutos, tudo pelo navegador, em console.firebase.google.com. Use a mesma conta Google da chave do Gemini, se puder.

## 1. Criar o projeto

1. Clique em **Criar um projeto** (ou "Adicionar projeto").
2. Nome: `ligacirurgiafms` (ou outro de sua preferência).
3. Quando perguntar sobre o **Google Analytics**, desative. Não precisamos dele.
4. Clique em **Criar projeto** e espere terminar.

## 2. Ligar o login anônimo

1. No menu da esquerda: **Criação** (Build) → **Authentication** → **Vamos começar**.
2. Aba **Método de login** (Sign-in method).
3. Clique em **Anônimo** → ative → **Salvar**.
4. Volte e clique em **E-mail/senha** → ative a primeira opção → **Salvar**. Este vai servir ao login do professor na Fase 3.

## 3. Criar o banco (Firestore)

1. No menu: **Criação** → **Firestore Database** → **Criar banco de dados**.
2. Edição: escolha a **Standard** (padrão), se o console perguntar.
3. Local: **southamerica-east1 (São Paulo)**. Essa escolha não pode ser mudada depois.
4. Modo: **produção** (production mode).
5. Clique em **Criar**.

## 4. Colar as regras de segurança

1. Ainda no Firestore, abra a aba **Regras**.
2. Apague tudo o que estiver lá.
3. Copie todo o conteúdo do arquivo `firestore.rules`, que fica na pasta do projeto, e cole.
4. Clique em **Publicar**.

Sem este passo, o banco recusa todas as gravações: o app continua funcionando, mas não guarda nada.

## 5. Registrar o app da web e copiar a configuração

1. Clique na engrenagem ao lado de "Visão geral do projeto" → **Configurações do projeto**.
2. Role até **Seus apps** e clique no ícone **</>** (Web).
3. Apelido: `simulador`. **Não** marque o Firebase Hosting (usamos a Vercel).
4. Clique em **Registrar app**. Vai aparecer um bloco `firebaseConfig` com vários valores. Você precisa de quatro:

| No Firebase | Nome da variável |
| --- | --- |
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

Esses valores **não são senha**: eles só dizem ao app qual é o projeto e aparecem para qualquer pessoa que abrir o site. Quem protege os dados são as regras do passo 4. Mesmo assim, ficam em variáveis de ambiente para não irem para o GitHub, onde costumam gerar alertas automáticos de "chave exposta".

## 6. Cadastrar as variáveis

**Na Vercel:** Settings → Environment Variables. Crie as quatro variáveis acima, marcando Production, Preview e Development.

**No computador:** acrescente as mesmas quatro linhas no seu `.env.local`, do mesmo jeito que a `GEMINI_API_KEY`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

## 7. Conferir

Depois do próximo deploy:

1. Jogue um caso no site. Escreva uma conduta absurda no simulador com IA para gerar uma "não prevista".
2. No Firebase, abra **Firestore Database → Dados**. Devem aparecer as coleções `tentativas` e `respostas_nao_previstas`.
3. Em **Authentication → Usuários** deve aparecer um usuário anônimo.

## Professor (Fase 3)

Quando chegarmos ao painel do professor, o acesso vai funcionar assim:

1. A pessoa cria a conta com e-mail e senha.
2. Você cria à mão, no Firestore, um documento em `professores/{uid}` com o identificador (uid) dela.

Ninguém consegue se cadastrar como professor sozinho: as regras proíbem.
