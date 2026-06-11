import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SkillPathBulkUploadModal({ onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = session?.backendJwt;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/manage-skillpaths/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en la carga');
      
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Carga Masiva de Plantillas</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!result ? (
            <>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 mb-1">Sube tu archivo CSV</p>
                <p className="text-xs text-slate-500 mb-4">El archivo debe contener cabeceras (Titulo, Plataforma, Habilidad, Nivel, etc.)</p>
                
                <label className="inline-block px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl cursor-pointer hover:bg-slate-50 transition shadow-sm">
                  Seleccionar Archivo
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                </label>

                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition">
                  Cancelar
                </button>
                <button 
                  onClick={handleUpload} 
                  disabled={!file || loading}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Iniciar Carga'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Carga Completada</h3>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-left grid grid-cols-2 gap-4 border border-slate-100">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Procesados</p>
                  <p className="text-xl font-black text-slate-700">{result.procesados}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Creados</p>
                  <p className="text-xl font-black text-emerald-600">{result.creados}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold">Errores</p>
                  <p className={`text-xl font-black ${result.errores > 0 ? 'text-red-600' : 'text-slate-700'}`}>{result.errores}</p>
                </div>
              </div>

              {result.detalleErrores && result.detalleErrores.length > 0 && (
                <div className="text-left text-xs text-red-600 bg-red-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                  <p className="font-bold mb-1">Detalle de errores:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.detalleErrores.map((err: string, i: number) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <button 
                onClick={onSuccess}
                className="w-full mt-4 px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
              >
                Cerrar y Actualizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
