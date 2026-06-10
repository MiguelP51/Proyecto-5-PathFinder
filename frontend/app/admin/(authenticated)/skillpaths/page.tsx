"use client";

import {
  Search,
  BookOpen,
  MonitorPlay,
  Layers,
  ThumbsUp,
  Plus,
  Edit2,
  Power,
  Trash2,
  ChevronDown
} from "lucide-react";

export default function SkillPathsPage() {
  // Datos hardcodeados basados en el PDF
  const skillpaths = [
    {
      id: 1,
      titulo: "Complete React Developer Course",
      proveedor: "Udemy",
      habilidad: "React",
      nivel: "Intermedio",
      duracion: "40 horas",
      estado: "Activo",
    },
    {
      id: 2,
      titulo: "UX Design Fundamentals",
      proveedor: "Coursera",
      habilidad: "UX Design",
      nivel: "Principiante",
      duracion: "24 horas",
      estado: "Activo",
    },
    {
      id: 3,
      titulo: "Advanced Python Programming",
      proveedor: "edX",
      habilidad: "Python",
      nivel: "Avanzado",
      duracion: "60 horas",
      estado: "Activo",
    },
    {
      id: 4,
      titulo: "Machine Learning Specialization",
      proveedor: "Coursera",
      habilidad: "Machine Learning",
      nivel: "Avanzado",
      duracion: "120 horas",
      estado: "Inactivo",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0E3E66] md:text-4xl">
            Gestión de SkillPaths
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Administra recursos de aprendizaje externos
          </p>
        </div>
        <button className="flex items-center gap-2 self-start rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 shadow-md shadow-purple-200 transition text-sm font-bold">
          <Plus className="h-4 w-4" />
          <span>Nuevo Recurso</span>
        </button>
      </section>

      {/* Tarjetas de Estadísticas */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">156</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Total SkillPaths</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <MonitorPlay className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">142</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Recursos Activos</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">34</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Habilidades Cubiertas</span>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-800">2,341</span>
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Recomendaciones Mes</span>
          </div>
        </article>
      </section>

      {/* Controles de Búsqueda y Filtrado */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 mb-2">Buscar y Filtrar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título o proveedor..."
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-slate-700 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Habilidad</label>
            <div className="relative">
              <select className="w-full h-11 rounded-xl border border-slate-200 pl-4 pr-10 text-sm outline-none appearance-none cursor-pointer hover:border-purple-500 transition text-slate-700 bg-slate-50/50 font-medium">
                <option>Todas</option>
                <option>React</option>
                <option>UX Design</option>
                <option>Python</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Nivel</label>
            <div className="relative">
              <select className="w-full h-11 rounded-xl border border-slate-200 pl-4 pr-10 text-sm outline-none appearance-none cursor-pointer hover:border-purple-500 transition text-slate-700 bg-slate-50/50 font-medium">
                <option>Todos</option>
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabla de Recursos */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col gap-1">
          <h2 className="text-base font-bold text-slate-800">Recursos de SkillPath</h2>
          <p className="text-xs text-slate-500">Lista de cursos y materiales recomendados</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50/50 border-b border-slate-200/60 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Habilidad</th>
                <th className="px-6 py-4">Nivel</th>
                <th className="px-6 py-4">Duración</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {skillpaths.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 truncate max-w-[200px] flex items-center gap-2">
                      {item.titulo}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.proveedor}</td>
                  <td className="px-6 py-4 text-slate-600">{item.habilidad}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.nivel === 'Principiante' ? 'bg-blue-50 text-blue-600' :
                      item.nivel === 'Intermedio' ? 'bg-purple-50 text-purple-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {item.nivel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{item.duracion}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      item.estado === 'Activo' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Activar/Desactivar">
                        <Power className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
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
