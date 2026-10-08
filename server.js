const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3000);
const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

app.use(express.json({ limit: '32kb' }));
app.use(express.static('public'));

const systemPrompt = `Você é o TÓXICO, um assistente de humor ácido, irreverente e sem papas na língua em português do Brasil.
Faça zoeira pesada no tom, com sarcasmo, ironia, exagero, respostas atrevidas e palavrões leves quando combinarem com o contexto. O objetivo é fazer rir e deixar a conversa mais leve: ataque a ideia, a situação ou a pergunta — nunca a dignidade da pessoa.
Nunca ataque identidade, raça, etnia, nacionalidade, religião, género, orientação sexual, deficiência ou aparência protegida.
Nunca faça ameaças reais, incentive violência, humilhação extrema, perseguição, exposição de dados, automutilação ou suicídio.
Não use palavrões como ataque a grupos e não transforme vulnerabilidades pessoais em piada.
Se o usuário pedir algo perigoso ou abusivo, recuse de forma breve e ofereça uma alternativa segura, mantendo um toque de humor.
Se o usuário disser que não quer zoeira, responda normalmente e com respeito.
Não seja moralista nem repita avisos de segurança sem necessidade. Mantenha respostas diretas, criativas, curtas e muito engraçadas.`;

function cleanPrompt(value) {
  return typeof value === 'string' ? value.trim().slice(0, 4000) : '';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(apiKey), model });
});

app.post('/api/pergunta', async (req, res) => {
  const prompt = cleanPrompt(req.body?.prompt);
  if (!prompt) return res.status(400).json({ erro: 'Escreva uma pergunta.' });
  if (!apiKey) {
    return res.status(503).json({
      erro: 'A API ainda não foi configurada. Defina OPENROUTER_API_KEY antes de iniciar o servidor.'
    });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || `http://localhost:${port}`,
        'X-Title': 'Toxico'
      },
      body: JSON.stringify({
        model,
        temperature: 0.85,
        max_tokens: 350,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    const resposta = data?.choices?.[0]?.message?.content?.trim();
    if (!response.ok || !resposta) {
      console.error('OpenRouter error:', response.status, data?.error || data);
      if (response.status === 401) {
        return res.status(502).json({ erro: 'A OpenRouter rejeitou a chave (401). Gere uma chave válida na sua conta.' });
      }
      if (response.status === 429) {
        return res.status(502).json({ erro: 'O limite da OpenRouter foi atingido. Tente novamente mais tarde.' });
      }
      return res.status(502).json({ erro: 'O modelo não respondeu agora. Tente novamente.' });
    }
    res.json({ resposta });
  } catch (error) {
    console.error('Request error:', error.message);
    res.status(502).json({ erro: 'Não foi possível contactar o modelo.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`TÓXICO disponível em http://localhost:${port}`);
  if (!apiKey) console.warn('Aviso: OPENROUTER_API_KEY não definida.');
});
