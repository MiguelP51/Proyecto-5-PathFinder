import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
}

export default function AreaFormModal({ onClose, onSuccess, editingItem }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nombre: editingItem?.nombre || '',
    emoji: editingItem?.emoji || '',
    descripcion: editingItem?.descripcion || '',
    imagenUrl: editingItem?.imagenUrl || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let resultArea: any;
      if (editingItem) {
        resultArea = await apiFetch<any>(`/api/admin/areas/${editingItem.idArea}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            emoji: formData.emoji,
            descripcion: formData.descripcion,
            imagenUrl: formData.imagenUrl
          })
        }, session?.backendJwt);
      } else {
        resultArea = await apiFetch<any>(`/api/admin/areas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            emoji: formData.emoji,
            descripcion: formData.descripcion,
            imagenUrl: ''
          })
        }, session?.backendJwt);
      }

      if (imageFile) {
        const areaIdForUpload = editingItem ? editingItem.idArea : resultArea.idArea;
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        await apiFetch(`/api/admin/areas/${areaIdForUpload}/imagen`, {
          method: 'POST',
          body: uploadFormData
        }, session?.backendJwt);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el Área');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {editingItem ? 'Editar Área' : 'Nueva Área'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
            <input required name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Recursos Humanos" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Emoji</label>
            <input name="emoji" value={formData.emoji} onChange={handleChange} placeholder="Ej. 🧑‍💼" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción de la especialidad..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500" rows={3} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Imagen del Área</label>
            {formData.imagenUrl && (
              <div className="mb-2 flex items-center gap-2">
                <img src={formData.imagenUrl.startsWith('areas/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/areas/${editingItem?.idArea}/imagen` : formData.imagenUrl} alt="Vista previa" className="h-12 w-12 rounded object-cover border" />
                <span className="text-xs text-slate-500">Imagen actual</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setImageFile(e.target.files[0]);
              }
            }} className="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-purple-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Área'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
