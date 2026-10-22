'use client';

import { useState, useEffect } from 'react';
import { 
  Radio, 
  MessageSquare, 
  CalendarCheck, 
  AlertCircle, 
  Clock, 
  Activity, 
  Power,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function ResumenPage() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [businessName, setBusinessName] = useState('Clínica Dental Lumen');
  const [toast, setToast] = useState('');

  // Stats
  const [stats, setStats] = useState({
    conversationsToday: 18,
    conversationsWeek: 84,
    appointmentsCreated: 7,
    waitingHuman: 2,
    avgResponseTime: '1.4s'
  });

  // Integrations status list
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [resAssistant, resBiz] = await Promise.all([
          fetch('/api/assistant').then(r => r.json()),
          fetch('/api/business').then(r => r.json())
        ]);

        if (resAssistant.assistant) {
          setActive(resAssistant.assistant.active !== false);
        }
        if (resBiz.business) {
          setBusinessName(resBiz.business.name || 'Clínica Dental Lumen');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleAssistantPower = async () => {
    const nextState = !active;
    setActive(nextState);
    try {
      await fetch('/api/assistant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState })
      });
      setToast(nextState ? 'Asistente encendido y respondiendo' : 'Asistente pausado temporalmente');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setActive(!nextState);
      alert('Error cambiando estado del asistente');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-slate-400 text-sm">
        Cargando resumen general...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Top Banner: Master Switch */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Panel de Control — {businessName}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resumen de Actividad
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervisa el estado del asistente, canales conectados y conversaciones en tiempo real.
          </p>
        </div>

        {/* Master Switch Box */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900">
              {active ? 'Asistente Encendido' : 'Asistente en Pausa'}
            </span>
            <span className="text-[11px] text-slate-500">
              {active ? 'Atendiendo WhatsApp y Web' : 'No responderá mensajes'}
            </span>
          </div>

          <button
            onClick={toggleAssistantPower}
            type="button"
            className={`w-14 h-8 rounded-full transition-colors relative p-1 shadow-inner ${
              active ? 'bg-slate-900' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform shadow-xs ${
                active ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversaciones Hoy</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{stats.conversationsToday}</span>
            <span className="text-xs text-slate-400 font-medium">Semana: {stats.conversationsWeek}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Citas Creadas</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-700">{stats.appointmentsCreated}</span>
            <span className="text-xs text-emerald-600 font-medium">+3 hoy</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Esperan a una Persona</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-700">{stats.waitingHuman}</span>
            <Link href="/conversaciones" className="text-xs font-semibold text-slate-900 hover:underline">
              Ver bandeja →
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiempo de Respuesta</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{stats.avgResponseTime}</span>
            <span className="text-xs text-emerald-600 font-medium">Inmediato</span>
          </div>
        </div>
      </div>

      {/* Canales e Integraciones Status Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Canales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Estado de Canales</h2>
            </div>
            <Link href="/canales" className="text-xs font-semibold text-slate-900 hover:underline">
              Gestionar
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">WhatsApp Oficial</span>
                <span className="text-[11px] text-slate-500">Conexión con Baileys QR</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                Esperando QR
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Chat Web (Widget)</span>
                <span className="text-[11px] text-slate-500">Disponible con script y página /demo</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Activo
              </span>
            </div>
          </div>
        </div>

        {/* Últimas Acciones del Asistente */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Últimas Acciones</h2>
            </div>
            <Link href="/actividad" className="text-xs font-semibold text-slate-900 hover:underline">
              Ver registro completo
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Derivación a humano (Dolor agudo)</span>
                <span className="text-[11px] text-slate-500">Javier Morales • WhatsApp</span>
              </div>
              <span className="text-[10px] text-slate-400">Hace 15 min</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Información de precios entregada</span>
                <span className="text-[11px] text-slate-500">Laura Gómez • Ortodoncia</span>
              </div>
              <span className="text-[10px] text-slate-400">Hace 42 min</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
