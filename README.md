# Atende AI Assistant Platform — Andrade Studio AI

Plataforma de alta performance para gestão e operação de assistentes de atendimento inteligente (WhatsApp, Web e canais corporativos), baseada no design system **Kinetic Silver & Crimson Dark**.

---

## ⚡ Como Iniciar

O servidor já está ativo e rodando! Para abrir no navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

Para iniciar manualmente no futuro:
- Execute `npm start` no terminal ou dê dois cliques no arquivo `iniciar.bat`.

---

## 🚀 Módulos e Funcionalidades

1. **Dashboard & Resumo:**
   - Telemetria em tempo real com barramento de conectores (WhatsApp API, Chat Web, Google Calendar, Gmail, Google Sheets, Instagram Direct).
   - Switch mestre de ativação/pausa da IA com efeito *Crimson Glow*.
   - Métricas de atendimentos, tempo médio de resposta e taxa de resolução.
   - Prévia dos últimos atendimentos realizados.

2. **Comportamento & Personalidade:**
   - Definição do nome do assistente (ex: **Lúcia**), papel e especialidade.
   - Seletor de tom de voz (*Empático*, *Profissional*, *Direto*).
   - Mensagem de boas-vindas com contagem dinâmica de caracteres.
   - Editor de diretrizes do sistema (System Prompt).
   - Regras estritas de atendimento com ativação/desativação individual.

3. **Base de Conhecimento (RAG & Cadastros):**
   - Dados institucionais da clínica ou empresa.
   - Tabela interativa de serviços e procedimentos (com adição, edição e exclusão de procedimentos, valores e regras de triagem).
   - Banco de Perguntas Frequentes (FAQs).

4. **Configurações & Provedores:**
   - Suporte a chaves de API externas (OpenRouter, Anthropic Claude, OpenAI GPT-4o, Google Gemini).
   - Seletor interativo de modelos de IA com exibição de custos e latência.
   - Ajuste de parâmetros de temperatura e tokens máximos.
   - Endpoint de Webhook para WhatsApp API.

5. **Sandbox de Atendimento (Simulador em Tempo Real):**
   - Converse diretamente com o assistente na interface web.
   - Botões com mensagens rápidas para testar preços, agendamento de consultas e regras de convênio.
   - Indicador dinâmico de digitação e motor local inteligente com suporte a chave de API externa.

6. **Histórico de Conversas:**
   - Visualização dos atendimentos gravados, dados do paciente e balões de diálogo.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** Node.js (Express ESM)
- **Frontend:** Single Page Application (SPA) responsiva com Tailwind CSS, Sora e Inter Google Fonts, e Material Symbols
- **Armazenamento:** `data/db.json` com persistência automática
- **Identidade:** Logotipo oficial Andrade Studio AI em alta definição
