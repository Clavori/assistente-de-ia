// Atende AI Platform - Client Logic
let appData = null;
let currentTab = 'resumo';
let sandboxHistory = [];

// Available AI Models
const AVAILABLE_MODELS = [
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Anthropic Claude 3.5 Sonnet",
    badge: "Recomendado Andrade Studio",
    speed: "Latência Baixa",
    inputPrice: "US$ 3.00/M",
    outputPrice: "US$ 15.00/M",
    context: "200k"
  },
  {
    id: "anthropic/claude-haiku-5.5",
    name: "Anthropic Claude Haiku",
    badge: "Ultra Rápido",
    speed: "Instantâneo",
    inputPrice: "US$ 0.25/M",
    outputPrice: "US$ 1.25/M",
    context: "200k"
  },
  {
    id: "openai/gpt-4o-mini",
    name: "OpenAI GPT-4o Mini",
    badge: "Econômico",
    speed: "Muito Rápido",
    inputPrice: "US$ 0.15/M",
    outputPrice: "US$ 0.60/M",
    context: "128k"
  },
  {
    id: "google/gemini-1.5-flash",
    name: "Google Gemini 1.5 Flash",
    badge: "Multimodal",
    speed: "Tempo Real",
    inputPrice: "US$ 0.075/M",
    outputPrice: "US$ 0.30/M",
    context: "1M"
  }
];

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  toastText.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// Fetch all data from API
async function loadData() {
  try {
    const res = await fetch('/api/data');
    appData = await res.json();
    renderAll();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

// Switch SPA Tabs
window.switchTab = function(tabName) {
  currentTab = tabName;
  window.location.hash = tabName;

  // Update nav buttons active styles
  document.querySelectorAll('#sidebar-nav .nav-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabName;
    if (isTarget) {
      btn.className = "nav-btn flex items-center justify-between px-3 py-2.5 rounded transition-all bg-[#1e1e1e] text-white font-semibold border-l-2 border-primary-container shadow-[inset_1px_0_0_rgba(225,6,0,0.6)]";
    } else {
      btn.className = "nav-btn flex items-center justify-between px-3 py-2.5 rounded text-zinc-400 hover:bg-[#181818] hover:text-white transition-all border-l-2 border-transparent";
    }
  });

  // Toggle views
  const views = ['resumo', 'comportamento', 'conhecimento', 'configuracoes', 'testar', 'conversas'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // If opening sandbox for the first time
  if (tabName === 'testar' && sandboxHistory.length === 0 && appData) {
    initSandbox();
  }
};

// Render whole app
function renderAll() {
  if (!appData) return;

  // 1. Topbar and Organization info
  document.getElementById('topbar-org-name').textContent = appData.organization.name;
  document.getElementById('dashboard-org-title').textContent = `Painel Geral — ${appData.organization.name}`;
  document.getElementById('sidebar-org-name').textContent = appData.organization.name;
  document.getElementById('sidebar-user-name').textContent = appData.organization.doctor;
  document.getElementById('topbar-model').textContent = appData.settings.model.split('/').pop() || appData.settings.model;

  // Master switches sync
  const isAiActive = appData.settings.active;
  document.getElementById('master-ai-toggle').checked = isAiActive;
  document.getElementById('topbar-ai-toggle').checked = isAiActive;
  updateAiStatusText(isAiActive);

  // 2. Resumo: Telemetry Channels
  renderChannels();

  // 3. Resumo: Recent Conversations
  renderRecentConversations();

  // 4. Comportamento Tab
  document.getElementById('input-assistant-name').value = appData.behavior.assistantName;
  document.getElementById('input-assistant-role').value = appData.behavior.role;
  document.getElementById('textarea-welcome-message').value = appData.behavior.welcomeMessage;
  document.getElementById('welcome-char-count').textContent = `${appData.behavior.welcomeMessage.length} chars`;
  document.getElementById('textarea-system-instructions').value = appData.behavior.systemInstructions;
  
  // Sandbox header updates
  const botHeader = document.getElementById('sandbox-bot-header-name');
  if (botHeader) {
    botHeader.innerHTML = `${appData.behavior.assistantName} • Especialista Virtual <span class="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-normal">Online</span>`;
  }
  const botAvatar = document.getElementById('sandbox-avatar');
  if (botAvatar) {
    botAvatar.textContent = appData.behavior.assistantName.charAt(0);
  }
  const typingName = document.getElementById('sandbox-typing-name');
  if (typingName) {
    typingName.textContent = `${appData.behavior.assistantName} está digitando...`;
  }

  renderToneSelector();
  renderRules();

  // 5. Conhecimento Tab
  document.getElementById('org-input-name').value = appData.organization.name;
  document.getElementById('org-input-doctor').value = `${appData.organization.doctor} (${appData.organization.cro || ''})`;
  document.getElementById('org-input-segment').value = appData.organization.segment;
  document.getElementById('org-input-address').value = appData.organization.address;
  document.getElementById('org-input-hours').value = appData.organization.hours;
  renderServices();
  renderFaqs();

  // 6. Configurações Tab
  document.getElementById('input-api-key').value = appData.settings.apiKey || '';
  document.getElementById('input-temperature').value = appData.settings.temperature || 0.3;
  document.getElementById('temp-val').textContent = appData.settings.temperature || 0.3;
  document.getElementById('input-max-tokens').value = appData.settings.maxTokens || 800;
  renderModelSelection();

  // 7. Conversas Tab
  renderConversationsTab();
}

// Master AI Switch Text
function updateAiStatusText(active) {
  const topText = document.getElementById('topbar-ai-status');
  const masterText = document.getElementById('master-ai-status-text');
  if (active) {
    topText.textContent = "Ligado";
    topText.className = "font-sora text-[10px] text-[#ffdad6] font-bold uppercase";
    masterText.textContent = "Respondendo WhatsApp & Web";
    masterText.className = "font-sora text-[11px] text-primary-container font-medium";
  } else {
    topText.textContent = "Pausado";
    topText.className = "font-sora text-[10px] text-zinc-500 font-bold uppercase";
    masterText.textContent = "Assistente em Pausa Operacional";
    masterText.className = "font-sora text-[11px] text-zinc-500 font-medium";
  }
}

// Master Toggle Listeners
async function setAiActive(active) {
  appData.settings.active = active;
  document.getElementById('master-ai-toggle').checked = active;
  document.getElementById('topbar-ai-toggle').checked = active;
  updateAiStatusText(active);

  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active })
  });
  showToast(active ? 'Assistente ativado nos canais!' : 'Assistente pausado.');
}

document.getElementById('master-ai-toggle').addEventListener('change', (e) => setAiActive(e.target.checked));
document.getElementById('topbar-ai-toggle').addEventListener('change', (e) => setAiActive(e.target.checked));

// Render Channels
function renderChannels() {
  const container = document.getElementById('channels-container');
  if (!container || !appData.channels) return;

  container.innerHTML = appData.channels.map(ch => `
    <div class="p-3 rounded-lg bg-[#161616] border border-white/[0.06] flex flex-col justify-between hover:bg-[#1f1f1f] transition-all">
      <div class="flex items-center justify-between mb-1">
        <span class="font-sora text-[10px] font-semibold text-zinc-400 uppercase truncate">${ch.name}</span>
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
      <div class="flex flex-col min-w-0">
        <span class="font-sora text-xs font-semibold text-white truncate">${ch.detail}</span>
        <span class="text-[11px] text-zinc-400 truncate">${ch.info}</span>
      </div>
    </div>
  `).join('');
}

// Render Recent Conversations on Dashboard
function renderRecentConversations() {
  const container = document.getElementById('recent-conversations-list');
  if (!container || !appData.conversations) return;

  container.innerHTML = appData.conversations.map(conv => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    return `
      <div class="p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] transition-colors flex items-center justify-between gap-4 cursor-pointer" onclick="openConversation('${conv.id}')">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-sora font-bold text-xs shrink-0">
            ${conv.customerName.charAt(0)}
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-white truncate">${conv.customerName}</span>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-sora uppercase bg-zinc-800 text-zinc-300">${conv.channel}</span>
            </div>
            <p class="text-xs text-zinc-400 truncate max-w-md">${lastMsg ? lastMsg.text : conv.intent}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="font-sora text-[11px] text-zinc-500 block">${conv.lastMessageTime}</span>
          <span class="font-sora text-[10px] text-emerald-400 uppercase font-semibold">${conv.status}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Tone Selector Render
function renderToneSelector() {
  const tone = appData.behavior.tone;
  document.querySelectorAll('#tone-selector .tone-btn').forEach(btn => {
    const btnTone = btn.getAttribute('data-tone');
    if (btnTone === tone) {
      btn.className = "tone-btn p-3 rounded border text-center transition-all bg-primary-container/20 border-primary-container text-white";
    } else {
      btn.className = "tone-btn p-3 rounded border border-white/[0.08] bg-[#202020] text-zinc-300 hover:text-white text-center transition-all";
    }
  });
}

document.querySelectorAll('#tone-selector .tone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    appData.behavior.tone = btn.getAttribute('data-tone');
    renderToneSelector();
  });
});

// Render Rules
function renderRules() {
  const container = document.getElementById('rules-list-container');
  if (!container || !appData.behavior.rules) return;

  container.innerHTML = appData.behavior.rules.map(rule => `
    <div class="flex items-center justify-between p-2.5 rounded bg-[#202020] border border-white/[0.06]">
      <div class="flex items-center gap-2 min-w-0 pr-2">
        <span class="material-symbols-outlined text-sm ${rule.critical ? 'text-primary-container' : 'text-zinc-400'}">
          ${rule.critical ? 'gavel' : 'rule'}
        </span>
        <span class="text-xs text-zinc-200 truncate">${rule.title}</span>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" ${rule.active ? 'checked' : ''} class="sr-only peer" onchange="toggleRule(${rule.id}, this.checked)"/>
        <div class="w-8 h-4 bg-zinc-700 rounded-full peer peer-checked:bg-primary-container transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
      </label>
    </div>
  `).join('');
}

window.toggleRule = function(ruleId, active) {
  const r = appData.behavior.rules.find(x => x.id === ruleId);
  if (r) r.active = active;
};

// Character count on welcome message
document.getElementById('textarea-welcome-message').addEventListener('input', (e) => {
  document.getElementById('welcome-char-count').textContent = `${e.target.value.length} chars`;
});

// Save Behavior
document.getElementById('btn-save-behavior').addEventListener('click', async () => {
  appData.behavior.assistantName = document.getElementById('input-assistant-name').value;
  appData.behavior.role = document.getElementById('input-assistant-role').value;
  appData.behavior.welcomeMessage = document.getElementById('textarea-welcome-message').value;
  appData.behavior.systemInstructions = document.getElementById('textarea-system-instructions').value;

  await fetch('/api/behavior', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appData.behavior)
  });
  showToast('Comportamento da IA atualizado com sucesso!');
});

// Save Organization
document.getElementById('btn-save-org').addEventListener('click', async () => {
  appData.organization.name = document.getElementById('org-input-name').value;
  appData.organization.segment = document.getElementById('org-input-segment').value;
  appData.organization.address = document.getElementById('org-input-address').value;
  appData.organization.hours = document.getElementById('org-input-hours').value;

  await fetch('/api/organization', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appData.organization)
  });
  renderAll();
  showToast('Dados da clínica salvos com sucesso!');
});

// Services Table Render
function renderServices() {
  const tbody = document.getElementById('services-table-body');
  if (!tbody || !appData.knowledge.services) return;

  document.getElementById('services-count').textContent = `${appData.knowledge.services.length} serviços cadastrados`;

  tbody.innerHTML = appData.knowledge.services.map(s => `
    <tr class="hover:bg-[#1d1d1d] transition-colors">
      <td class="py-3 px-4 font-semibold text-white">
        ${s.name}
        <span class="block text-[11px] text-zinc-500 font-normal">${s.category || 'Procedimento'}</span>
      </td>
      <td class="py-3 px-4 text-zinc-300 font-sora text-xs">${s.duration}</td>
      <td class="py-3 px-4 text-white font-sora text-xs font-bold text-primary-container">${s.price}</td>
      <td class="py-3 px-4 text-zinc-400 text-xs max-w-xs">${s.triage}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="editService('${s.id}')" class="text-zinc-400 hover:text-white mr-2" title="Editar">
          <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onclick="deleteService('${s.id}')" class="text-zinc-500 hover:text-red-500" title="Excluir">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

// Service Modal handlers
window.closeServiceModal = function() {
  document.getElementById('service-modal').classList.add('hidden');
};

document.getElementById('btn-add-service-modal').addEventListener('click', () => {
  document.getElementById('modal-service-title').textContent = "Adicionar Novo Procedimento";
  document.getElementById('srv-id').value = "";
  document.getElementById('srv-name').value = "";
  document.getElementById('srv-duration').value = "";
  document.getElementById('srv-price').value = "";
  document.getElementById('srv-triage').value = "";
  document.getElementById('service-modal').classList.remove('hidden');
});

window.editService = function(id) {
  const s = appData.knowledge.services.find(x => x.id === id);
  if (!s) return;
  document.getElementById('modal-service-title').textContent = "Editar Procedimento";
  document.getElementById('srv-id').value = s.id;
  document.getElementById('srv-name').value = s.name;
  document.getElementById('srv-duration').value = s.duration;
  document.getElementById('srv-price').value = s.price;
  document.getElementById('srv-triage').value = s.triage;
  document.getElementById('service-modal').classList.remove('hidden');
};

document.getElementById('service-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const service = {
    id: document.getElementById('srv-id').value || null,
    name: document.getElementById('srv-name').value,
    duration: document.getElementById('srv-duration').value,
    price: document.getElementById('srv-price').value,
    triage: document.getElementById('srv-triage').value
  };

  const res = await fetch('/api/knowledge/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
  const data = await res.json();
  appData.knowledge.services = data.services;
  renderServices();
  closeServiceModal();
  showToast('Procedimento salvo com sucesso!');
});

window.deleteService = async function(id) {
  if (!confirm('Deseja realmente remover este procedimento da base da IA?')) return;
  const res = await fetch(`/api/knowledge/services/${id}`, { method: 'DELETE' });
  const data = await res.json();
  appData.knowledge.services = data.services;
  renderServices();
  showToast('Procedimento excluído.');
};

// Render FAQs
function renderFaqs() {
  const container = document.getElementById('faqs-container');
  if (!container || !appData.knowledge.faqs) return;

  container.innerHTML = appData.knowledge.faqs.map(faq => `
    <div class="p-4 rounded-lg bg-[#202020] border border-white/[0.06] space-y-2 relative group">
      <div class="flex items-start justify-between gap-2">
        <h4 class="font-sora text-xs font-bold text-white">${faq.question}</h4>
        <button onclick="deleteFaq('${faq.id}')" class="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
      <p class="text-xs text-zinc-300 leading-relaxed">${faq.answer}</p>
    </div>
  `).join('');
}

window.deleteFaq = async function(id) {
  const res = await fetch(`/api/knowledge/faqs/${id}`, { method: 'DELETE' });
  const data = await res.json();
  appData.knowledge.faqs = data.faqs;
  renderFaqs();
  showToast('Pergunta removida.');
};

document.getElementById('btn-add-faq-modal').addEventListener('click', async () => {
  const question = prompt('Digite a pergunta frequente:');
  if (!question) return;
  const answer = prompt('Digite a resposta da clínica:');
  if (!answer) return;

  const res = await fetch('/api/knowledge/faqs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer })
  });
  const data = await res.json();
  appData.knowledge.faqs = data.faqs;
  renderFaqs();
  showToast('FAQ adicionada com sucesso!');
});

// Render Model Selection Matrix
function renderModelSelection() {
  const container = document.getElementById('models-selection-list');
  if (!container) return;

  const activeModel = appData.settings.model;

  container.innerHTML = AVAILABLE_MODELS.map(m => {
    const isSelected = m.id === activeModel;
    return `
      <div class="p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-primary-container/10 border-primary-container' : 'bg-[#202020] border-white/[0.06] hover:bg-[#282828]'}" onclick="selectModel('${m.id}')">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full ${isSelected ? 'bg-primary-container shadow-[0_0_8px_rgba(225,6,0,0.8)]' : 'bg-zinc-700'}"></div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-sora text-xs font-bold text-white">${m.name}</span>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-sora uppercase bg-zinc-800 text-zinc-300">${m.badge}</span>
            </div>
            <div class="text-[10px] text-zinc-400 mt-0.5 space-x-2">
              <span>${m.speed}</span> • <span>Entrada: ${m.inputPrice}</span> • <span>Saída: ${m.outputPrice}</span>
            </div>
          </div>
        </div>
        <span class="font-sora text-[10px] uppercase font-bold ${isSelected ? 'text-primary-container' : 'text-zinc-500'}">
          ${isSelected ? 'Ativo' : 'Selecionar'}
        </span>
      </div>
    `;
  }).join('');
}

window.selectModel = function(modelId) {
  appData.settings.model = modelId;
  renderModelSelection();
  document.getElementById('topbar-model').textContent = modelId.split('/').pop();
};

document.getElementById('input-temperature').addEventListener('input', (e) => {
  document.getElementById('temp-val').textContent = e.target.value;
});

window.toggleApiKeyVisibility = function() {
  const inp = document.getElementById('input-api-key');
  inp.type = inp.type === 'password' ? 'text' : 'password';
};

// Save Settings
document.getElementById('btn-save-settings').addEventListener('click', async () => {
  appData.settings.apiKey = document.getElementById('input-api-key').value;
  appData.settings.temperature = parseFloat(document.getElementById('input-temperature').value);
  appData.settings.maxTokens = parseInt(document.getElementById('input-max-tokens').value);

  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appData.settings)
  });
  showToast('Configurações salvas com sucesso!');
});

// ==================== SANDBOX CHAT LOGIC ====================
function initSandbox() {
  const container = document.getElementById('sandbox-messages-area');
  container.innerHTML = '';
  sandboxHistory = [];

  // Initial welcome message from bot
  appendSandboxMessage('bot', appData.behavior.welcomeMessage);
}

document.getElementById('btn-clear-sandbox').addEventListener('click', () => {
  initSandbox();
});

window.sendQuickPrompt = function(text) {
  document.getElementById('sandbox-input').value = text;
  document.getElementById('sandbox-form').dispatchEvent(new Event('submit'));
};

document.getElementById('sandbox-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('sandbox-input');
  const message = input.value.trim();
  if (!message) return;

  // Append user message
  appendSandboxMessage('user', message);
  input.value = '';

  // Show typing indicator
  const indicator = document.getElementById('sandbox-typing-indicator');
  indicator.classList.remove('hidden');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: sandboxHistory })
    });
    const data = await res.json();
    indicator.classList.add('hidden');

    if (data.reply) {
      appendSandboxMessage('bot', data.reply);
      if (data.provider) {
        document.getElementById('sandbox-engine-label').textContent = `Motor: ${data.provider} (${data.model || ''})`;
      }
    }
  } catch (err) {
    indicator.classList.add('hidden');
    appendSandboxMessage('bot', '⚠️ Erro de conexão com o servidor.');
  }
});

function appendSandboxMessage(sender, text) {
  sandboxHistory.push({ sender, text });
  const container = document.getElementById('sandbox-messages-area');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isUser = sender === 'user';
  const botInitial = appData?.behavior?.assistantName ? appData.behavior.assistantName.charAt(0) : 'A';
  const botName = appData?.behavior?.assistantName || 'Aura';

  const msgDiv = document.createElement('div');
  msgDiv.className = `flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;

  if (!isUser) {
    msgDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-sora font-bold text-xs shrink-0 mt-1 shadow-md">
        ${botInitial}
      </div>
      <div class="max-w-lg">
        <div class="bg-[#202020] border border-white/[0.08] p-3.5 rounded-2xl rounded-tl-none text-sm text-zinc-100 shadow-md whitespace-pre-wrap leading-relaxed">${text}</div>
        <span class="font-sora text-[10px] text-zinc-500 block mt-1 ml-1">${botName} • ${time}</span>
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="max-w-lg text-right">
        <div class="bg-primary-container text-white p-3.5 rounded-2xl rounded-tr-none text-sm shadow-md whitespace-pre-wrap leading-relaxed text-left">${text}</div>
        <span class="font-sora text-[10px] text-zinc-500 block mt-1 mr-1">Você • ${time}</span>
      </div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

// ==================== CONVERSATIONS TAB ====================
function renderConversationsTab() {
  const list = document.getElementById('conversations-sidebar-list');
  if (!list || !appData.conversations) return;

  document.getElementById('badge-conversas').textContent = appData.conversations.length;

  list.innerHTML = appData.conversations.map(conv => `
    <div class="p-3.5 hover:bg-[#202020] transition-colors cursor-pointer border-b border-white/[0.04]" onclick="openConversation('${conv.id}')">
      <div class="flex items-center justify-between mb-1">
        <span class="font-sora text-xs font-semibold text-white truncate">${conv.customerName}</span>
        <span class="text-[10px] font-sora text-zinc-500">${conv.lastMessageTime}</span>
      </div>
      <div class="text-[11px] text-zinc-400 truncate mb-1">${conv.customerPhone}</div>
      <div class="flex items-center justify-between">
        <span class="px-1.5 py-0.2 rounded text-[9px] font-sora uppercase bg-zinc-800 text-zinc-300">${conv.channel}</span>
        <span class="font-sora text-[10px] text-emerald-400 font-semibold">${conv.status}</span>
      </div>
    </div>
  `).join('');

  // Open first conversation by default
  if (appData.conversations.length > 0) {
    openConversation(appData.conversations[0].id);
  }
}

window.openConversation = function(convId) {
  if (currentTab !== 'conversas') {
    switchTab('conversas');
  }

  const conv = appData.conversations.find(c => c.id === convId);
  if (!conv) return;

  const detailBox = document.getElementById('conversation-detail-box');
  detailBox.innerHTML = `
    <!-- Top Details -->
    <div class="p-4 bg-[#1e1e1e] border-b border-white/[0.06] flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-sora font-bold text-sm">
          ${conv.customerName.charAt(0)}
        </div>
        <div>
          <h3 class="font-sora text-sm font-bold text-white">${conv.customerName}</h3>
          <p class="text-xs text-zinc-400">${conv.customerPhone} • Canal: <span class="text-primary-container font-semibold">${conv.channel}</span></p>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded-full text-xs font-sora font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        ${conv.status}
      </span>
    </div>

    <!-- Message Bubble Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#121212]">
      ${conv.messages.map(m => {
        const isClient = m.sender === 'customer';
        return `
          <div class="flex gap-2.5 ${isClient ? 'justify-start' : 'justify-end'}">
            <div class="max-w-md ${isClient ? 'bg-[#202020] text-zinc-100 rounded-tl-none border border-white/[0.08]' : 'bg-primary-container text-white rounded-tr-none'} p-3 rounded-2xl text-xs leading-relaxed shadow-sm">
              <span class="block font-sora text-[10px] font-bold mb-1 opacity-75">${isClient ? conv.customerName : 'Lúcia (IA)'}</span>
              ${m.text}
              <span class="block text-[9px] text-right mt-1 opacity-60">${m.time}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Read-only footer note -->
    <div class="p-3 bg-[#161616] border-t border-white/[0.06] text-center text-xs text-zinc-500">
      Histórico gravado automaticamente pela sincronização de canal.
    </div>
  `;
};

// Handle URL hash on init
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '') || 'resumo';
  switchTab(hash);
});

// Boot app
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  const initialHash = window.location.hash.replace('#', '') || 'resumo';
  switchTab(initialHash);
});
