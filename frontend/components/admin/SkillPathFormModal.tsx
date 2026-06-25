import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import { SkillPath } from '@/app/admin/(authenticated)/skillpaths/page';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editingItem: SkillPath | null;
}

const DURATION_PATTERN = /^\d+(\.\d+)?\s*(hora|horas|minuto|minutos|min|h|dia|dias|semana|semanas|mes|meses)$/i;

export default function SkillPathFormModal({ onClose, onSuccess, editingItem }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subareas, setSubareas] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [subareaSearch, setSubareaSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    titulo: editingItem?.titulo || '',
    plataforma: editingItem?.plataforma || '',
    descripcion: editingItem?.descripcion || '',
    urlExterno: editingItem?.urlExterno || '',
    dificultad: editingItem?.dificultad || 'Principiante',
    duracionLabel: editingItem?.duracionLabel || '',
    subareaId: editingItem?.subareaId || '',
    esRecomendado: editingItem?.esRecomendado || false,
    estadoPublicacion: (editingItem as any)?.estadoPublicacion || 'ACTIVA'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const subareasData = await apiFetch<any[]>('/api/admin/subareas?soloActivos=true', {}, session?.backendJwt);
        setSubareas(subareasData || []);
        const areasData = await apiFetch<any[]>('/api/admin/areas?soloActivos=true', {}, session?.backendJwt);
        setAreas(areasData || []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    if (session?.backendJwt) {
      loadData();
    }
  }, [session]);

  useEffect(() => {
    if (editingItem && subareas.length > 0) {
      const sub = subareas.find(sa => String(sa.idSubarea) === String(editingItem.subareaId));
      if (sub) {
        setSubareaSearch(`${sub.areaNombre} > ${sub.nombre}`);
        setSelectedAreaId(sub.areaId);
      }
    }
  }, [editingItem, subareas]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#subarea-combobox-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredSubareas = subareas.filter(sa => {
    if (selectedAreaId && sa.areaId !== selectedAreaId) {
      return false;
    }
    if (subareaSearch) {
      const selectedText = `${sa.areaNombre} > ${sa.nombre}`;
      if (subareaSearch === selectedText) {
        return true;
      }
      const normalizedSearch = subareaSearch.toLowerCase();
      return sa.nombre.toLowerCase().includes(normalizedSearch) || sa.areaNombre.toLowerCase().includes(normalizedSearch);
    }
    return true;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const duracion = formData.duracionLabel.trim();
    if (duracion && !DURATION_PATTERN.test(duracion)) {
      setError('La duracion debe tener numero y unidad. Ejemplo: 6 horas.');
      return;
    }

    setLoading(true);

    try {
      if (editingItem) {
        await apiFetch(`/api/admin/manage-skillpaths/${editingItem.idSkillPath}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }, session?.backendJwt);
      } else {
        await apiFetch(`/api/admin/manage-skillpaths`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }, session?.backendJwt);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el SkillPath');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {editingItem ? 'Editar Plantilla Global' : 'Nueva Plantilla Global'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
              <input required name="titulo" value={formData.titulo} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Proveedor (Plataforma)</label>
              <input required name="plataforma" value={formData.plataforma} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Filtrar por Área (Opcional)</label>
              <select
                value={selectedAreaId}
                onChange={(e) => {
                  setSelectedAreaId(e.target.value);
                  const currentSub = subareas.find(sa => String(sa.idSubarea) === formData.subareaId);
                  if (currentSub && currentSub.areaId !== e.target.value && e.target.value !== '') {
                    setFormData(prev => ({ ...prev, subareaId: '' }));
                    setSubareaSearch('');
                  }
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white"
              >
                <option value="">-- Todas las Áreas --</option>
                {areas.map(a => (
                  <option key={a.idArea} value={a.idArea}>
                    {a.emoji || '📂'} {a.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div id="subarea-combobox-container" className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-1">Subárea Asociada</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar subárea..."
                  value={subareaSearch}
                  onChange={(e) => {
                    setSubareaSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white pr-10"
                />
                {formData.subareaId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, subareaId: '' }));
                      setSubareaSearch('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, subareaId: '' }));
                      setSubareaSearch('');
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-500 hover:bg-purple-50 cursor-pointer italic border-b border-slate-100"
                  >
                    -- Sin Asignar --
                  </div>
                  {filteredSubareas.map(sa => (
                    <div
                      key={sa.idSubarea}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subareaId: String(sa.idSubarea) }));
                        setSubareaSearch(`${sa.areaNombre} > ${sa.nombre}`);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-sm hover:bg-purple-50 cursor-pointer flex justify-between items-center ${
                        formData.subareaId === String(sa.idSubarea) ? 'bg-purple-50 font-bold text-purple-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{sa.areaNombre} &gt; {sa.nombre}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{sa.nivel}</span>
                    </div>
                  ))}
                  {filteredSubareas.length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400 text-center">
                      No se encontraron subáreas
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nivel</label>
              <select name="dificultad" value={formData.dificultad} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white">
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Duración (ej. 40 horas)</label>
              <input name="duracionLabel" value={formData.duracionLabel} onChange={handleChange} placeholder="6 horas" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Estado de Publicación</label>
              <select name="estadoPublicacion" value={formData.estadoPublicacion} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white">
                <option value="BORRADOR">Borrador</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">URL Externa</label>
              <input type="url" name="urlExterno" value={formData.urlExterno} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                maxLength={100}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 min-h-[60px] resize-y"
                placeholder="Breve descripción del SkillPath (máx. 100 caracteres)"
              />
              <div className="flex justify-end text-xs text-slate-400 mt-1">
                <span className={formData.descripcion.length >= 90 ? "text-amber-500 font-bold" : ""}>
                  {formData.descripcion.length}
                </span> / 100
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="esRecomendado" name="esRecomendado" checked={formData.esRecomendado} onChange={handleChange} className="rounded text-purple-600 focus:ring-purple-500" />
              <label htmlFor="esRecomendado" className="text-sm font-bold text-slate-700">Destacar como Recomendado</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
