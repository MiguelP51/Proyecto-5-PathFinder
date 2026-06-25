import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import { SkillPath } from '@/app/admin/(authenticated)/skillpaths/page';

interface Props {
  item: SkillPath;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickAssignSubareaModal({ item, onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [areas, setAreas] = useState<any[]>([]);
  const [subareas, setSubareas] = useState<any[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [subareaSearch, setSubareaSearch] = useState<string>('');
  const [subareaId, setSubareaId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const subData = await apiFetch<any[]>('/api/admin/subareas?soloActivos=true', {}, session?.backendJwt);
        setSubareas(subData || []);
        const areaData = await apiFetch<any[]>('/api/admin/areas?soloActivos=true', {}, session?.backendJwt);
        setAreas(areaData || []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    if (session?.backendJwt) {
      loadData();
    }
  }, [session]);

  useEffect(() => {
    if (item && subareas.length > 0) {
      const sub = subareas.find(sa => String(sa.idSubarea) === String(item.subareaId));
      if (sub) {
        setSubareaId(String(sub.idSubarea));
        setSubareaSearch(`${sub.areaNombre} > ${sub.nombre}`);
        setSelectedAreaId(sub.areaId);
      }
    }
  }, [item, subareas]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#subarea-quick-combobox-container')) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiFetch(`/api/admin/manage-skillpaths/${item.idSkillPath}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: item.titulo,
          plataforma: item.plataforma,
          descripcion: item.descripcion,
          urlExterno: item.urlExterno,
          dificultad: item.dificultad,
          duracionLabel: item.duracionLabel,
          esRecomendado: item.esRecomendado,
          estadoPublicacion: item.estadoPublicacion,
          subareaId: subareaId
        })
      }, session?.backendJwt);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al asignar la subárea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            Asignar Subárea Rápida
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div className="text-sm text-slate-500 mb-2">
            SkillPath: <span className="font-bold text-slate-800">{item.titulo}</span>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Filtrar por Área (Opcional)</label>
            <select
              value={selectedAreaId}
              onChange={(e) => {
                setSelectedAreaId(e.target.value);
                const currentSub = subareas.find(sa => String(sa.idSubarea) === subareaId);
                if (currentSub && currentSub.areaId !== e.target.value && e.target.value !== '') {
                  setSubareaId('');
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

          <div id="subarea-quick-combobox-container" className="relative">
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
              {subareaId && (
                <button
                  type="button"
                  onClick={() => {
                    setSubareaId('');
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
                    setSubareaId('');
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
                      setSubareaId(String(sa.idSubarea));
                      setSubareaSearch(`${sa.areaNombre} > ${sa.nombre}`);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-3 py-2 text-sm hover:bg-purple-50 cursor-pointer flex justify-between items-center ${
                      subareaId === String(sa.idSubarea) ? 'bg-purple-50 font-bold text-purple-700' : 'text-slate-700'
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

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition disabled:opacity-50">
              {loading ? 'Guardando...' : 'Asignar Subárea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
