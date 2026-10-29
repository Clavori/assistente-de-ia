import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const config = await prisma.webChatConfig.findFirst({
    where: { id: 'default' }
  });

  const primaryColor = config?.primaryColor || '#f20d16';
  const botName = config?.botName || 'Andrade AI';
  const welcome = config?.welcomeMessage || 'Olá! Sou o assistente virtual da AndradeStudio. Como posso ajudar você hoje?';
  const enabled = config?.enabled ?? true;

  const script = `
(function() {
  if (!${enabled}) return;
  if (window.__atiende_chat_initialized) return;
  window.__atiende_chat_initialized = true;

  const hostUrl = "${process.env.APP_URL || 'http://localhost:3000'}";

  // Create Widget Elements
  const container = document.createElement('div');
  container.id = 'atiende-chat-widget-root';
  container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

  // Bubble Button
  const button = document.createElement('button');
  button.id = 'atiende-chat-bubble';
  button.style.cssText = 'width:60px;height:60px;border-radius:30px;background:${primaryColor};color:#fff;border:none;box-shadow:0 8px 24px rgba(0,0,0,0.18);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s cubic-bezier(0.16,1,0.3,1);outline:none;';
  button.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';

  button.onmouseenter = () => button.style.transform = 'scale(1.06)';
  button.onmouseleave = () => button.style.transform = 'scale(1)';

  // Chat Window
  const chatWindow = document.createElement('div');
  chatWindow.id = 'atiende-chat-window';
  chatWindow.style.cssText = 'display:none;position:absolute;bottom:75px;right:0;width:370px;height:520px;max-width:calc(100vw - 48px);max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,0.16);flex-direction:column;overflow:hidden;border:1px solid #e2e8f0;';

  // Window Header
  const header = document.createElement('div');
  header.style.cssText = 'background:#0f172a;color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:between;';
  header.innerHTML = \`
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:34px;height:34px;border-radius:50%;background:${primaryColor};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;">A</div>
      <div>
        <div style="font-weight:600;font-size:14px;">${botName}</div>
        <div style="font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;"></span>Online agora</div>
      </div>
    </div>
    <button id="atiende-close-btn" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;margin-left:auto;">✕</button>
  \`;

  // Messages Area
  const messagesArea = document.createElement('div');
  messagesArea.id = 'atiende-messages-area';
  messagesArea.style.cssText = 'flex:1;overflow-y:auto;padding:16px;background:#f8fafc;display:flex;flex-direction:column;gap:12px;font-size:13px;';

  // Initial welcome message
  const welcomeBubble = document.createElement('div');
  welcomeBubble.style.cssText = 'max-width:85%;padding:10px 14px;border-radius:14px;background:#fff;color:#1e293b;border:1px solid #e2e8f0;border-top-left-radius:2px;line-height:1.45;box-shadow:0 1px 2px rgba(0,0,0,0.03);';
  welcomeBubble.innerText = "${welcome}";
  messagesArea.appendChild(welcomeBubble);

  // Input Area
  const inputContainer = document.createElement('form');
  inputContainer.style.cssText = 'padding:12px 14px;background:#fff;border-top:1px solid #e2e8f0;display:flex;align-items:center;gap:8px;';
  inputContainer.innerHTML = \`
    <input id="atiende-user-input" type="text" placeholder="Digite uma mensagem..." style="flex:1;padding:9px 14px;border:1px solid #cbd5e1;border-radius:10px;font-size:13px;outline:none;" />
    <button type="submit" style="background:${primaryColor};color:#fff;border:none;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;">Enviar</button>
  \`;

  chatWindow.appendChild(header);
  chatWindow.appendChild(messagesArea);
  chatWindow.appendChild(inputContainer);

  container.appendChild(chatWindow);
  container.appendChild(button);
  document.body.appendChild(container);

  // Toggle Window
  let isOpen = false;
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      setTimeout(() => document.getElementById('atiende-user-input')?.focus(), 100);
    }
  }

  button.onclick = toggleChat;
  header.querySelector('#atiende-close-btn').onclick = toggleChat;

  // Chat message submission
  const history = [{ role: 'assistant', content: "${welcome}" }];

  inputContainer.onsubmit = async function(e) {
    e.preventDefault();
    const input = document.getElementById('atiende-user-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    history.push({ role: 'user', content: text });

    // Render user bubble
    const userBubble = document.createElement('div');
    userBubble.style.cssText = 'max-width:85%;margin-left:auto;padding:10px 14px;border-radius:14px;background:${primaryColor};color:#fff;border-top-right-radius:2px;line-height:1.45;';
    userBubble.innerText = text;
    messagesArea.appendChild(userBubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Typing bubble
    const typingBubble = document.createElement('div');
    typingBubble.style.cssText = 'max-width:85%;padding:8px 12px;border-radius:14px;background:#fff;color:#64748b;border:1px solid #e2e8f0;font-size:11px;';
    typingBubble.innerText = '${botName} está digitando...';
    messagesArea.appendChild(typingBubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    try {
      const res = await fetch(hostUrl + '/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      messagesArea.removeChild(typingBubble);

      const replyText = data.text || 'Sem resposta no momento.';
      history.push({ role: 'assistant', content: replyText });

      const botBubble = document.createElement('div');
      botBubble.style.cssText = 'max-width:85%;padding:10px 14px;border-radius:14px;background:#fff;color:#1e293b;border:1px solid #e2e8f0;border-top-left-radius:2px;line-height:1.45;box-shadow:0 1px 2px rgba(0,0,0,0.03);white-space:pre-wrap;';
      botBubble.innerText = replyText;
      messagesArea.appendChild(botBubble);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    } catch (err) {
      messagesArea.removeChild(typingBubble);
      const errorBubble = document.createElement('div');
      errorBubble.style.cssText = 'padding:8px 12px;background:#fef2f2;color:#991b1b;border-radius:10px;font-size:11px;';
      errorBubble.innerText = 'Falha ao conectar com o assistente virtual.';
      messagesArea.appendChild(errorBubble);
    }
  };
})();
  `.trim();

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}
