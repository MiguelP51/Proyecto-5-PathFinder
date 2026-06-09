"use client";

import {
  RefreshCw,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  XCircle,
  EyeOff,
  Check
} from "lucide-react";

export default function SincronizacionCursosPage() {
  const proveedores = [
    {
      id: 1,
      nombre: "Coursera",
      estado: "Conectado",
      cursosImportados: "1,247",
      ultimaSincronizacion: "2026-06-01 08:30",
      logo: "bg-blue-600 text-white font-bold"
    },
    {
      id: 2,
      nombre: "Udemy",
      estado: "Conectado",
      cursosImportados: "3,421",
      ultimaSincronizacion: "2026-06-01 07:15",
      logo: "bg-purple-600 text-white font-bold"
    },
    {
      id: 3,
      nombre: "Platzi",
      estado: "Inactivo",
      cursosImportados: "0",
      ultimaSincronizacion: "Nunca",
      logo: "bg-green-500 text-white font-bold"
    },
    {
      id: 4,
      nombre: "LinkedIn Learning",
      estado: "Error",
      cursosImportados: "892",
      ultimaSincronizacion: "2026-05-31 18:45",
      logo: "bg-blue-700 text-white font-bold"
    }
  ];

  const enlacesRotos = [
    {
      id: 1,
      curso: "Introduction to Machine Learning",
      proveedor: "Coursera",
      url: "https://coursera.org/ml-intro-old",
      ultimaVerificacion: "2026-06-01",
      error: "404 Not Found"
    },
    {
      id: 2,
      curso: "Advanced React Patterns",
      proveedor: "Udemy",
      url: "https://udemy.com/react-advanced-2023",
      ultimaVerificacion: "2026-05-31",
      error: "Course removed"
    }
  ];

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
      </section>

      {/* Tarjetas de Estadísticas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">3</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Proveedores Conectados</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">5,560</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Cursos Importados</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">2</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Enlaces Rotos</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">Hoy</span>
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
          <button className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 shadow transition text-xs font-bold">
            <RefreshCw className="h-3.5 w-3.5" />
            Sincronizar Todos
          </button>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {proveedores.map((prov) => (
            <div key={prov.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${prov.logo}`}>
                    {prov.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{prov.nombre}</h3>
                    <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                      prov.estado === 'Conectado' ? 'bg-purple-100 text-purple-700' :
                      prov.estado === 'Inactivo' ? 'bg-pink-100 text-pink-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {prov.estado === 'Conectado' && <CheckCircle2 className="h-3 w-3" />}
                      {prov.estado === 'Error' && <AlertTriangle className="h-3 w-3" />}
                      {prov.estado}
                    </span>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Cursos Importados:</span>
                  <span className="text-slate-400 font-medium">Última Sincronización:</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="font-bold text-slate-700">{prov.cursosImportados}</span>
                  <span className="font-bold text-slate-700">{prov.ultimaSincronizacion}</span>
                </div>
              </div>

              <button className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-1.5 transition text-xs font-bold">
                <RefreshCw className="h-3.5 w-3.5" />
                Sincronizar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Enlaces Rotos */}
      <section className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-rose-50 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <div>
            <h2 className="text-base font-bold text-rose-800">Enlaces Rotos Detectados</h2>
            <p className="text-xs text-rose-600">Cursos cuyas URLs ya no están disponibles</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
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
                <tr key={enlace.id} className="hover:bg-slate-50/40 transition">
                  <td className="px-6 py-4 text-xs font-bold text-slate-800 max-w-[200px] truncate">
                    {enlace.curso}
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-500">{enlace.proveedor}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-mono max-w-[200px] truncate" title={enlace.url}>
                    {enlace.url}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{enlace.ultimaVerificacion}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 whitespace-nowrap">
                      {enlace.error}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Verificar
                      </button>
                      <button className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition flex items-center gap-1">
                        <EyeOff className="h-3 w-3" />
                        Ocultar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
