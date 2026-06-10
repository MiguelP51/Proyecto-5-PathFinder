"use client";

import {
  RefreshCw,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  XCircle,
  EyeOff,
  Check,
  Upload
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function SincronizacionCursosPage() {
  const { data: session } = useSession();
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [enlacesRotos, setEnlacesRotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncingIds, setSyncingIds] = useState<number[]>([]);

  // Modal de Agregar Proveedor
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProvName, setNewProvName] = useState("");
  const [newProvApi, setNewProvApi] = useState(false);
  const [newProvApiUrl, setNewProvApiUrl] = useState("");
  const [addingProv, setAddingProv] = useState(false);

  useEffect(() => {
    if (!session?.backendJwt) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Obtener proveedores
        const provs: any[] = await apiFetch("/api/admin/sincronizacion/proveedores", {}, session.backendJwt);
        setProveedores(provs);

        // 2. Obtener enlaces rotos (agregando cursos de cada proveedor)
        let allRotos: any[] = [];
        for (const prov of provs) {
          try {
            const cursos: any[] = await apiFetch(`/api/admin/sincronizacion/proveedores/${prov.idProveedor}/cursos`, {}, session.backendJwt);
            const rotos = cursos.filter((c: any) => c.estadoEnlace !== "ACTIVO");
            allRotos = [...allRotos, ...rotos];
          } catch (err) {
            console.error("Error obteniendo cursos para", prov.nombre);
          }
        }
        setEnlacesRotos(allRotos);
      } catch (err: any) {
        setError(err.message || "Error al cargar la información.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.backendJwt]);

  const handleSync = async (idProveedor: number, soportaApi: boolean) => {
    if (!soportaApi) {
      alert("Este proveedor requiere carga masiva (CSV). Use la opción correspondiente.");
      return;
    }

    try {
      setSyncingIds(prev => [...prev, idProveedor]);
      await apiFetch(`/api/admin/sincronizacion/proveedores/${idProveedor}/sync`, { method: "POST" }, session?.backendJwt);
      alert("Sincronización iniciada en segundo plano.");
      // Forzar recarga simple para ver estado actualizado
      window.location.reload();
    } catch (err: any) {
      alert("Error al sincronizar: " + err.message);
    } finally {
      setSyncingIds(prev => prev.filter(id => id !== idProveedor));
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName) return;
    try {
      setAddingProv(true);
      const res = await apiFetch("/api/admin/sincronizacion/proveedores", {
        method: "POST",
        body: JSON.stringify({ 
          nombre: newProvName, 
          soportaApi: newProvApi,
          credenciales: newProvApiUrl
        })
      }, session?.backendJwt);
      setProveedores([...proveedores, res]);
      setIsAddModalOpen(false);
      setNewProvName("");
      setNewProvApi(false);
      setNewProvApiUrl("");
    } catch(err: any) {
      alert("Error al agregar proveedor: " + err.message);
    } finally {
      setAddingProv(false);
    }
  };

  const getLogoColor = (nombre: string) => {
    switch (nombre.toLowerCase()) {
      case 'coursera': return "bg-blue-600 text-white font-bold";
      case 'udemy': return "bg-purple-600 text-white font-bold";
      case 'platzi': return "bg-green-500 text-white font-bold";
      case 'linkedin learning': return "bg-blue-700 text-white font-bold";
      default: return "bg-slate-500 text-white font-bold";
    }
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return "Nunca";
    return new Date(fechaStr).toLocaleString();
  };

  if (loading) {
    return <div className="p-8 text-slate-500 flex items-center gap-2"><RefreshCw className="animate-spin h-5 w-5" /> Cargando catálogo...</div>;
  }

  if (error) {
    return <div className="p-8 text-rose-500 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> {error}</div>;
  }

  const provsConectados = proveedores.filter(p => p.estadoConexion === "CONECTADO").length;
  const totalCursos = proveedores.reduce((acc, p) => acc + (p.cursosImportados || 0), 0);
  const totalRotos = enlacesRotos.length;
  
  let ultimaSyncGlobal = "Nunca";
  const fechasSync = proveedores.map(p => p.ultimaSincronizacion).filter(Boolean);
  if (fechasSync.length > 0) {
    ultimaSyncGlobal = new Date(Math.max(...fechasSync.map(f => new Date(f).getTime()))).toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Catálogos de Cursos
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Sincronización con plataformas educativas externas
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0E3E66] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition"
        >
          + Agregar Proveedor
        </button>
      </section>

      {/* Tarjetas de Estadísticas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{provsConectados}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Proveedores Conectados</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{totalCursos}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Cursos Importados</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{totalRotos}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Enlaces Rotos</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">{ultimaSyncGlobal}</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Última Sincronización</span>
          </div>
        </article>
      </section>

      {/* Proveedores de Cursos */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Proveedores de Cursos</h2>
            <p className="text-xs text-slate-500">Gestiona las conexiones con plataformas educativas</p>
          </div>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {proveedores.map((prov) => {
            const isSyncing = syncingIds.includes(prov.idProveedor);
            return (
              <div key={prov.idProveedor} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${getLogoColor(prov.nombre)}`}>
                      {prov.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{prov.nombre}</h3>
                      <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                        prov.estadoConexion === 'CONECTADO' ? 'bg-purple-100 text-purple-700' :
                        prov.estadoConexion === 'INACTIVO' ? 'bg-pink-100 text-pink-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {prov.estadoConexion === 'CONECTADO' && <CheckCircle2 className="h-3 w-3" />}
                        {prov.estadoConexion === 'ERROR' && <AlertTriangle className="h-3 w-3" />}
                        {prov.estadoConexion}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-medium">Cursos Importados:</span>
                    <span className="text-slate-400 font-medium">Última Sincronización:</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="font-bold text-slate-700">{prov.cursosImportados}</span>
                    <span className="font-bold text-slate-700">{formatearFecha(prov.ultimaSincronizacion)}</span>
                  </div>
                </div>

                {prov.soportaApi ? (
                  <button 
                    onClick={() => handleSync(prov.idProveedor, prov.soportaApi)}
                    disabled={isSyncing}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 border border-slate-200 py-1.5 transition text-xs font-bold"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? "Sincronizando..." : "Sincronizar"}
                  </button>
                ) : (
                  <button 
                    onClick={() => alert("Función para subir CSV. Implementación en la siguiente fase.")}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 py-1.5 transition text-xs font-bold"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Subir Catálogo CSV
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Enlaces Rotos */}
      <section className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-rose-50 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <div>
            <h2 className="text-base font-bold text-rose-800">Enlaces Rotos Detectados</h2>
            <p className="text-xs text-rose-600">Cursos cuyas URLs ya no están disponibles ({totalRotos})</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {totalRotos === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No se encontraron enlaces rotos en el catálogo actual.</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead className="bg-rose-50/30 border-b border-rose-100 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">URL</th>
                  <th className="px-6 py-4">Última Verificación</th>
                  <th className="px-6 py-4">Error</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {enlacesRotos.map((enlace) => (
                  <tr key={enlace.idCurso} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4 text-xs font-bold text-slate-800 max-w-[200px] truncate">
                      {enlace.titulo}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500">{enlace.proveedorNombre}</td>
                    <td className="px-6 py-4 text-[10px] text-slate-400 font-mono max-w-[200px] truncate" title={enlace.url}>
                      <a href={enlace.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">Link</a>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatearFecha(enlace.ultimaVerificacion)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 whitespace-nowrap">
                        {enlace.estadoEnlace}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Ignorar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal Agregar Proveedor */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-[#0E3E66] mb-4">Agregar Nuevo Proveedor</h2>
            <form onSubmit={handleAddProvider} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de la plataforma</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 text-slate-700 font-medium" 
                  placeholder="Ej. Coursera, Platzi..."
                  value={newProvName}
                  onChange={e => setNewProvName(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="soportaApi"
                  checked={newProvApi}
                  onChange={e => setNewProvApi(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="soportaApi" className="text-sm font-medium text-slate-700">Soporta Sincronización por API</label>
              </div>
              {newProvApi && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">URL de API / Credenciales</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 text-slate-700 font-medium" 
                    placeholder="Ej. https://api.coursera.org/..."
                    value={newProvApiUrl}
                    onChange={e => setNewProvApiUrl(e.target.value)}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={addingProv}
                  className="bg-[#0E3E66] hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                  {addingProv ? "Guardando..." : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
