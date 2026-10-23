# Atende AI — Plataforma de Assistente de IA para Negócios

> **Andrade Studio AI** • Criação de Sites, Aplicativos Web/Mobile e Automações Inteligentes com IA.

Aplicação completa para criar, configurar e colocar para rodar um **Assistente de Inteligência Artificial oficial para empresas**, atendendo clientes tanto pelo **WhatsApp (via conexão nativa Baileys)** quanto pelo **Chat Flutuante na Web**.

---

## ⚡ Como Iniciar Tudo com 1 Comando

Com apenas um comando, o sistema inicializa:
1. **Banco de Dados PostgreSQL local** (zero configuração externa necessária)
2. **Processo Web (Next.js 14 App Router)** na porta `3000`
3. **Processo Worker (Node.js & Baileys WhatsApp)** com geração em tempo real do QR Code

```bash
npm run dev
```

Abra no navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Acesso Administrativo Inicial

- **E-mail:** `admin@atiende.local`
- **Senha:** `AdminPassword2026!`

*(As credenciais já vêm pré-preenchidas na tela de login para facilitar seus testes e gravações de vídeo).*

---

## 🏗️ Arquitetura do Sistema

- **Frontend & Backend API:** Next.js 14 (App Router) com TypeScript, Tailwind CSS e ícones Lucide.
- **Banco de Dados:** PostgreSQL com Prisma ORM. Em ambiente local, utiliza o PostgreSQL nativo sem necessidade de instalar Docker ou serviços manuais.
- **Motor de Inteligência Artificial:** Integração via OpenRouter API compatível com OpenAI, com suporte nativo a chamadas a ferramentas (**Tool Calling**). Modelo padrão: `anthropic/claude-haiku-5.5` com reintento e fallback automático.
- **Canal WhatsApp:** Baileys v6.7+ com autenticação multi-arquivo salva em disco (`.whatsapp_auth`) para manter a sessão persistente após reinícios do servidor.
- **Dois Processos Coordenados:**
  - `web`: Painel administrativo, rotas de API, OAuth e chat para web.
  - `worker`: Processo de longa duração que mantém o socket do WhatsApp ativo, responde mensagens dos clientes e executa tarefas agendadas (resumos diários e lembretes de reunião).
- **Segurança:** Criptografia simétrica **AES-256-GCM** para todos os tokens, senhas e chaves secretas das integrações armazenadas no banco de dados.

---

## 📱 Módulos e Telas Construídas

1. **Resumo (`/`):**
   - Switch mestre geral *«Assistente Ligado / em Pausa»*.
   - Estado em tempo real de cada canal (WhatsApp e Web Chat).
   - Métricas: conversas hoje e na semana, agendamentos criados, conversas aguardando operador humano e tempo médio de resposta.
   - Feed das últimas ações do assistente.

2. **Comportamento (`/comportamiento`):**
   - Nome do assistente e avatar.
   - Tom de voz (*Próximo*, *Profissional*, *Direto*).
   - Mensagem de boas-vindas.
   - Instruções livres e regras estritas do que **nunca deve fazer**.
   - Horários de atendimento e regras fora do expediente.
   - Gatilhos de transbordo humano (reclamação, urgência, solicitação direta).
   - Modal com botão *«Ver o prompt completo»* de somente leitura.

3. **Conhecimento (`/conocimiento`):**
   - Perfil do negócio (nome, atividade, endereço, telefone, website).
   - Catálogo de serviços com tabela interativa (preços em R$, duração e condição de triagem).
   - Perguntas Frequentes (FAQs).
   - Botão **«Importar de um site»**: crawler automático que baixa a página web e propõe serviços, horários e FAQs formatados via IA.

4. **Integrações (`/integraciones`):**
   - Catálogo das 6 integrações:
     - **Google Calendar:** consulta de horários livres e reserva de reuniões.
     - **Gmail:** envio de e-mails de confirmação e resumo diário.
     - **Google Sheets:** sincronização automática de leads na planilha.
     - **Slack:** notificações em tempo real no canal da equipe.
     - **Stripe:** geração de links de pagamento instantâneos (BRL).
     - **Webhooks Salientes:** envio de eventos assinados com HMAC-SHA256.
   - Checkboxes de permissões de ferramentas para o assistente.

5. **Canais (`/canales`):**
   - **WhatsApp:** exibição do QR Code em tempo real gerado pelo worker Baileys, número conectado e botão de desconexão.
   - **Chat para seu site:** personalização de cores, mensagens, prévia ao vivo e código de incorporação do script.
   - **Demonstração (`/demo`):** página de exemplo navegável com a bolha do chat integrada.

6. **Testar Assistente / Sandbox (`/probar`):**
   - Chat interativo para conversar com o assistente como um cliente.
   - **Linha do Tempo de Ferramentas:** visualização cinematográfica passo a passo de cada tool acionada com tempo em milissegundos e inspetor de JSON.
   - **Interruptor «Modo Seguro»:** quando ativo, ações de escrita são simuladas para gravação de vídeos sem alterar dados reais.
   - Botão para reiniciar a conversa.

7. **Conversas (`/conversaciones`):**
   - Bandeja em duas colunas com filtros (*Todas*, *Precisam de Atenção*, *WhatsApp*, *Web*).
   - Balões diferenciados para cliente, assistente e atendente humano.
   - Botão *«Assumir o Controle»* e *«Devolver ao Assistente»*.
   - Inspetor de ferramentas acionadas em cada mensagem.

8. **Atividade (`/actividad`):**
   - Auditoria completa de eventos com filtros por integração e resultado (sucesso / erro).

9. **Ajustes (`/ajustes`):**
   - Seletor de modelos da OpenRouter filtrados por suporte a ferramentas (`tools`).
   - Calculadora de estimativa de custos para 1.000 conversas por mês.
   - Marca da agência e personalização.

---

## 🐳 Docker para Produção

Caso queira executar um banco PostgreSQL dedicado em produção:

```bash
docker compose up -d
```

---

## 📄 Licença

Desenvolvido para **Andrade Studio AI**. Todos os direitos reservados.
