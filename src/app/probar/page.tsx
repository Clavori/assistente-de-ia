'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Bot,
  User,
  Sparkles,
  Calendar,
  CalendarCheck,
  Mail,
  Users,
  MessageSquare,
  UserCheck,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

interface ToolStep {
  toolName: string;
  args: any;
  output: any;
  summary: string;
  simulated: boolean;
  success: boolean;
  durationMs: number;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  steps?: ToolStep[];
  escalated?: boolean;
  timestamp: string;
}

export default function ProbarPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [safeMode, setSafeMode] = useState(true);
  const [timelineSteps, setTimelineSteps] = useState<ToolStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [assistantName, setAssistantName] = useState('Andrade AI');
  const [modelSelected, setModelSelected] = useState('anthropic/claude-haiku-5.5');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial assistant config
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/assistant');
        if (res.ok) {
          const raw = await res.json();
          const data = raw.assistant || raw;
          if (data.name) setAssistantName(data.name);
          if (data.modelSelected) setModelSelected(data.modelSelected);
          if (typeof data.safeMode === 'boolean') setSafeMode(data.safeMode);

          // Initial welcome message from assistant
          setMessages([
            {
              id: 'welcome-msg',
              role: 'assistant',
              content:
                data.welcomeMessage ||
                'Olá! Seja bem-vindo à *AndradeStudio AI* 🚀 Sou o assistente virtual especializado em sites premium, apps e automações com IA. Como posso ajudar seu projeto hoje?',
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err) {
        console.error('Erro ao carregar configurações do assistente:', err);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleStepExpand = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: MessageItem = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setLoading(true);

    try {
      // Filter out only user and assistant text messages for the API
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          safeMode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro na resposta da inteligência artificial');
      }

      const assistantMsg: MessageItem = {
        id: 'msg-ast-' + Date.now(),
        role: 'assistant',
        content: data.text || 'Sem resposta de texto.',
        toolsUsed: data.toolsUsed || [],
        steps: data.steps || [],
        escalated: data.escalated || false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.steps && data.steps.length > 0) {
        setTimelineSteps((prev) => [...prev, ...data.steps]);
      }
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `❌ Ocorreu um erro ao processar sua mensagem: ${err.message}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTimelineSteps([]);
    setExpandedSteps({});
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        content: 'Olá! Conversa reiniciada. Como posso te ajudar hoje?',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'consultar_servicos':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'consultar_horarios_livres':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'agendar_horario':
        return <CalendarCheck className="w-4 h-4 text-emerald-700" />;
      case 'enviar_email_confirmacao':
        return <Mail className="w-4 h-4 text-indigo-600" />;
      case 'adicionar_contato_crm':
        return <Users className="w-4 h-4 text-amber-600" />;
      case 'notificar_equipe_slack':
        return <MessageSquare className="w-4 h-4 text-pink-600" />;
      case 'transferir_para_humano':
        return <UserCheck className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-600" />;
    }
  };

  const demoSuggestions = [
    'Quais serviços e soluções de IA vocês oferecem?',
    'Gostaria de agendar uma reunião de diagnóstico para amanhã às 14:30',
    'Quanto custa para criar um site institucional moderno com IA?',
    'Preciso falar urgente com um atendente humano sobre um projeto'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Testar Assistente (Sandbox)
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Simule o atendimento ao vivo como se fosse um cliente. Acompanhe a linha do tempo com a execução de ferramentas em tempo real para vídeos e demonstrações.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Safe Mode Switch */}
          <div
            onClick={() => setSafeMode(!safeMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition-all ${
              safeMode
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
            title="No Modo Seguro, ferramentas de escrita (agendamento, e-mails, CRM) são simuladas sem alterar sua agenda real."
          >
            {safeMode ? (
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            )}
            <div className="text-xs">
              <span className="font-semibold block">
                {safeMode ? 'Modo Seguro: ATIVO' : 'Modo Seguro: DESATIVADO'}
              </span>
              <span className="text-[10px] text-slate-500">
                {safeMode ? 'Ações de escrita simuladas' : 'Gravação real habilitada'}
              </span>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nova Conversa
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chat Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d0d14] rounded-2xl border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.6)] flex flex-col h-[750px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-[#12121c] border-b border-white/[0.08] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#f20d16]/50 shadow-[0_0_15px_rgba(242,13,22,0.4)] bg-[#050508] flex items-center justify-center">
                <img src="/assets/logo.png" alt="Andrade AI" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-bold font-display flex items-center gap-2">
                  {assistantName}
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-white/[0.06] text-[#c4c8d4] border border-white/[0.1]">
                    {modelSelected}
                  </span>
                </div>
                <div className="text-[11px] text-[#9ba0b0] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Atendimento oficial AndradeStudio
                </div>
              </div>
            </div>

            <div className="text-xs text-[#9ba0b0]">Canal: Web / WhatsApp</div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#08080d]">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#f20d16]/40 bg-[#050508] text-white flex items-center justify-center shrink-0 mt-1 shadow-[0_0_12px_rgba(242,13,22,0.3)]">
                      <img src="/assets/logo.png" alt="Bot" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-4 text-sm shadow-md ${
                      isUser
                        ? 'bg-gradient-to-br from-[#f20d16] to-[#b90710] text-white rounded-tr-none border border-white/15 shadow-[0_8px_24px_rgba(242,13,22,0.25)]'
                        : 'bg-[#13131f] text-[#f5f6fa] border border-white/[0.09] rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                          return <strong key={i} className="font-semibold text-white">{part.slice(1, -1)}</strong>;
                        }
                        return part;
                      })}
                    </div>

                    {/* Tools Badge */}
                    {m.toolsUsed && m.toolsUsed.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-medium text-[#9ba0b0]">Ferramentas:</span>
                        {m.toolsUsed.map((tool, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f20d16]/15 text-[#ff6b70] border border-[#f20d16]/30"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Escalated alert */}
                    {m.escalated && (
                      <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-[#f20d16]/15 border border-[#f20d16]/35 text-[#ff6b70] text-xs font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Atendimento transferido para atendente humano
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1 text-right ${
                        isUser ? 'text-white/75' : 'text-[#8b90a0]'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#f20d16]/20 border border-[#f20d16]/40 text-[#ff4b52] flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#f20d16]/40 bg-[#050508] text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 animate-pulse text-[#ff4b52]" />
                </div>
                <div className="bg-[#13131f] border border-white/[0.09] rounded-2xl rounded-tl-none p-3.5 text-xs text-[#c4c8d4] shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f20d16] animate-ping" />
                  {assistantName} está processando e consultando ferramentas...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="px-4 py-2.5 bg-[#0d0d14] border-t border-white/[0.07] overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#9ba0b0] uppercase tracking-wider shrink-0">
              Sugestões rápidas:
            </span>
            {demoSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                disabled={loading}
                className="whitespace-nowrap text-xs px-3 py-1 rounded-full bg-[#151522] text-[#c4c8d4] border border-white/[0.08] hover:border-[#f20d16]/50 hover:text-white transition shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3.5 bg-[#0d0d14] border-t border-white/[0.08]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite uma mensagem como cliente (ex: como ter um agente de IA?)..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#13131f] border border-white/[0.12] text-sm text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="btn-andrade px-5 py-2.5 text-white text-sm font-bold font-display rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Timeline of Tools Execution (5 cols) */}
        <div className="lg:col-span-5 bg-[#0d0d14] rounded-2xl border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.6)] flex flex-col h-[750px] overflow-hidden">
          {/* Timeline Header */}
          <div className="px-5 py-4 border-b border-white/[0.08] bg-[#12121c] flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f20d16]" />
                Linha do Tempo de Ferramentas
              </div>
              <p className="text-xs text-[#9ba0b0] mt-0.5">
                Passo a passo de cada tool chamada pelo modelo
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f20d16]/15 text-[#ff6b70] border border-[#f20d16]/30">
              {timelineSteps.length} {timelineSteps.length === 1 ? 'etapa' : 'etapas'}
            </span>
          </div>

          {/* Timeline Steps Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {timelineSteps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <div className="text-sm font-medium text-slate-600">
                  Nenhuma ferramenta acionada ainda
                </div>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Envie uma mensagem solicitando agendamento, serviços ou informações no chat ao lado para visualizar a execução ao vivo.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-4 pl-5">
                {timelineSteps.map((step, idx) => {
                  const isExpanded = expandedSteps[idx] ?? false;
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline circle icon */}
                      <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                        {getToolIcon(step.toolName)}
                      </div>

                      {/* Step Card */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition overflow-hidden">
                        <div className="p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              {step.toolName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {step.simulated ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  Simulado
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Sucesso
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {step.durationMs}ms
                              </span>
                            </div>
                          </div>

                          {/* Summary text */}
                          <div className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="font-medium">{step.summary}</span>
                          </div>

                          {/* Accordion Toggle */}
                          <button
                            onClick={() => toggleStepExpand(idx)}
                            className="mt-2.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>Ocultar detalhes JSON</span>
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-3.5 h-3.5" />
                                <span>Ver argumentos e resposta</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Collapsible JSON payload */}
                        {isExpanded && (
                          <div className="bg-slate-900 text-slate-100 p-3 text-[11px] font-mono border-t border-slate-800 space-y-2">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Argumentos de Entrada:
                              </div>
                              <pre className="overflow-x-auto p-1.5 bg-slate-950/60 rounded mt-1 text-emerald-400">
                                {JSON.stringify(step.args, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Retorno da Ferramenta:
                              </div>
                              <pre className="overflow-x-auto p-1.5 bg-slate-950/60 rounded mt-1 text-sky-300 max-h-48">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              {safeMode ? '🛡️ Executando em ambiente seguro' : '⚡ Conexão direta ativa'}
            </span>
            <button
              onClick={() => {
                setTimelineSteps([]);
                setExpandedSteps({});
              }}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Limpar etapas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
