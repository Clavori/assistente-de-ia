'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Mail,
  FileSpreadsheet,
  MessageSquare,
  CreditCard,
  Webhook,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Settings,
  RefreshCw,
  Key,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
  Check,
  Copy,
  Lock
} from 'lucide-react';

interface IntegrationTool {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
}

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  category: string;
  authType: 'oauth' | 'api_key' | 'webhook';
  status: 'disconnected' | 'connected' | 'error';
  accountEmail: string | null;
  maskedToken?: string;
  settings: Record<string, any>;
  allowedTools: string[];
  tools: IntegrationTool[];
  errorMessage: string | null;
}

interface GoogleOAuthStatus {
  configured: boolean;
  source: 'env' | 'database' | 'unconfigured';
  redirectUri: string;
  maskedClientId: string | null;
}

export default function IntegracoesPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [googleOAuth, setGoogleOAuth] = useState<GoogleOAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [openConfigId, setOpenConfigId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    id: string;
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [topBanner, setTopBanner] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Google Cloud OAuth 2.0 Credentials Drawer
  const [showGoogleCredsModal, setShowGoogleCredsModal] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(
    '357298778550-34pcd4jjp8otp49g9tn1fhmsqaij8hiu.apps.googleusercontent.com'
  );
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [savingGoogleCreds, setSavingGoogleCreds] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [pendingGoogleProvider, setPendingGoogleProvider] = useState<string | null>(null);

  // Modal / Inputs state
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [editedSettings, setEditedSettings] = useState<Record<string, Record<string, any>>>({});
  const [selectedTools, setSelectedTools] = useState<Record<string, string[]>>({});

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
        if (data.googleOAuth) {
          setGoogleOAuth(data.googleOAuth);
        }

        const initialSettings: Record<string, Record<string, any>> = {};
        const initialTools: Record<string, string[]> = {};
        for (const item of data.integrations || []) {
          initialSettings[item.id] = { ...item.settings };
          initialTools[item.id] = [...item.allowedTools];
        }
        setEditedSettings(initialSettings);
        setSelectedTools(initialTools);
      }
    } catch (err) {
      console.error('Erro ao carregar integrações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const oauthSuccess = params.get('oauth_success');
      const oauthError = params.get('oauth_error');
      const email = params.get('email');

      if (oauthSuccess) {
        setTopBanner({
          text: `Autenticação Google OAuth 2.0 concluída com sucesso${email ? ` (${email})` : ''}! Token salvo com criptografia AES-256-GCM.`,
          type: 'success'
        });
        window.history.replaceState({}, '', '/integraciones');
      } else if (oauthError) {
        if (oauthError === 'missing_credentials') {
          setShowGoogleCredsModal(true);
          setTopBanner({
            text: 'Configure seu Client ID e Client Secret do Google Cloud abaixo para iniciar o login oficial OAuth 2.0.',
            type: 'error'
          });
        } else {
          setTopBanner({
            text: `Falha na autorização Google OAuth: ${oauthError}`,
            type: 'error'
          });
        }
        window.history.replaceState({}, '', '/integraciones');
      }
    }
  }, []);

  const handleSaveGoogleOAuthCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleClientId.trim() || !googleClientSecret.trim()) return;
    setSavingGoogleCreds(true);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_google_oauth_app',
          clientId: googleClientId.trim(),
          clientSecret: googleClientSecret.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar credenciais OAuth');

      setGoogleClientId('');
      setGoogleClientSecret('');
      setShowGoogleCredsModal(false);
      await loadIntegrations();

      if (pendingGoogleProvider) {
        const providerToLaunch = pendingGoogleProvider;
        setPendingGoogleProvider(null);
        await handleConnect(providerToLaunch, 'oauth');
      } else {
        setTopBanner({
          text: 'Credenciais Google Cloud salvas com sucesso! Agora clique em "Conectar com Google (OAuth 2.0)" em qualquer serviço Google.',
          type: 'success'
        });
      }
    } catch (err: any) {
      setTopBanner({
        text: err.message,
        type: 'error'
      });
    } finally {
      setSavingGoogleCreds(false);
    }
  };

  const handleConnect = async (provider: string, authType: string, connectAllGoogle = false) => {
    setSubmittingId(provider);
    try {
      const apiKey = apiKeyInputs[provider] || undefined;
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          action: 'connect',
          apiKey,
          connectAllGoogle,
          settings: editedSettings[provider],
          allowedTools: selectedTools[provider]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresGoogleCredentials) {
          setPendingGoogleProvider(provider);
          setShowGoogleCredsModal(true);
          setFeedbackMsg({
            id: provider,
            text: 'Configure seu Client ID e Client Secret do Google Cloud para abrir a tela de consentimento oficial.',
            type: 'error'
          });
          return;
        }
        throw new Error(data.error || 'Falha ao conectar');
      }

      if (data.requiresOAuthRedirect && data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }

      setFeedbackMsg({
        id: provider,
        text: 'Integração conectada com sucesso!',
        type: 'success'
      });
      await loadIntegrations();
    } catch (err: any) {
      setFeedbackMsg({
        id: provider,
        text: err.message,
        type: 'error'
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (
      !confirm(
        'Deseja realmente desconectar esta integração? O token criptografado será removido e o assistente perderá acesso às ferramentas relacionadas.'
      )
    ) {
      return;
    }

    setSubmittingId(provider);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          action: 'disconnect'
        })
      });

      if (!res.ok) throw new Error('Falha ao desconectar');

      setFeedbackMsg({
        id: provider,
        text: 'Integração desconectada e token revogado.',
        type: 'success'
      });
      await loadIntegrations();
    } catch (err: any) {
      setFeedbackMsg({
        id: provider,
        text: err.message,
        type: 'error'
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSaveSettings = async (provider: string) => {
    setSubmittingId(provider);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          action: 'update_settings',
          settings: editedSettings[provider],
          allowedTools: selectedTools[provider]
        })
      });

      if (!res.ok) throw new Error('Falha ao salvar configurações');

      setFeedbackMsg({
        id: provider,
        text: 'Configurações e permissões salvas!',
        type: 'success'
      });
      await loadIntegrations();
    } catch (err: any) {
      setFeedbackMsg({
        id: provider,
        text: err.message,
        type: 'error'
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleTestConnection = async (provider: string) => {
    setSubmittingId(provider);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          action: 'test_connection'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha no teste de conexão');

      setFeedbackMsg({
        id: provider,
        text: data.message || 'Conexão testada com sucesso!',
        type: 'success'
      });
    } catch (err: any) {
      setFeedbackMsg({
        id: provider,
        text: err.message,
        type: 'error'
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const toggleTool = (provider: string, toolId: string) => {
    const current = selectedTools[provider] || [];
    const exists = current.includes(toolId);
    const updated = exists ? current.filter((id) => id !== toolId) : [...current, toolId];

    setSelectedTools((prev) => ({
      ...prev,
      [provider]: updated
    }));
  };

  const updateSettingField = (provider: string, field: string, value: any) => {
    setEditedSettings((prev) => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [field]: value
      }
    }));
  };

  const copyRedirectUri = () => {
    const uri =
      googleOAuth?.redirectUri ||
      `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/integrations/google/callback`;
    navigator.clipboard.writeText(uri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const getProviderIcon = (id: string) => {
    switch (id) {
      case 'google_calendar':
        return <Calendar className="w-6 h-6 text-blue-500" />;
      case 'gmail':
        return <Mail className="w-6 h-6 text-red-500" />;
      case 'google_sheets':
        return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
      case 'slack':
        return <MessageSquare className="w-6 h-6 text-pink-500" />;
      case 'stripe':
        return <CreditCard className="w-6 h-6 text-indigo-500" />;
      case 'webhooks':
        return <Webhook className="w-6 h-6 text-amber-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-slate-400" />;
    }
  };

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const redirectUriDisplay =
    googleOAuth?.redirectUri ||
    `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/integrations/google/callback`;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Catálogo de Integrações
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {connectedCount} de {integrations.length} ativas
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Conecte suas contas reais via Google OAuth 2.0 e chaves de API para que o assistente consulte sua agenda, envie e-mails e salve leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowGoogleCredsModal(!showGoogleCredsModal)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-[#ff4b52]" />
            <span>
              {googleOAuth?.configured
                ? 'Credenciais Google OAuth (Configuradas)'
                : 'Configurar Google OAuth 2.0'}
            </span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AES-256-GCM</span>
          </div>
        </div>
      </div>

      {/* Top OAuth Callback Banner */}
      {topBanner && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 ${
            topBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {topBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{topBanner.text}</span>
          </div>
          <button
            onClick={() => setTopBanner(null)}
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Google Cloud OAuth 2.0 Configuration Panel */}
      {showGoogleCredsModal && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#ff4b52]" />
                Configuração Oficial Google OAuth 2.0 (Google Cloud Console)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Informe o <strong>Client ID</strong> e o <strong>Client Secret</strong> do seu projeto no Google Cloud (ou defina <code className="font-mono">GOOGLE_CLIENT_ID</code> e <code className="font-mono">GOOGLE_CLIENT_SECRET</code> no <code className="font-mono">.env</code> / Vercel). Os dados são salvos com criptografia AES-256-GCM.
              </p>
            </div>
            <button
              onClick={() => setShowGoogleCredsModal(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          {/* Redirect URI Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                URI de Redirecionamento Autorizado (Copie e cole no Google Cloud Console):
              </span>
              <button
                type="button"
                onClick={copyRedirectUri}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                {copiedRedirect ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar URI</span>
                  </>
                )}
              </button>
            </div>
            <code className="block text-xs font-mono text-slate-800 break-all select-all">
              {redirectUriDisplay}
            </code>
          </div>

          <form onSubmit={handleSaveGoogleOAuthCredentials} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Client ID:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 1234567890-abcde.apps.googleusercontent.com"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Client Secret:
              </label>
              <input
                type="password"
                required
                placeholder="Ex: GOCSPX-..."
                value={googleClientSecret}
                onChange={(e) => setGoogleClientSecret(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-500">
                {googleOAuth?.configured ? (
                  <span>
                    Status atual: <strong className="text-emerald-600">Configurado ({googleOAuth.source === 'env' ? 'Variáveis de Ambiente' : 'Banco Criptografado'})</strong>{' '}
                    {googleOAuth.maskedClientId && `(${googleOAuth.maskedClientId})`}
                  </span>
                ) : (
                  <span>Status atual: <strong className="text-amber-600">Aguardando Client ID & Secret</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {googleOAuth?.configured && (
                  <button
                    type="button"
                    onClick={() => handleConnect('google_calendar', 'oauth', true)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    Autorizar Todos os 3 Serviços Google de Uma Vez
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingGoogleCreds}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {savingGoogleCreds ? 'Salvando...' : 'Salvar Credenciais OAuth'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const isConnected = item.status === 'connected';
          const isConfigOpen = openConfigId === item.id;
          const isSubmitting = submittingId === item.id;
          const itemTools = selectedTools[item.id] || [];

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
                isConnected
                  ? 'border-emerald-200 ring-1 ring-emerald-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header of card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {getProviderIcon(item.id)}
                  </div>
                  <div>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Conectado (OAuth Real)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        Desconectado
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Account info when connected */}
                {isConnected && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    {item.accountEmail && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Conta Google:</span>
                        <span className="font-semibold text-slate-800">{item.accountEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Token AES-256:</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {item.maskedToken || '••••••••••••'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Feedback message */}
                {feedbackMsg && feedbackMsg.id === item.id && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                      feedbackMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {feedbackMsg.type === 'success' ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{feedbackMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl space-y-3">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleDisconnect(item.id)}
                        disabled={isSubmitting}
                        className="flex-1 py-2 px-3 text-xs font-medium text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition shadow-sm disabled:opacity-50"
                      >
                        Desconectar
                      </button>
                      <button
                        onClick={() => setOpenConfigId(isConfigOpen ? null : item.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{isConfigOpen ? 'Fechar' : 'Configurar'}</span>
                        {isConfigOpen ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (item.authType === 'api_key' || item.authType === 'webhook') {
                            setOpenConfigId(item.id);
                          } else {
                            handleConnect(item.id, item.authType);
                          }
                        }}
                        disabled={isSubmitting}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {item.category === 'google'
                            ? 'Conectar com Google (OAuth 2.0)'
                            : 'Conectar Integração'}
                        </span>
                      </button>
                      <button
                        onClick={() => setOpenConfigId(isConfigOpen ? null : item.id)}
                        className="p-2 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-sm transition"
                        title="Configurações e ferramentas"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Expanded configuration & tool checklist */}
                {isConfigOpen && (
                  <div className="pt-3 border-t border-slate-200 space-y-4">
                    {/* API Key Input for manual auth */}
                    {item.authType === 'api_key' && !isConnected && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                          Chave Secreta da API (Stripe Secret Key):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="sk_test_... ou sk_live_..."
                            value={apiKeyInputs[item.id] || ''}
                            onChange={(e) =>
                              setApiKeyInputs({ ...apiKeyInputs, [item.id]: e.target.value })
                            }
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                          <button
                            onClick={() => handleConnect(item.id, 'api_key')}
                            disabled={isSubmitting || !apiKeyInputs[item.id]}
                            className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Salvar Chave
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Specific settings based on provider */}
                    {item.id === 'google_calendar' && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">
                            Duração padrão das reuniões (minutos):
                          </label>
                          <input
                            type="number"
                            value={editedSettings[item.id]?.defaultDurationMinutes || 45}
                            onChange={(e) =>
                              updateSettingField(
                                item.id,
                                'defaultDurationMinutes',
                                Number(e.target.value)
                              )
                            }
                            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">
                            Intervalo entre agendamentos (minutos):
                          </label>
                          <input
                            type="number"
                            value={editedSettings[item.id]?.bufferBetweenAppointmentsMinutes || 15}
                            onChange={(e) =>
                              updateSettingField(
                                item.id,
                                'bufferBetweenAppointmentsMinutes',
                                Number(e.target.value)
                              )
                            }
                            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    {item.id === 'slack' && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">
                            Canal de Notificações do Slack:
                          </label>
                          <input
                            type="text"
                            value={editedSettings[item.id]?.channelName || '#alertas-ia'}
                            onChange={(e) =>
                              updateSettingField(item.id, 'channelName', e.target.value)
                            }
                            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                            placeholder="#geral ou #alertas"
                          />
                        </div>
                      </div>
                    )}

                    {item.id === 'stripe' && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">
                            Moeda padrão para cobrança:
                          </label>
                          <select
                            value={editedSettings[item.id]?.currency || 'BRL'}
                            onChange={(e) =>
                              updateSettingField(item.id, 'currency', e.target.value)
                            }
                            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                          >
                            <option value="BRL">BRL (R$ Real Brasileiro)</option>
                            <option value="USD">USD ($ Dólar Americano)</option>
                            <option value="EUR">EUR (€ Euro)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {item.id === 'webhooks' && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">
                            URL do Endpoint Webhook (POST):
                          </label>
                          <input
                            type="url"
                            value={editedSettings[item.id]?.endpointUrl || ''}
                            onChange={(e) =>
                              updateSettingField(item.id, 'endpointUrl', e.target.value)
                            }
                            placeholder="https://seu-sistema.com/api/webhook"
                            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">
                            Segredo de Assinatura (HMAC-SHA256):
                          </label>
                          <input
                            type="text"
                            value={editedSettings[item.id]?.secretKey || ''}
                            onChange={(e) =>
                              updateSettingField(item.id, 'secretKey', e.target.value)
                            }
                            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tools Checkboxes */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        O que o assistente pode fazer com esta ferramenta:
                      </span>
                      <div className="space-y-1.5">
                        {item.tools.map((tool) => {
                          const isChecked = itemTools.includes(tool.id);
                          return (
                            <label
                              key={tool.id}
                              className="flex items-start gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTool(item.id, tool.id)}
                                className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">
                                  {tool.name}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight">
                                  {tool.description}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer buttons of config drawer */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleTestConnection(item.id)}
                        disabled={isSubmitting}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium underline disabled:opacity-50"
                      >
                        Testar Conexão Real
                      </button>

                      <button
                        onClick={() => handleSaveSettings(item.id)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition disabled:opacity-50 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar Ajustes</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
