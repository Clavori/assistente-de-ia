'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  Smartphone,
  Globe,
  Bot,
  User,
  UserCheck,
  Sparkles,
  Send,
  AlertCircle,
  Clock,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  channel: string;
  interest: string | null;
}

interface MessageItem {
  id: string;
  sender: 'customer' | 'assistant' | 'agent';
  text: string;
  toolsUsed: string[] | null;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  channel: string;
  remoteId: string;
  status: 'bot_active' | 'human_takeover' | 'closed';
  needsHuman: boolean;
  contact: Contact | null;
  messages: MessageItem[];
  lastMessageAt: string;
}

export default function ConversasPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'needs_attention' | 'whatsapp' | 'web'>('all');
  const [search, setSearch] = useState('');
  const [agentInput, setAgentInput] = useState('');
  const [sendingAgentMsg, setSendingAgentMsg] = useState(false);
  const [togglingTakeover, setTogglingTakeover] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations?filter=${filter}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (!selectedId && data.conversations?.length > 0) {
          setSelectedId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
    }
  };

  const fetchActiveConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConversation(data.conversation);
      }
    } catch (err) {
      console.error('Erro ao buscar conversa ativa:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [filter, search]);

  useEffect(() => {
    if (selectedId) {
      fetchActiveConversation(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleToggleTakeover = async () => {
    if (!selectedId) return;
    setTogglingTakeover(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_takeover' })
      });
      if (res.ok) {
        await fetchActiveConversation(selectedId);
        await fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingTakeover(false);
    }
  };

  const handleSendAgentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || !selectedId || sendingAgentMsg) return;

    setSendingAgentMsg(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          text: agentInput.trim()
        })
      });
      if (res.ok) {
        setAgentInput('');
        await fetchActiveConversation(selectedId);
        await fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingAgentMsg(false);
    }
  };

  const toggleToolList = (msgId: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const isHumanTakeover = activeConversation?.status === 'human_takeover';

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bandeja de Conversas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhe em tempo real todos os atendimentos do WhatsApp e do chat web. Assuma o controle da conversa a qualquer momento.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('needs_attention')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              filter === 'needs_attention'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Precisam de Atenção</span>
          </button>
          <button
            onClick={() => setFilter('whatsapp')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'whatsapp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setFilter('web')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'web' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Web
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: List of conversations (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[740px] overflow-hidden">
          {/* Search box */}
          <div className="p-3.5 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome ou número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhuma conversa encontrada neste filtro.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedId === conv.id;
                const contactName = conv.contact?.name || conv.remoteId;
                const lastMsg = conv.messages?.[0]?.text || 'Conversa iniciada';
                const isTakeover = conv.status === 'human_takeover';

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-50 border-l-4 border-slate-900'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {conv.channel === 'whatsapp' ? (
                        <Smartphone className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Globe className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {contactName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mt-0.5 leading-relaxed">
                        {lastMsg}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2">
                        {isTakeover ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Controle Humano
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Bot className="w-2.5 h-2.5" />
                            IA Ativa
                          </span>
                        )}

                        {conv.contact?.interest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 truncate max-w-[140px]">
                            {conv.contact.interest}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Active Chat Details (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[740px] overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat View Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {activeConversation.contact?.name?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {activeConversation.contact?.name || activeConversation.remoteId}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700 uppercase">
                        {activeConversation.channel}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeConversation.contact?.phone || activeConversation.remoteId}
                    </p>
                  </div>
                </div>

                {/* Handover Toggle Button */}
                <div>
                  <button
                    onClick={handleToggleTakeover}
                    disabled={togglingTakeover}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition shadow-sm ${
                      isHumanTakeover
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {isHumanTakeover ? (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Devolver ao Assistente de IA</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Assumir o Controle Humano</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status bar if in human takeover */}
              {isHumanTakeover && (
                <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    O assistente de IA está pausado nesta conversa. Responda diretamente pelo campo abaixo.
                  </span>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {activeConversation.messages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  const isAssistant = msg.sender === 'assistant';
                  const isAgent = msg.sender === 'agent';
                  const tools = (msg.toolsUsed as string[]) || [];
                  const isToolsExpanded = expandedTools[msg.id] ?? false;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isAgent ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar */}
                      {isCustomer && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                          <User className="w-4 h-4" />
                        </div>
                      )}

                      {isAssistant && (
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-sm space-y-2 ${
                          isAgent
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : isAssistant
                            ? 'bg-slate-900 text-slate-100 rounded-tl-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {/* Sender Label */}
                        <div className="flex items-center justify-between gap-3 text-[10px] font-semibold opacity-80">
                          <span>
                            {isCustomer
                              ? activeConversation.contact?.name || 'Cliente'
                              : isAssistant
                              ? 'Andrade AI'
                              : 'Equipe Andrade (Você)'}
                          </span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                          {msg.text}
                        </div>

                        {/* Tools Accordion for Assistant */}
                        {isAssistant && tools.length > 0 && (
                          <div className="pt-2 border-t border-slate-800 text-[11px]">
                            <button
                              onClick={() => toggleToolList(msg.id)}
                              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>
                                {tools.length} {tools.length === 1 ? 'ferramenta utilizada' : 'ferramentas utilizadas'}
                              </span>
                              {isToolsExpanded ? (
                                <ChevronDown className="w-3 h-3 ml-0.5" />
                              ) : (
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              )}
                            </button>

                            {isToolsExpanded && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {tools.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isAgent && (
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Agent Reply Footer */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendAgentMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder={
                      isHumanTakeover
                        ? 'Digite sua resposta como atendente da equipe...'
                        : 'Para responder manualmente, clique primeiro em "Assumir o Controle"...'
                    }
                    disabled={!isHumanTakeover || sendingAgentMsg}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!isHumanTakeover || !agentInput.trim() || sendingAgentMsg}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-slate-400">
              Selecione uma conversa ao lado para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
