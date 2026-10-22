'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Save, 
  Eye, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  UserCheck
} from 'lucide-react';

export default function ComportamentoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Assistant state
  const [name, setName] = useState('Lumen AI');
  const [avatar, setAvatar] = useState('');
  const [tone, setTone] = useState('cercano');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [neverDoRules, setNeverDoRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  
  // Triggers
  const [escalateTriggers, setEscalateTriggers] = useState({
    complaint: true,
    urgent: true,
    asksHuman: true,
    unknownAnswer: true,
    customRule: ''
  });

  // Hours
  const [hoursConfig, setHoursConfig] = useState<any>({});
  const [afterHoursAction, setAfterHoursAction] = useState('continue_booking');

  // Full Prompt modal
  const [showPromptModal, setShowPromptModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [resAssistant, resBusiness] = await Promise.all([
          fetch('/api/assistant').then(r => r.json()),
          fetch('/api/business').then(r => r.json())
        ]);

        if (resAssistant.assistant) {
          const a = resAssistant.assistant;
          setName(a.name || 'Lumen AI');
          setAvatar(a.avatar || '');
          setTone(a.tone || 'cercano');
          setWelcomeMessage(a.welcomeMessage || '');
          setInstructions(a.instructions || '');
          setNeverDoRules(Array.isArray(a.neverDoRules) ? a.neverDoRules : []);
          if (a.escalateTriggers) {
            setEscalateTriggers(a.escalateTriggers);
          }
        }

        if (resBusiness.business) {
          const b = resBusiness.business;
          if (b.hoursConfig) setHoursConfig(b.hoursConfig);
          if (b.afterHoursAction) setAfterHoursAction(b.afterHoursAction);
        }
      } catch (err) {
        console.error('Erro ao carregar comportamento:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch('/api/assistant', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            avatar,
            tone,
            welcomeMessage,
            instructions,
            neverDoRules,
            escalateTriggers
          })
        }),
        fetch('/api/business', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hoursConfig,
            afterHoursAction
          })
        })
      ]);

      setToast('Comportamento salvo com sucesso!');
      setTimeout(() => setToast(''), 3000);
    } catch {
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const addNeverDoRule = () => {
    if (!newRule.trim()) return;
    setNeverDoRules([...neverDoRules, newRule.trim()]);
    setNewRule('');
  };

  const removeNeverDoRule = (index: number) => {
    setNeverDoRules(neverDoRules.filter((_, i) => i !== index));
  };

  const fullPromptText = `[PROMPT DE SISTEMA - VISUALIZAÇÃO DE SOMENTE LEITURA]

Você é ${name}, assistente virtual de atendimento ao cliente do negócio.
Tom de voz configurado: ${tone}.

MENSAGEM INICIAL:
"${welcomeMessage}"

INSTRUÇÕES PRINCIPAIS:
${instructions}

O QUE NUNCA DEVE FAZER:
${neverDoRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

QUANDO TRANSFERIR PARA UM HUMANO:
- Reclamação ou insatisfação: ${escalateTriggers.complaint ? 'SIM' : 'NÃO'}
- Urgência médica ou crítica: ${escalateTriggers.urgent ? 'SIM' : 'NÃO'}
- Pede para falar com uma pessoa: ${escalateTriggers.asksHuman ? 'SIM' : 'NÃO'}
- Não sabe a resposta com certeza: ${escalateTriggers.unknownAnswer ? 'SIM' : 'NÃO'}
${escalateTriggers.customRule ? `- Regra personalizada: ${escalateTriggers.customRule}` : ''}

POLÍTICA FORA DO HORÁRIO:
${afterHoursAction === 'continue_booking' ? 'Continuar atendendo e oferecer agendamentos nos horários livres.' : 'Anotar recado e avisar que o time entrará em contato no próximo expediente.'}
`;

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-slate-400 text-sm">
        Carregando configurações de comportamento...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comportamento</h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalidade, tom de voz, horários e regras de transbordo do seu assistente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPromptModal(true)}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Ver o prompt completo</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar alterações'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identidade e Tom */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Identidade e Tom de Voz</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome do Assistente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Ex: Lumen AI"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tom de Comunicação
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cercano', label: 'Acolhedor', desc: 'Caloroso e empático' },
                { id: 'profesional', label: 'Profissional', desc: 'Clínico e polido' },
                { id: 'directo', label: 'Direto', desc: 'Ágil e objetivo' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    tone === t.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs font-bold">{t.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${tone === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mensagem de Boas-Vindas (Primeiro contato)
            </label>
            <textarea
              rows={4}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
            <span className="text-[10px] text-slate-400 block text-right mt-1">
              {welcomeMessage.length} caracteres
            </span>
          </div>
        </div>

        {/* Quando passar a uma pessoa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Transbordo para Atendente Humano
            </h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Selecione as situações em que a IA deve pausar e transferir o atendimento imediatamente para sua equipe:
          </p>

          <div className="space-y-3 pt-1">
            {[
              { id: 'complaint', label: 'Reclamação ou insatisfação evidente do cliente' },
              { id: 'urgent', label: 'Urgência médica, dor aguda ou ocorrência crítica' },
              { id: 'asksHuman', label: 'O cliente pede expressamente para falar com uma pessoa' },
              { id: 'unknownAnswer', label: 'O assistente não sabe a resposta com total certeza' },
            ].map((item) => (
              <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={(escalateTriggers as any)[item.id] || false}
                  onChange={(e) => setEscalateTriggers({ ...escalateTriggers, [item.id]: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-medium text-slate-700 select-none">{item.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Regra personalizada de transbordo
            </label>
            <input
              type="text"
              value={escalateTriggers.customRule || ''}
              onChange={(e) => setEscalateTriggers({ ...escalateTriggers, customRule: e.target.value })}
              placeholder="Ex: Se o cliente mencionar febre alta, sangramento ou trauma recente"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Instruções livres */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Instruções de Sistema em Texto Livre
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Descreva o papel do assistente, detalhes do negócio e como ele deve se comportar nas conversas do dia a dia:
          </p>
          <textarea
            rows={6}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono leading-relaxed text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Coisas que NUNCA deve fazer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Regras Estritas: O que a IA NUNCA deve fazer
            </h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNeverDoRule())}
              placeholder="Ex: Nunca receitar remédios, analgésicos ou fechar diagnósticos médicos..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="button"
              onClick={addNeverDoRule}
              className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar regra</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {neverDoRules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-200/60 text-xs text-red-900">
                <div className="flex items-center gap-2 min-w-0 pr-3">
                  <span className="font-bold text-red-600 shrink-0">{idx + 1}.</span>
                  <span className="font-medium truncate">{rule}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeNeverDoRule(idx)}
                  className="text-red-400 hover:text-red-700 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Horários e Resposta fora de expediente */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Horário de Atendimento e Resposta Fora do Expediente
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              O que o assistente deve responder fora do horário comercial?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                afterHoursAction === 'continue_booking' ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900' : 'bg-slate-100/60 border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="afterHoursAction"
                  value="continue_booking"
                  checked={afterHoursAction === 'continue_booking'}
                  onChange={(e) => setAfterHoursAction(e.target.value)}
                  className="sr-only"
                />
                <span className="block text-xs font-bold text-slate-900">Continuar atendendo e agendar horário</span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  O assistente continua tirando dúvidas e permite que o cliente reserve horários disponíveis na agenda.
                </span>
              </label>

              <label className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                afterHoursAction === 'take_message' ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900' : 'bg-slate-100/60 border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="afterHoursAction"
                  value="take_message"
                  checked={afterHoursAction === 'take_message'}
                  onChange={(e) => setAfterHoursAction(e.target.value)}
                  className="sr-only"
                />
                <span className="block text-xs font-bold text-slate-900">Apenas anotar o recado</span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Avisa que a empresa está fechada, solicita nome e mensagem, e confirma retorno no início do próximo expediente.
                </span>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Ver prompt completo (somente leitura) */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Prompt do Sistema (Somente Leitura)
                </h3>
              </div>
              <button
                onClick={() => setShowPromptModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Este é o texto exato consolidado que o modelo de inteligência artificial recebe antes de responder a cada mensagem:
            </p>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {fullPromptText}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Fechar visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
