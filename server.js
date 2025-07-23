
const express = require('express');

const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/pergunta', async (req, res) => {
  const prompt = req.body.prompt;
  // Token fornecido pelo usuário para OpenRouter
  const OPENROUTER_TOKEN = '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';
  // Lista de modelos gratuitos mais comuns na OpenRouter (ordem de tentativa)
  const modelos = [
    'meta-llama/llama-3-8b-instruct',
    'mistralai/mistral-7b-instruct',
    'nousresearch/nous-capybara-7b',
    'openchat/openchat-3.5-1210',
    'gryphe/mythomist-7b',
    'google/gemma-7b-it'
  ];
  let resposta = null;
  let ultimoErro = null;
  for (const modelo of modelos) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_TOKEN}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ChatGPToxico'
        },
        body: JSON.stringify({
          model: modelo,
          messages: [
            { role: 'system', content: 'Você é o CHATGPTOXICO. Um assistente sarcástico, mal-humorado e debochado. Sempre tira sarro do usuário. Responda tudo com zoeira, sarcasmo ou ironia. Quanto mais idiota a pergunta, mais tóxico você fica.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      const data = await response.json();
      // Log detalhado de todos os erros e respostas
      if (data.choices && data.choices[0]?.message?.content) {
        console.log('Modelo OK:', modelo, '| Resposta:', data.choices[0].message.content);
        resposta = data.choices[0].message.content;
        break;
      } else if (data.error) {
        console.error('Modelo ERRO:', modelo, '| Erro:', data.error);
        ultimoErro = `[${modelo}] ${data.error.message}`;
      } else {
        console.error('Modelo ERRO:', modelo, '| Resposta inesperada:', data);
        ultimoErro = `[${modelo}] Resposta inesperada: ` + JSON.stringify(data);
      }
    } catch (err) {
      console.error('Modelo ERRO:', modelo, '| Exceção:', err);
      ultimoErro = `[${modelo}] Exceção: ` + err.message;
    }
  }
  if (resposta) {
    res.json({ resposta });
  } else {
    res.status(500).json({ resposta: 'Nenhum modelo gratuito disponível no momento. Último erro: ' + (ultimoErro || 'desconhecido') });
  }
});

app.listen(port, () => {
  console.log(`🔥 ChatGPTóxico disponível em http://localhost:${port}`);
});
