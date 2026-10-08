# TÓXICO

Chat web de humor ácido em português, com sarcasmo controlado e limites contra assédio, ódio, ameaças e incentivo a danos.

## Executar

```bash
npm install
cp .env.example .env
# edite .env e defina OPENROUTER_API_KEY
set -a; . ./.env; set +a
npm start
```

Abra `http://localhost:3000`.

A chave é lida apenas de `OPENROUTER_API_KEY`; não coloque tokens no código ou no Git. O token que estava exposto na versão anterior deve ser revogado/rotacionado no painel da OpenRouter.

## Variáveis

- `OPENROUTER_API_KEY`: obrigatório para gerar respostas.
- `OPENROUTER_MODEL`: modelo OpenRouter; por padrão usa uma variante gratuita.
- `PORT`: porta HTTP, padrão `3000`.
- `APP_URL`: URL usada no cabeçalho de referência.
