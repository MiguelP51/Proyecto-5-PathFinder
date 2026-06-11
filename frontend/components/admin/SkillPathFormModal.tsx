import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import { SkillPath } from '@/app/admin/(authenticated)/skillpaths/page';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editingItem: SkillPath | null;
}

export default function SkillPathFormModal({ onClose, onSuccess, editingItem }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    titulo: editingItem?.titulo || '',
    plataforma: editingItem?.plataforma || '',
    descripcion: editingItem?.descripcion || '',
    urlExterno: editingItem?.urlExterno || '',
    dificultad: editingItem?.dificultad || 'Principiante',
    duracionLabel: editingItem?.duracionLabel || '',
    areaNombre: editingItem?.areaNombre || '',
    esRecomendado: editingItem?.esRecomendado || false
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
    setLoading(true);
    setError('');

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
              <label className="block text-sm font-bold text-slate-700 mb-1">Área / Habilidad</label>
              <input name="areaNombre" value={formData.areaNombre} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
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
              <input name="duracionLabel" value={formData.duracionLabel} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">URL Externa</label>
              <input type="url" name="urlExterno" value={formData.urlExterno} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
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
