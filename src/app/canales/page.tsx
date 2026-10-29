'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone,
  Globe,
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Bot,
  Sparkles,
  PhoneCall,
  Save,
  Palette
} from 'lucide-react';
import Link from 'next/link';

export default function CanalesPage() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'webchat'>('whatsapp');

  // WhatsApp states
  const [waStatus, setWaStatus] = useState<'disconnected' | 'waiting_qr' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [waQr, setWaQr] = useState<string | null>(null);
  const [waPhone, setWaPhone] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [pairingPhone, setPairingPhone] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [requestingCode, setRequestingCode] = useState(false);
  const [pairingError, setPairingError] = useState('');

  // WebChat states
  const [chatEnabled, setChatEnabled] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#f20d16');
  const [welcomeMessage, setWelcomeMessage] = useState('Olá! Sou o assistente virtual da AndradeStudio. Como posso te ajudar hoje?');
  const [botName, setBotName] = useState('Andrade AI');
  const [savingWebChat, setSavingWebChat] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Fetch WhatsApp status and poll every 3s
  const fetchWhatsAppStatus = async () => {
    try {
      let savedSession: { connected?: boolean; phone?: string | null } | null = null;
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('andrade_wa_session');
          if (raw) savedSession = JSON.parse(raw);
        } catch {}
      }

      const query = savedSession?.connected
        ? `?keepConnected=true${savedSession.phone ? `&connectedPhone=${encodeURIComponent(savedSession.phone)}` : ''}`
        : '';

      const res = await fetch(`/api/channels/whatsapp${query}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'connected' || savedSession?.connected) {
          const phone = data.connectedNumber || savedSession?.phone || null;
          setWaStatus('connected');
          setWaQr(null);
          setWaPhone(phone);
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'andrade_wa_session',
              JSON.stringify({ connected: true, phone })
            );
          }
        } else {
          setWaStatus(data.status);
          setWaQr(data.qrCode);
          setWaPhone(data.connectedNumber);
          if (data.pairingCode) setPairingCode(data.pairingCode);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar status do WhatsApp:', err);
    }
  };

  // Fetch WebChat Config
  const fetchWebChatConfig = async () => {
    try {
      const res = await fetch('/api/channels/webchat');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setChatEnabled(data.config.enabled);
          setPrimaryColor(data.config.primaryColor);
          setWelcomeMessage(data.config.welcomeMessage);
          setBotName(data.config.botName);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar config do WebChat:', err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('andrade_wa_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.connected) {
            setWaStatus('connected');
            if (parsed.phone) setWaPhone(parsed.phone);
          }
        }
      } catch {}
    }
    fetchWhatsAppStatus();
    fetchWebChatConfig();
    const interval = setInterval(fetchWhatsAppStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Deseja realmente desconectar a sessão do WhatsApp?')) return;
    setDisconnecting(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('andrade_wa_session');
      }
      await fetch('/api/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' })
      });
      setWaStatus('waiting_qr');
      await fetchWhatsAppStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRestartWhatsApp = async () => {
    setWaLoading(true);
    setPairingCode(null);
    setPairingError('');
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('andrade_wa_session');
      }
      const res = await fetch('/api/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) setWaStatus(data.status);
        if (data.qrCode) setWaQr(data.qrCode);
      }
      await fetchWhatsAppStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setWaLoading(false);
    }
  };

  const handleRequestPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingPhone.trim()) return;
    setRequestingCode(true);
    setPairingError('');
    try {
      const res = await fetch('/api/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pairing_code', phone: pairingPhone })
      });
      const data = await res.json();
      if (!res.ok) {
        setPairingError(data.error || 'Erro ao gerar código de pareamento');
      } else if (data.pairingCode) {
        setPairingCode(data.pairingCode);
      }
    } catch {
      setPairingError('Falha ao solicitar código de pareamento');
    } finally {
      setRequestingCode(false);
    }
  };

  const handleSaveWebChat = async () => {
    setSavingWebChat(true);
    try {
      await fetch('/api/channels/webchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: chatEnabled,
          primaryColor,
          welcomeMessage,
          botName
        })
      });
      alert('Configurações do chat web salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configurações do chat.');
    } finally {
      setSavingWebChat(false);
    }
  };

  const embedScriptCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/widget/embed.js" async></script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedScriptCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Canais de Atendimento
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure as portas de entrada onde seu assistente de IA atenderá os clientes: WhatsApp oficial via Baileys e chat flutuante para seu site.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'whatsapp'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp (Baileys)</span>
          </button>
          <button
            onClick={() => setActiveTab('webchat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'webchat'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Chat para o seu Site</span>
          </button>
        </div>
      </div>

      {/* Tab 1: WhatsApp */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left card: QR and status (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  Conexão WhatsApp Web (Nativo)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conexão direta com a API Baileys. Sem intermediários ou custos por mensagem.
                </p>
              </div>

              {waStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Conectado
                </span>
              ) : waStatus === 'connecting' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  Sincronizando Aparelho...
                </span>
              ) : waStatus === 'waiting_qr' || waQr ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                  Aguardando Leitura do QR
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  Desconectado
                </span>
              )}
            </div>

            {/* QR Code display area */}
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
              {waStatus === 'connected' ? (
                <div className="text-center space-y-4 max-w-sm py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      WhatsApp Conectado e Operando!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      O assistente virtual da AndradeStudio está respondendo ativamente as mensagens recebidas neste número.
                    </p>
                  </div>
                  {waPhone && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 shadow-sm">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                      +{waPhone}
                    </div>
                  )}
                  <div>
                    <button
                      onClick={handleDisconnectWhatsApp}
                      disabled={disconnecting}
                      className="px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:opacity-90 transition shadow-sm disabled:opacity-50"
                    >
                      {disconnecting ? 'Desconectando...' : 'Desconectar WhatsApp'}
                    </button>
                  </div>
                </div>
              ) : waStatus === 'connecting' ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-[#f20d16]/15 border border-[#f20d16]/40 flex items-center justify-center text-[#ff4b52] mx-auto">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Sincronizando com seu WhatsApp...
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Mantenha o aplicativo do WhatsApp aberto no seu celular por alguns segundos enquanto concluímos a autenticação criptografada.
                    </p>
                  </div>
                </div>
              ) : waQr ? (
                <div className="text-center space-y-4 w-full">
                  <div
                    style={{ backgroundColor: '#ffffff' }}
                    className="p-4 rounded-2xl border-2 border-white shadow-[0_0_35px_rgba(255,255,255,0.12)] inline-block"
                  >
                    <img
                      src={waQr}
                      alt="WhatsApp QR Code"
                      className="w-64 h-64 object-contain rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900">
                      Escaneie o QR Code com seu WhatsApp
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Abra o WhatsApp no celular → Aparelhos Conectados → Conectar um aparelho.
                    </p>
                    <button
                      onClick={handleRestartWhatsApp}
                      disabled={waLoading}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#ff4b52] hover:underline pt-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${waLoading ? 'animate-spin' : ''}`} />
                      <span>Gerar novo QR Code</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      Pronto para conectar
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Clique no botão abaixo para gerar o código QR de conexão instantaneamente.
                    </p>
                  </div>
                  <button
                    onClick={handleRestartWhatsApp}
                    disabled={waLoading}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${waLoading ? 'animate-spin' : ''}`} />
                    <span>{waLoading ? 'Gerando QR Code...' : 'Iniciar Conexão e Gerar QR Code'}</span>
                  </button>
                </div>
              )}

              {/* Alternative: Pairing Code by Phone Number */}
              {waStatus !== 'connected' && (
                <div className="w-full pt-5 border-t border-slate-200/80 max-w-md mx-auto">
                  <p className="text-xs font-bold text-slate-800 text-center mb-2">
                    Ou conecte digitando seu número (Código de 8 dígitos):
                  </p>
                  <form onSubmit={handleRequestPairingCode} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pairingPhone}
                      onChange={(e) => setPairingPhone(e.target.value)}
                      placeholder="Ex: 5511999998888 (com DDI 55 e DDD)"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={requestingCode || !pairingPhone.trim()}
                      className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 shrink-0"
                    >
                      {requestingCode ? 'Gerando...' : 'Gerar Código'}
                    </button>
                  </form>

                  {pairingError && (
                    <p className="text-[11px] text-rose-500 mt-2 text-center">{pairingError}</p>
                  )}

                  {pairingCode && (
                    <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Digite este código no seu WhatsApp:
                      </span>
                      <span className="text-xl font-mono font-extrabold tracking-widest text-[#ff4b52] block">
                        {pairingCode}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        No WhatsApp: Aparelhos Conectados → Conectar um aparelho → Conectar com número de telefone
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Persistence note */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold block">Sessão Persistente em Disco</span>
                <span className="text-[11px] text-blue-700 leading-relaxed block mt-0.5">
                  As credenciais de autenticação ficam salvas na pasta configurada (<code className="font-mono bg-blue-100/60 px-1 py-0.5 rounded">.whatsapp_auth</code>), permitindo que o bot reconecte automaticamente após reinicializações do servidor sem precisar escanear o QR code novamente.
                </span>
              </div>
            </div>
          </div>

          {/* Right card: Instructions (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              Como conectar seu WhatsApp:
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Abra o WhatsApp no seu celular</span>
                  <span className="text-slate-500">Pode ser conta WhatsApp pessoal ou WhatsApp Business.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Acesse Aparelhos Conectados</span>
                  <span className="text-slate-500">Toque nos três pontinhos no Android ou em Configurações no iPhone.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Aponte a câmera para o QR Code</span>
                  <span className="text-slate-500">Em segundos a sessão será sincronizada e o assistente começará a responder automaticamente.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Arquitetura de Processos:
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Processo Web (Next.js):</span>
                  <span className="text-emerald-600 font-bold">Porta 3000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Processo Worker (Node.js):</span>
                  <span className="text-emerald-600 font-bold">Baileys Ativo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Banco de Dados:</span>
                  <span className="text-emerald-600 font-bold">PostgreSQL Local</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WebChat Widget */}
      {activeTab === 'webchat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Configuration form (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chat para o seu Site
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Burbulha de chat flutuante para captar leads e agendar reuniões em qualquer página web.
                </p>
              </div>

              {/* Master toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={chatEnabled}
                  onChange={(e) => setChatEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome do Assistente no Chat:
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  Cor Principal da Marca (Hex):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mensagem de Boas-Vindas Inicial:
                </label>
                <textarea
                  rows={3}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveWebChat}
                  disabled={savingWebChat}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingWebChat ? 'Salvando...' : 'Salvar Personalização do Chat'}</span>
                </button>
              </div>
            </div>

            {/* Embed snippet code block */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Código de Incorporação (Script):
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 select-all">
                {embedScriptCode}
              </pre>
              <p className="text-[11px] text-slate-400">
                Cole este script antes do fechamento da tag <code className="text-slate-600">&lt;/body&gt;</code> de qualquer site (WordPress, Webflow, Landing Pages ou HTML puro).
              </p>
            </div>

            {/* Link to demo */}
            <div className="pt-2">
              <Link
                href="/demo"
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition shadow-sm"
              >
                <span>Ver Demonstração ao Vivo na Página /demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Live Interactive Widget Preview (6 cols) */}
          <div className="lg:col-span-6 bg-slate-100 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[580px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Vista Prévia em Tempo Real
            </div>

            {/* Mock website window with widget */}
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden flex flex-col h-[480px]">
              {/* Browser bar */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold">{botName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Online agora
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">✕</div>
              </div>

              {/* Chat body */}
              <div className="flex-1 p-4 bg-slate-50 space-y-3 overflow-y-auto text-xs">
                {/* Assistant bubble */}
                <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-slate-800 shadow-sm leading-relaxed">
                  {welcomeMessage}
                </div>

                {/* Customer mock bubble */}
                <div
                  className="max-w-[80%] ml-auto p-3 rounded-2xl rounded-tr-none text-white shadow-sm leading-relaxed"
                  style={{ backgroundColor: primaryColor }}
                >
                  Olá! Gostaria de agendar uma reunião de demonstração.
                </div>

                {/* Assistant mock reply */}
                <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-slate-800 shadow-sm leading-relaxed">
                  Com certeza! Temos horários livres para amanhã às 09:30, 11:00 ou 14:30. Qual prefere? 📅
                </div>
              </div>

              {/* Chat input footer */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite uma mensagem..."
                  disabled
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  disabled
                  className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
