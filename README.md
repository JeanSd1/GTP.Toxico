# TÓXICO

Chat web de humor ácido em português, com sarcasmo controlado e limites contra assédio, ódio, ameaças e incentivo a danos. A geração usa o endpoint compatível com chat completions da Public AI.

## Executar

```bash
npm install
cp .env.example .env
# edite .env e defina PUBLICAI_API_KEY
npm start
```

Abra `http://localhost:3000`.

## Histórico na nuvem e contas

O cadastro e login por e-mail/senha usam Supabase Auth. As conversas ficam em PostgreSQL no Supabase e são protegidas por Row Level Security (RLS); o navegador só pode ler e alterar linhas pertencentes à conta autenticada. Senhas são verificadas pelo Supabase e não são armazenadas pelo aplicativo. O histórico antigo salvo neste navegador é importado para a conta no primeiro login bem-sucedido. Sem login, as conversas continuam apenas no dispositivo.

1. Crie um projeto no Supabase.
2. No **SQL Editor**, execute o conteúdo de [`supabase/migrations/001_conversations.sql`](./supabase/migrations/001_conversations.sql).
3. Em **Authentication → URL Configuration**, defina a URL pública do app como **Site URL** e adicione-a às **Redirect URLs** (por exemplo, `https://SEU-APP.onrender.com/**`). Para desenvolvimento local, inclua também `http://localhost:3000/**`. O cadastro redireciona o e-mail de confirmação para a origem em que o app foi aberto; essa origem precisa estar autorizada aqui.
4. No Render, adicione `SUPABASE_URL` e `SUPABASE_ANON_KEY` usando os valores do projeto Supabase. A chave anon/public é própria para o navegador; **nunca** use `service_role` no app, no Render ou no Git.
5. Faça o deploy e teste cadastro, confirmação do e-mail (se ativada no Supabase), login e histórico.

## Deploy no Render

Este projeto precisa de um **Web Service** (não de um Static Site), pois o servidor Express entrega a interface e a API. O `render.yaml` configura o serviço Node e usa `/api/health` para verificar se a aplicação está respondendo.

1. No Render, crie um **Blueprint** a partir deste repositório, ou crie um **Web Service** manualmente.
2. Na configuração manual, use `npm install` como **Build Command** e `npm start` como **Start Command**.
3. Cadastre `PUBLICAI_API_KEY` nas variáveis de ambiente. Para habilitar cadastro e histórico na nuvem, configure também `SUPABASE_URL` e `SUPABASE_ANON_KEY`, conforme a seção acima.
4. Faça o deploy e abra a URL principal do serviço. A rota `/api/health` deve responder com JSON.

Se o endereço mostrar `Not Found`, confirme que está usando a URL principal do **Web Service** no Render, não um encaminhamento de porta local do Codespaces. Um Static Site não executa este servidor nem disponibiliza as rotas `/api`.

## Variáveis

- `PUBLICAI_API_KEY`: obrigatório para gerar respostas.
- `PUBLICAI_MODEL`: modelo Public AI; por padrão usa `swiss-ai/apertus-8b-instruct`.
- O servidor encerra uma chamada que ultrapasse 60 segundos e mostra uma mensagem clara, evitando que a conversa fique presa.
- O editor inclui presets de sotaque/gírias carioca, nordestina, baiana, mineira, gaúcha e paulista.
- Se a Public AI devolver uma saudação genérica ou explicar a própria personalidade, o servidor faz uma reescrita automática uma vez.
- `PORT`: porta HTTP, padrão `3000`.
- `APP_URL`: URL usada no cabeçalho de referência.
- `SUPABASE_URL` e `SUPABASE_ANON_KEY`: configuração pública do projeto Supabase necessária para autenticação e sincronização do histórico.
