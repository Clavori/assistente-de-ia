'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Globe, 
  Download, 
  Save, 
  CheckCircle2, 
  X,
  Building2,
  Clock,
  HelpCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function ConocimientoPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Business
  const [business, setBusiness] = useState({
    name: '',
    activity: '',
    address: '',
    phone: '',
    website: ''
  });

  // Services
  const [services, setServices] = useState<any[]>([]);
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Form Service
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvDuration, setSrvDuration] = useState('30');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvPriceFrom, setSrvPriceFrom] = useState(false);
  const [srvRequiresTriage, setSrvRequiresTriage] = useState(false);

  // FAQs
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqModal, setFaqModal] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Import from Web Modal
  const [importModal, setImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedImportServices, setSelectedImportServices] = useState<number[]>([]);
  const [selectedImportFaqs, setSelectedImportFaqs] = useState<number[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [resBiz, resSrv, resFaq] = await Promise.all([
        fetch('/api/business').then(r => r.json()),
        fetch('/api/services').then(r => r.json()),
        fetch('/api/faqs').then(r => r.json())
      ]);

      if (resBiz.business) setBusiness(resBiz.business);
      if (resSrv.services) setServices(resSrv.services);
      if (resFaq.faqs) setFaqs(resFaq.faqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveBusinessData = async () => {
    try {
      await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
      });
      showNotification('Datos del negocio actualizados');
    } catch {
      alert('Error al guardar datos del negocio');
    }
  };

  // Service CRUD
  const openNewService = () => {
    setEditingService(null);
    setSrvName('');
    setSrvDesc('');
    setSrvDuration('30');
    setSrvPrice('');
    setSrvPriceFrom(false);
    setSrvRequiresTriage(false);
    setServiceModal(true);
  };

  const openEditService = (s: any) => {
    setEditingService(s);
    setSrvName(s.name);
    setSrvDesc(s.description || '');
    setSrvDuration(String(s.durationMinutes || 30));
    setSrvPrice(s.price ? String(s.price) : '');
    setSrvPriceFrom(Boolean(s.priceFrom));
    setSrvRequiresTriage(Boolean(s.requiresTriage));
    setServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingService ? editingService.id : undefined,
      name: srvName,
      description: srvDesc,
      durationMinutes: srvDuration,
      price: srvPrice,
      priceFrom: srvPriceFrom,
      requiresTriage: srvRequiresTriage
    };

    const method = editingService ? 'PUT' : 'POST';
    await fetch('/api/services', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setServiceModal(false);
    showNotification(editingService ? 'Servicio actualizado' : 'Servicio añadido');
    loadAll();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Deseas eliminar este servicio?')) return;
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    showNotification('Servicio eliminado');
    loadAll();
  };

  // FAQ CRUD
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: faqQuestion, answer: faqAnswer })
    });
    setFaqModal(false);
    setFaqQuestion('');
    setFaqAnswer('');
    showNotification('Pregunta frecuente añadida');
    loadAll();
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta frecuente?')) return;
    await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
    showNotification('Pregunta eliminada');
    loadAll();
  };

  // Import Web Action
  const handleStartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    setImporting(true);
    setImportResults(null);

    try {
      const res = await fetch('/api/knowledge/import-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al importar desde la web');
        return;
      }

      setImportResults(data.data);
      if (data.data.services) {
        setSelectedImportServices(data.data.services.map((_: any, idx: number) => idx));
      }
      if (data.data.faqs) {
        setSelectedImportFaqs(data.data.faqs.map((_: any, idx: number) => idx));
      }
    } catch {
      alert('Error al conectar con la web');
    } finally {
      setImporting(false);
    }
  };

  const handleSaveImportedItems = async () => {
    if (!importResults) return;

    // Save selected services
    for (const idx of selectedImportServices) {
      const s = importResults.services[idx];
      if (s) {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: s.name,
            description: s.description,
            durationMinutes: s.durationMinutes || 30,
            price: s.price,
            priceFrom: s.priceFrom,
            requiresTriage: s.requiresTriage
          })
        });
      }
    }

    // Save selected FAQs
    for (const idx of selectedImportFaqs) {
      const f = importResults.faqs[idx];
      if (f) {
        await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(f)
        });
      }
    }

    setImportModal(false);
    setImportResults(null);
    showNotification('Elementos importados guardados en la base de datos');
    loadAll();
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-slate-400 text-sm">
        Cargando base de conocimiento...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Base de Conocimiento</h1>
          <p className="text-sm text-slate-500 mt-1">
            Datos del negocio, catálogo de servicios, precios y preguntas frecuentes que alimentan a la IA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setImportModal(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>Importar desde una web</span>
          </button>
          <button
            onClick={openNewService}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo servicio</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Datos del Negocio Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Datos Principales del Negocio</h2>
          </div>
          <button
            onClick={saveBusinessData}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar datos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Nombre Comercial</label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Teléfono Principal</label>
            <input
              type="text"
              value={business.phone}
              onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Sitio Web</label>
            <input
              type="text"
              value={business.website || ''}
              onChange={(e) => setBusiness({ ...business, website: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">A qué se dedica (Actividad)</label>
            <input
              type="text"
              value={business.activity}
              onChange={(e) => setBusiness({ ...business, activity: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Dirección Física</label>
            <input
              type="text"
              value={business.address || ''}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Catálogo de Servicios */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Catálogo de Servicios y Tratamientos ({services.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Utilizado por la IA para consultar duración, precios y citar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Duración</th>
                <th className="py-3 px-4">Precio Oficial</th>
                <th className="py-3 px-4">Valoración Previa</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                    {s.name}
                    {s.description && (
                      <span className="block text-[11px] font-normal text-slate-500 truncate mt-0.5">
                        {s.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {s.durationMinutes} min
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.price !== null ? (
                      <span>
                        {s.priceFrom && <span className="font-normal text-slate-500 text-[10px] mr-1">Desde</span>}
                        {Number(s.price).toFixed(2)} €
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">A consultar</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.requiresTriage ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                        Requiere valoración
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Directo</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => openEditService(s)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Preguntas Frecuentes ({faqs.length})
            </h2>
          </div>
          <button
            onClick={() => setFaqModal(true)}
            className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir FAQ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((f) => (
            <div key={f.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5 relative group">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-900">{f.question}</h3>
                <button
                  onClick={() => handleDeleteFaq(f.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Servicio */}
      {serviceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <button onClick={() => setServiceModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="Ej: Limpieza dental con ultrasonidos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  placeholder="Detalles sobre lo que incluye..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={srvPriceFrom}
                    onChange={(e) => setSrvPriceFrom(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-700 font-medium">Precio base ("Desde...")</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={srvRequiresTriage}
                    onChange={(e) => setSrvRequiresTriage(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-700 font-medium">Requiere valoración clínica previa</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setServiceModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Guardar servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nueva FAQ */}
      {faqModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Nueva Pregunta Frecuente
              </h3>
              <button onClick={() => setFaqModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pregunta</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="¿Aceptáis pago con tarjeta o transferencia?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Respuesta oficial</label>
                <textarea
                  rows={4}
                  required
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Explicación clara..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setFaqModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Añadir pregunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Importar desde una Web */}
      {importModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Importar Conocimiento desde una Web
                </h3>
              </div>
              <button onClick={() => setImportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Pega la URL de la web del negocio. El servidor descargará la página principal y hasta cinco enlaces internos relevantes (servicios, precios, contacto) para extraer y estructurar el catálogo automáticamente.
            </p>

            <form onSubmit={handleStartImport} className="flex gap-2">
              <input
                type="url"
                required
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://tudominio.es"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={importing}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando web...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Escanear y Extraer</span>
                  </>
                )}
              </button>
            </form>

            {/* Import Results Preview */}
            {importResults && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Elementos detectados para guardar
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Selecciona los que deseas añadir a tu catálogo
                  </span>
                </div>

                {/* Services found */}
                {importResults.services && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">Servicios:</span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {importResults.services.map((s: any, idx: number) => {
                        const isSelected = selectedImportServices.includes(idx);
                        return (
                          <label key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 cursor-pointer text-xs">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedImportServices([...selectedImportServices, idx]);
                                  } else {
                                    setSelectedImportServices(selectedImportServices.filter(i => i !== idx));
                                  }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-slate-900"
                              />
                              <div>
                                <span className="font-semibold text-slate-900">{s.name}</span>
                                <span className="text-slate-400 text-[11px] block">{s.description}</span>
                              </div>
                            </div>
                            <span className="font-bold text-slate-700">{s.price ? `${s.price} €` : 'A consultar'}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* FAQs found */}
                {importResults.faqs && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-700 block">Preguntas frecuentes:</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {importResults.faqs.map((f: any, idx: number) => {
                        const isSelected = selectedImportFaqs.includes(idx);
                        return (
                          <label key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedImportFaqs([...selectedImportFaqs, idx]);
                                } else {
                                  setSelectedImportFaqs(selectedImportFaqs.filter(i => i !== idx));
                                }
                              }}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900"
                            />
                            <div>
                              <span className="font-semibold text-slate-900 block">{f.question}</span>
                              <span className="text-slate-500 text-[11px] block mt-0.5">{f.answer}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setImportModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveImportedItems}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Guardar seleccionados
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
