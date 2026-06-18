import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
}

export default function SubAreaFormModal({ onClose, onSuccess, editingItem }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [areas, setAreas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    areaId: editingItem?.areaId || '',
    nombre: editingItem?.nombre || '',
    emoji: editingItem?.emoji || '',
    descripcion: editingItem?.descripcion || '',
    objetivos: editingItem?.objetivos || '',
    habilidadesRelacionadas: editingItem?.habilidadesRelacionadas || '',
    nivel: editingItem?.nivel || 'Principiante',
    plataformasSkillPath: editingItem?.plataformasSkillPath || '',
    slug: editingItem?.slug || ''
  });

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const data = await apiFetch<any[]>('/api/admin/areas?soloActivos=true', {}, session?.backendJwt);
        setAreas(data || []);
        if (data && data.length > 0 && !formData.areaId) {
          setFormData(prev => ({ ...prev, areaId: data[0].idArea }));
        }
      } catch (err) {
        console.error('Error al cargar áreas para selector:', err);
      }
    };

    if (session?.backendJwt) {
      loadAreas();
    }
  }, [session, formData.areaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingItem) {
        await apiFetch(`/api/admin/subareas/${editingItem.idSubarea}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }, session?.backendJwt);
      } else {
        await apiFetch(`/api/admin/subareas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }, session?.backendJwt);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la Subárea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {editingItem ? 'Editar Subárea' : 'Nueva Subárea'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Área Asociada</label>
              <select name="areaId" value={formData.areaId} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white">
                {areas.map(a => (
                  <option key={a.idArea} value={a.idArea}>{a.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
              <input required name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Reclutamiento" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Emoji</label>
              <input name="emoji" value={formData.emoji} onChange={handleChange} placeholder="Ej. 🔍" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nivel</label>
              <select name="nivel" value={formData.nivel} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white">
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Plataformas Recomendadas</label>
              <input name="plataformasSkillPath" value={formData.plataformasSkillPath} onChange={handleChange} placeholder="Ej. Coursera, LinkedIn Learning" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} placeholder="Descripción de la subárea..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Objetivos de Aprendizaje</label>
              <textarea name="objetivos" value={formData.objetivos} onChange={handleChange} rows={3} placeholder="Ej. Aprender metodologías de reclutamiento, usar ATS..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Habilidades Relacionadas (separadas por coma)</label>
              <input name="habilidadesRelacionadas" value={formData.habilidadesRelacionadas} onChange={handleChange} placeholder="Ej. Selección, Entrevistas, Headhunting" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Slug (opcional - autogenerado)</label>
              <input name="slug" value={formData.slug} onChange={handleChange} placeholder="Ej. reclutamiento-y-seleccion" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Subárea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
