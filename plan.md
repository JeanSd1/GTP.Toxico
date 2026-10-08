# Plano — TÓXICO permanente

## Implementação

- Servir a interface existente por Node/Express na porta `PORT`, com fallback para `3000`.
- Manter `PUBLICAI_API_KEY` exclusivamente como segredo de runtime do WebDev.
- Usar `PUBLICAI_MODEL` como variável configurável e expor apenas estado não sensível no health check.
- Empacotar o servidor num container Node 22 com `npm ci --omit=dev`.
- Publicar `/api/*` para o servidor e a página raiz como conteúdo estático servido pelo próprio Express.
- Usar `/api/health` como health check não autenticado.

## Estrutura

- `server.js`: API Express, integração Public AI, regras de segurança e personalidade configurável.
- `public/index.html`: interface responsiva, histórico local, temas, composer e editor de personalidade.
- `public/manus-routes.json`: declaração da rota pública.
- `Dockerfile`: imagem e arranque de produção.
- `.env.example`: referência de nomes, sem credenciais.

## Design

- **Movimento:** minimalismo editorial de aplicações de chat modernas, com contraste dramático.
- **Princípios:** foco na conversa, hierarquia silenciosa, humor visual através do rosa ácido e interação rápida.
- **Cores:** carvão e cinza para reduzir distração; rosa-coral como assinatura irreverente e ponto de ação.
- **Layout:** coluna de navegação persistente no desktop e drawer no telemóvel; fluxo vertical de mensagens.
- **Assinaturas:** marca “T” em bloco arredondado, avatar coral e microcopy de humor seco.
- **Interação:** Enter envia, Shift+Enter cria linha, nova conversa e histórico são imediatos.
- **Animação:** transições curtas de drawer, hover e foco; sem movimento contínuo que distraia.
- **Tipografia:** sistema nativo sem dependência externa, com títulos compactos e texto confortável.
- **Essência:** humor ácido acessível para tornar conversas mais leves — irreverente, rápido e direto.
- **Voz:** “Em que posso zoar hoje?” e “A personalidade, infelizmente, é intencional.”
- **Marca:** wordmark TÓXICO com o “T” coral como sinal reconhecível.
