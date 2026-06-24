import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { X, Plus, Trash } from 'lucide-react';

interface OpcionDISC {
  idOpcionPreguntaDisc?: number;
  textoOpcion: string;
  valorRespuesta: number;
  ordenOpcion: number;
  categoriaDisc?: string;
}

interface FormDataDISC {
  enunciado: string;
  categoriaDisc: string;
  idTipoPreguntaDisc: number | string;
  ordenPregunta: number;
  imagenUrl: string;
  obligatoria: boolean;
  opciones: OpcionDISC[];
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
}

export default function DISCQuestionFormModal({ onClose, onSuccess, editingItem }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipos, setTipos] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormDataDISC>({
    enunciado: editingItem?.enunciado || '',
    categoriaDisc: editingItem?.categoriaDisc || 'D',
    idTipoPreguntaDisc: editingItem?.idTipoPreguntaDisc || '',
    ordenPregunta: editingItem?.ordenPregunta || 1,
    imagenUrl: editingItem?.imagenUrl || '',
    obligatoria: editingItem?.obligatoria !== false,
    opciones: editingItem?.opciones?.map((o: any) => ({
      idOpcionPreguntaDisc: o.idOpcionPreguntaDisc,
      textoOpcion: o.textoOpcion || '',
      valorRespuesta: o.valorRespuesta !== undefined ? o.valorRespuesta : 0,
      ordenOpcion: o.ordenOpcion || 1,
      categoriaDisc: o.categoriaDisc || 'D'
    })) || [
        { textoOpcion: '', valorRespuesta: 1, ordenOpcion: 1, categoriaDisc: 'D' },
        { textoOpcion: '', valorRespuesta: 2, ordenOpcion: 2, categoriaDisc: 'I' },
        { textoOpcion: '', valorRespuesta: 3, ordenOpcion: 3, categoriaDisc: 'S' },
        { textoOpcion: '', valorRespuesta: 4, ordenOpcion: 4, categoriaDisc: 'C' }
      ]
  });

  useEffect(() => {
    const loadTipos = async () => {
      try {
        const data = await apiFetch<any[]>('/api/admin/disc/questions/types', {}, session?.backendJwt);
        setTipos(data || []);
        if (data && data.length > 0 && !formData.idTipoPreguntaDisc) {
          setFormData(prev => ({ ...prev, idTipoPreguntaDisc: data[0].idTipoPreguntaDisc }));
        }
      } catch (err) {
        console.error('Error al cargar tipos de pregunta:', err);
      }
    };

    if (session?.backendJwt) {
      loadTipos();
    }
  }, [session, formData.idTipoPreguntaDisc]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const nuevasOpciones = [...prev.opciones];
      nuevasOpciones[index] = { ...nuevasOpciones[index], [field]: value };
      return { ...prev, opciones: nuevasOpciones };
    });
  };

  const agregarOpcion = () => {
    setFormData(prev => ({
      ...prev,
      opciones: [...prev.opciones, { textoOpcion: '', valorRespuesta: 0, ordenOpcion: prev.opciones.length + 1, categoriaDisc: 'D' }]
    }));
  };

  const eliminarOpcion = (index: number) => {
    setFormData(prev => {
      const nuevasOpciones = prev.opciones.filter((_, i) => i !== index).map((o, idx) => ({ ...o, ordenOpcion: idx + 1 }));
      return { ...prev, opciones: nuevasOpciones };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.opciones.length < 2) {
      setError('La pregunta debe tener al menos 2 opciones de respuesta.');
      return;
    }

    setLoading(true);

    try {
      if (editingItem) {
        await apiFetch(`/api/admin/disc/questions/${editingItem.idPreguntaDisc}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }, session?.backendJwt);
      } else {
        await apiFetch(`/api/admin/disc/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }, session?.backendJwt);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la pregunta DISC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {editingItem ? 'Editar Pregunta DISC' : 'Nueva Pregunta DISC'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Enunciado / Pregunta</label>
            <textarea required name="enunciado" value={formData.enunciado} onChange={handleChange} rows={3} placeholder="Ingrese la pregunta psicométrica..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Dimensión DISC Principal</label>
              <select name="categoriaDisc" value={formData.categoriaDisc} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white">
                <option value="D">D - Dominancia</option>
                <option value="I">I - Influencia</option>
                <option value="S">S - Estabilidad (Steadiness)</option>
                <option value="C">C - Cumplimiento (Conscientiousness)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Pregunta</label>
              <select name="idTipoPreguntaDisc" value={formData.idTipoPreguntaDisc} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white">
                {tipos.map(t => (
                  <option key={t.idTipoPreguntaDisc} value={t.idTipoPreguntaDisc}>{t.nombre} ({t.codigo})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Orden de Presentación</label>
              <input type="number" required name="ordenPregunta" value={formData.ordenPregunta} onChange={handleChange} min={1} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">URL de Imagen (opcional)</label>
              <input name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div className="flex items-center gap-2 pt-4 col-span-2">
              <input type="checkbox" id="obligatoria" name="obligatoria" checked={formData.obligatoria} onChange={handleChange} className="rounded text-purple-600 focus:ring-purple-500" />
              <label htmlFor="obligatoria" className="text-sm font-bold text-slate-700">Obligatoria para avanzar</label>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-800">Opciones de Respuesta y Pesos Psicométricos</h3>
              <button type="button" onClick={agregarOpcion} className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700">
                <Plus className="h-3 w-3" />
                <span>Añadir Opción</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.opciones.map((opcion, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>

                  <div className="flex-1">
                    <input required type="text" placeholder="Texto de la opción..." value={opcion.textoOpcion} onChange={(e) => handleOptionChange(idx, 'textoOpcion', e.target.value)} className="w-full bg-white border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-purple-500" />
                  </div>

                  <div className="w-20">
                    <select
                      value={opcion.categoriaDisc || 'D'}
                      onChange={(e) => handleOptionChange(idx, 'categoriaDisc', e.target.value)}
                      className="w-full bg-white border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-purple-500 bg-white"
                      title="Dimensión DISC"
                    >
                      <option value="D">D</option>
                      <option value="I">I</option>
                      <option value="S">S</option>
                      <option value="C">C</option>
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Valor"
                      value={opcion.valorRespuesta}
                      onChange={(e) => handleOptionChange(idx, 'valorRespuesta', parseInt(e.target.value) || 0)}
                      className="w-full bg-white border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-purple-500 text-center font-semibold"
                      title="Valor/Peso de la respuesta"
                    />
                  </div>

                  {formData.opciones.length > 2 && (
                    <button type="button" onClick={() => eliminarOpcion(idx)} className="text-slate-400 hover:text-red-600 transition">
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Pregunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
