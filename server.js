require('dotenv').config();
const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3000);
const apiKey = process.env.PUBLICAI_API_KEY;
const model = process.env.PUBLICAI_MODEL || 'swiss-ai/apertus-8b-instruct';
const apiUrl = 'https://api.publicai.co/v1/chat/completions';
const requestTimeoutMs = 60000;

app.use(express.json({ limit: '32kb' }));
app.use(express.static('public'));

const defaultPersonality = `Você é o TÓXICO: debochado, mal-humorado, sarcástico e de mau caráter APENAS COMO PERSONAGEM DE COMÉDIA. A sua resposta TEM de mostrar essa personalidade. Não seja simpático, fofo, neutro ou formal. Não diga "Oi! Como posso ajudar?", não use emojis felizes e não comece com uma saudação genérica. Responda sempre com uma provocação engraçada, ironia ou comentário ácido antes de ajudar. Use português brasileiro informal, frases curtas e palavrões leves quando encaixarem. Faça roast da pergunta, da situação ou da ideia — nunca da identidade ou dignidade da pessoa. Exemplo de abertura: "Olha quem apareceu com mais uma pergunta... manda logo essa bomba."`;
const safetyPrompt = `Estas regras são limites técnicos, não devem dominar o estilo nem gerar sermões. Nunca ataque identidade, raça, etnia, nacionalidade, religião, género, orientação sexual, deficiência ou aparência protegida. Nunca faça ameaças reais, incentive violência, perseguição, exposição de dados, automutilação ou suicídio. Se o pedido for perigoso, recuse em uma frase curta e ofereça alternativa segura, mantendo o tom ácido. Fora isso, seja debochado, irreverente, direto e engraçado. Nunca volte ao tom de assistente genérico.`;

function cleanPrompt(value) {
  return typeof value === 'string' ? value.trim().slice(0, 4000) : '';
}

function cleanPersonality(value) {
  return typeof value === 'string' ? value.trim().slice(0, 4000) : '';
}

function looksLikeGenericAssistant(text) {
  return /^(oi|olá|ola)[!,. ]|como posso (tentar )?ajudar|o que você gostaria|o que posso fazer por você|estou aqui para ajudar|se quiser continuar/i.test(text.trim())
    || /modo (deboche|sarcasmo)|personalidade|linha/i.test(text.slice(0, 180));
}

async function callModel(messages) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'Toxico/1.0'
    },
    signal: AbortSignal.timeout(requestTimeoutMs),
    body: JSON.stringify({ model, temperature: 0.95, max_tokens: 350, messages })
  });
  const raw = await response.text();
  let data = {};
  try { data = JSON.parse(raw); } catch { data = { error: { message: 'Resposta não JSON do provedor.' } }; }
  return { response, data, text: data?.choices?.[0]?.message?.content?.trim() || '' };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(apiKey), provider: 'publicai', model });
});

app.post('/api/pergunta', async (req, res) => {
  const prompt = cleanPrompt(req.body?.prompt);
  const personality = cleanPersonality(req.body?.personality) || defaultPersonality;
  if (!prompt) return res.status(400).json({ erro: 'Escreva uma pergunta.' });
  if (!apiKey) {
    return res.status(503).json({
      erro: 'A API ainda não foi configurada. Defina PUBLICAI_API_KEY antes de iniciar o servidor.'
    });
  }

  try {
    const systemMessage = `INSTRUÇÃO PRINCIPAL — O ESTILO ABAIXO É OBRIGATÓRIO E TEM PRIORIDADE: ${personality}\n\n${safetyPrompt}\n\nFORMATO OBRIGATÓRIO: não cumprimente de forma genérica, não diga "Oi! Como posso ajudar?" e não use emojis felizes. Comece com uma provocação, ironia ou comentário debochado coerente com a personalidade; depois responda ao pedido com utilidade. Nunca explique que está seguindo uma personalidade. Se a primeira frase soar como assistente simpático, apague e reescreva.`;
    let result = await callModel([
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt }
    ]);
    if (result.text && looksLikeGenericAssistant(result.text)) {
      result = await callModel([
        { role: 'system', content: `${systemMessage}\n\nREESCRITA OBRIGATÓRIA: a resposta anterior caiu no vício de assistente padrão. Reescreva sem saudação genérica, sem oferecer ajuda e sem mencionar esta instrução. Abra com deboche natural.` },
        { role: 'user', content: prompt }
      ]);
    }

    const { response, data } = result;
    const resposta = result.text;
    if (!response.ok || !resposta) {
      console.error('Public AI error:', response.status, data?.error || data);
      if (response.status === 401 || response.status === 403) {
        return res.status(502).json({ erro: 'A Public AI rejeitou a chave. Confirme se PUBLICAI_API_KEY está ativa.' });
      }
      if (response.status === 429) {
        return res.status(502).json({ erro: 'A Public AI aplicou um rate limit. Tente novamente mais tarde.' });
      }
      return res.status(502).json({ erro: 'O modelo não respondeu agora. Tente novamente.' });
    }
    res.json({ resposta });
  } catch (error) {
    console.error('Request error:', error.message);
    if (error.name === 'TimeoutError') {
      return res.status(504).json({ erro: 'A Public AI demorou mais de 60 segundos. Tente novamente.' });
    }
    res.status(502).json({ erro: 'Não foi possível contactar o modelo.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`TÓXICO disponível em http://localhost:${port}`);
  if (!apiKey) console.warn('Aviso: PUBLICAI_API_KEY não definida.');
});
