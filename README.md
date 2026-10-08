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

## Deploy no Render

O repositório inclui `render.yaml` e `Dockerfile`, portanto podes fazer deploy pelo Blueprint:

1. No Render, escolhe **New → Blueprint**.
2. Liga o repositório `JeanSd1/GTP.Toxico`.
3. Confirma o serviço web `toxico` usando o plano `free`.
4. Preenche `PUBLICAI_API_KEY` no campo protegido do Render — nunca coloques a chave no GitHub, no `render.yaml` ou no Dockerfile.
5. Mantém `PUBLICAI_MODEL` como `swiss-ai/apertus-8b-instruct` ou escolhe outro modelo disponível na Public AI.
6. O Render usará `/api/health` para verificar a saúde e fará deploy automático a cada commit na branch principal.

O servidor respeita a variável `PORT` fornecida pelo Render e escuta em `0.0.0.0`, como exigido por serviços web Docker.

A chave é lida apenas de `PUBLICAI_API_KEY`; não coloque tokens no código ou no Git. A Public AI pode aplicar rate limits mesmo quando oferece acesso gratuito; o servidor trata `429` sem expor detalhes da chave.

## Variáveis

- `PUBLICAI_API_KEY`: obrigatório para gerar respostas.
- `PUBLICAI_MODEL`: modelo Public AI; por padrão usa `swiss-ai/apertus-8b-instruct`.
- O servidor encerra uma chamada que ultrapasse 60 segundos e mostra uma mensagem clara, evitando que a conversa fique presa.
- O editor inclui presets de sotaque/gírias carioca, nordestina, baiana, mineira, gaúcha e paulista.
- Se a Public AI devolver uma saudação genérica ou explicar a própria personalidade, o servidor faz uma reescrita automática uma vez.
- `PORT`: porta HTTP, padrão `3000`.
- `APP_URL`: URL usada no cabeçalho de referência.
